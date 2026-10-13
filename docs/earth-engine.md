# Optional Earth Engine extraction

The main application uses public MODIS/ERA5 data and does not require Earth Engine. `scripts/extract_satellite.py` is a separate, optional Landsat/Sentinel extraction plan for monthly LST, NDVI, NDBI, NDWI, NDCI, and mapped-water proxies. Its output is not yet integrated into the trained model.

1. Register your own [Google Cloud project for Earth Engine](https://developers.google.com/earth-engine/guides/access) and enable the API.
2. Install the optional client into the project virtual environment:
   ```sh
   python -m pip install -r scripts/requirements-earth-engine.txt
   earthengine authenticate
   ```
3. Inspect the plan without credentials:
   ```sh
   python scripts/extract_satellite.py --dry-run --region chengalpattu --start 2024-01 --end 2024-01
   ```
4. Extract after authenticating:
   ```sh
   python scripts/extract_satellite.py --project YOUR_PROJECT_ID --region chengalpattu --start 2024-01 --end 2024-01
   ```

You can set `GEOCAST_EE_PROJECT` instead of `--project`. The provisional AOI is a 5 km circle, not an official district boundary. Output goes into the ignored `data/satellite/` directory. Never commit Google credentials or service-account keys.
