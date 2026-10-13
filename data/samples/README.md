# Observed sample snapshots

These small checked-in files support reproducible training and tests. They are observed public-source data, not synthetic fixtures or live updates.

- `modis/*.json`: NASA ORNL MODIS REST point subsets for Chennai, Chengalpattu, and Kanchipuram, retrieved on 2026-09-22. Roughly September 2024–August 2026. MOD11A2 daytime LST uses scale 0.02 K; conversion to Celsius is performed by the feature pipeline. MOD13Q1 NDVI uses scale 0.0001. Coordinates, scales, product names, and observation dates remain in the JSON files.
- `weather.json`: monthly ERA5 history from the existing Open-Meteo daily acquisition, January 2013–August 2026. Region grid-cell coordinates and source/retrieval metadata are included. Only months overlapping both satellite products are used for the current model.

Sources: [NASA ORNL MODIS REST API](https://modis.ornl.gov/data/modis_webservice.html), [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api).

Raw downloads, refreshed caches, and generated models are not checked in. Use `geocast train --source live` to fetch a new snapshot; preserve source attribution when sharing data or results.
