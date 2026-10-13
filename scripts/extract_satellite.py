"""Extract monthly satellite indicators from Earth Engine for GeoCast.

Requires `earthengine-api` and local Google/Earth Engine authentication. The
default 5 km circular areas are provisional analysis areas, not district
boundaries. No Earth Engine credentials are stored in this repository.
"""
from __future__ import annotations

import argparse
import json
import os
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "satellite"
REGIONS = {
    "chengalpattu": (12.6819, 79.9888),
    "chennai": (13.0827, 80.2707),
    "kanchipuram": (12.8342, 79.7036),
}
LANDSAT = ("LANDSAT/LC08/C02/T1_L2", "LANDSAT/LC09/C02/T1_L2")
SENTINEL = "COPERNICUS/S2_SR_HARMONIZED"
CLOUD_SCORE = "GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED"


def month_range(start: str, end: str):
    year, month = map(int, start.split("-"))
    end_year, end_month = map(int, end.split("-"))
    while (year, month) <= (end_year, end_month):
        next_year, next_month = (year + 1, 1) if month == 12 else (year, month + 1)
        yield f"{year:04d}-{month:02d}", f"{next_year:04d}-{next_month:02d}-01"
        year, month = next_year, next_month


def landsat_image(ee, image):
    qa = image.select("QA_PIXEL")
    clear = qa.bitwiseAnd(63).eq(0).And(image.select("QA_RADSAT").eq(0))
    red = image.select("SR_B4").multiply(0.0000275).add(-0.2)
    nir = image.select("SR_B5").multiply(0.0000275).add(-0.2)
    swir = image.select("SR_B6").multiply(0.0000275).add(-0.2)
    ndvi = nir.subtract(red).divide(nir.add(red).add(0.000001)).rename("ndvi")
    ndbi = swir.subtract(nir).divide(swir.add(nir).add(0.000001)).rename("ndbi")
    lst = image.select("ST_B10").multiply(0.00341802).add(149).subtract(273.15).rename("lst_c")
    return ee.Image.cat([lst, ndvi, ndbi]).updateMask(clear)


def sentinel_image(ee, image):
    clear = image.select("cs_cdf").gte(0.60)
    green = image.select("B3")
    red = image.select("B4")
    red_edge = image.select("B5")
    nir = image.select("B8")
    ndwi = green.subtract(nir).divide(green.add(nir).add(1)).rename("ndwi")
    ndci = red_edge.subtract(red).divide(red_edge.add(red).add(1)).rename("ndci")
    return ee.Image.cat([ndwi, ndci]).updateMask(clear)


def monthly_feature(ee, landsat, sentinel, area, month, next_month):
    first = f"{month}-01"
    thermal = landsat.filterDate(first, next_month)
    optical = sentinel.filterDate(first, next_month)
    empty_landsat = ee.Image.constant([0, 0, 0]).rename(["lst_c", "ndvi", "ndbi"]).updateMask(ee.Image(0))
    empty_sentinel = ee.Image.constant([0, 0]).rename(["ndwi", "ndci"]).updateMask(ee.Image(0))
    # A fully masked fallback preserves band names in months with no scenes.
    landsat_median = thermal.merge(ee.ImageCollection([empty_landsat])).median()
    sentinel_median = optical.merge(ee.ImageCollection([empty_sentinel])).median()
    water = sentinel_median.select("ndwi").gt(0)
    ndci_over_water = sentinel_median.select("ndci").updateMask(water)
    combined = ee.Image.cat([landsat_median, sentinel_median.select("ndwi"), ndci_over_water])
    means = combined.reduceRegion(reducer=ee.Reducer.mean(), geometry=area, scale=120, maxPixels=10_000_000, tileScale=4)
    area_sum = ee.Image.pixelArea().updateMask(water).reduceRegion(
        reducer=ee.Reducer.sum(), geometry=area, scale=60, maxPixels=10_000_000, tileScale=4
    ).get("area")
    water_km2 = ee.Algorithms.If(
        ee.Algorithms.IsEqual(area_sum, None), None, ee.Number(area_sum).divide(1_000_000)
    )
    properties = ee.Dictionary({
        "month": month,
        "landsat_scenes": thermal.size(),
        "sentinel_scenes": optical.size(),
        "water_km2": water_km2,
    }).combine(means, overwrite=True)
    return ee.Feature(None, properties)


def extract_region(ee, project, region, start, end, radius_km):
    latitude, longitude = REGIONS[region]
    area = ee.Geometry.Point([longitude, latitude]).buffer(radius_km * 1000)
    l8 = ee.ImageCollection(LANDSAT[0]).filterBounds(area).filter(ee.Filter.eq("PROCESSING_LEVEL", "L2SP"))
    l9 = ee.ImageCollection(LANDSAT[1]).filterBounds(area).filter(ee.Filter.eq("PROCESSING_LEVEL", "L2SP"))
    landsat = l8.merge(l9).map(lambda image: landsat_image(ee, image))
    cloud_score = ee.ImageCollection(CLOUD_SCORE)
    sentinel = (ee.ImageCollection(SENTINEL).filterBounds(area)
                .linkCollection(cloud_score, ["cs_cdf"])
                .map(lambda image: sentinel_image(ee, image)))
    months = list(month_range(start, end))
    records = []
    # Year-size requests keep graph serialization and response sizes bounded.
    for offset in range(0, len(months), 12):
        chunk = months[offset:offset + 12]
        features = ee.FeatureCollection([
            monthly_feature(ee, landsat, sentinel, area, month, next_month)
            for month, next_month in chunk
        ])
        response = features.getInfo()
        records.extend(feature["properties"] for feature in response["features"])
        print(region, chunk[0][0], chunk[-1][0], len(response["features"]), flush=True)
    records.sort(key=lambda row: row["month"])
    result = {
        "project": project,
        "region": region,
        "center": {"latitude": latitude, "longitude": longitude},
        "radius_km": radius_km,
        "area_type": "point buffer; provisional, not an administrative boundary",
        "sources": {"thermal": list(LANDSAT), "optical": SENTINEL, "cloud_qa": CLOUD_SCORE},
        "methods": {
            "lst_c": "Landsat ST_B10 scale/offset to Celsius; monthly median, area mean",
            "ndvi": "(NIR - red) / (NIR + red); Landsat SR",
            "ndbi": "(SWIR - NIR) / (SWIR + NIR); Landsat SR; built-up proxy only",
            "ndwi": "(green - NIR) / (green + NIR); Sentinel-2 SR",
            "ndci": "(red-edge 1 - red) / (red-edge 1 + red); Sentinel-2 SR, water-masked",
            "water_km2": "area with monthly median NDWI > 0 in provisional buffer",
        },
        "notes": "Nulls indicate no clear valid observations. This is not causal attribution or validated water quality.",
        "records": records,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{region}.json"
    path.write_text(json.dumps(result, separators=(",", ":")))
    print("Wrote", path, flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", default=os.getenv("GEOCAST_EE_PROJECT"))
    parser.add_argument("--region", choices=[*REGIONS, "all"], default="chengalpattu")
    parser.add_argument("--start", default="2018-01", help="First month, YYYY-MM")
    parser.add_argument("--end", default="2026-08", help="Last month, YYYY-MM")
    parser.add_argument("--radius-km", type=float, default=5.0)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        date.fromisoformat(f"{args.start}-01")
        date.fromisoformat(f"{args.end}-01")
    except ValueError as exc:
        parser.error(str(exc))
    if args.start > args.end or args.radius_km <= 0:
        parser.error("Start must precede end and radius must be positive")
    selected = list(REGIONS) if args.region == "all" else [args.region]
    plan = {"project": args.project, "regions": selected, "start": args.start, "end": args.end,
            "months_per_region": len(list(month_range(args.start, args.end))), "radius_km": args.radius_km,
            "datasets": [*LANDSAT, SENTINEL, CLOUD_SCORE]}
    if args.dry_run:
        print(json.dumps(plan, indent=2))
        return
    if not args.project:
        parser.error("Set --project or GEOCAST_EE_PROJECT before extracting satellite data.")
    try:
        import ee
    except ImportError as exc:
        raise SystemExit("Install scripts/requirements-earth-engine.txt before extracting satellite data.") from exc
    try:
        ee.Initialize(project=args.project)
    except Exception as exc:
        raise SystemExit(
            "Earth Engine is not authenticated or the project lacks access. "
            "Follow docs/earth-engine.md, then retry. Details: " + str(exc)
        ) from exc
    for region in selected:
        extract_region(ee, args.project, region, args.start, args.end, args.radius_km)


if __name__ == "__main__":
    main()
