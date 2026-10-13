"""Small, bounded public-data client with an ignored on-disk cache."""

import hashlib
import json
import time
from pathlib import Path

import httpx


class DataSourceError(RuntimeError):
    pass


class JsonClient:
    def __init__(self, cache_dir: Path, transport=None):
        self.cache_dir = cache_dir
        self.client = httpx.Client(timeout=90, transport=transport, follow_redirects=True)

    def close(self):
        self.client.close()

    def get(self, url, params, ttl=86400):
        request = self.client.build_request("GET", url, params=params)
        key = hashlib.sha256(str(request.url).encode()).hexdigest()
        path = self.cache_dir / f"{key}.json"
        if path.exists() and time.time() - path.stat().st_mtime < ttl:
            try:
                return json.loads(path.read_text())
            except (ValueError, OSError):
                pass
        for attempt in range(3):
            try:
                response = self.client.send(request)
                response.raise_for_status()
                data = response.json()
                self.cache_dir.mkdir(parents=True, exist_ok=True)
                temporary = path.with_suffix(".tmp")
                temporary.write_text(json.dumps(data, allow_nan=False))
                temporary.replace(path)
                return data
            except (httpx.HTTPError, ValueError) as error:
                if (
                    isinstance(error, httpx.HTTPStatusError)
                    and 400 <= error.response.status_code < 500
                    and error.response.status_code != 429
                ):
                    raise DataSourceError(
                        f"Data source returned HTTP {error.response.status_code}."
                    ) from error
                if attempt == 2:
                    raise DataSourceError(
                        "Public data request failed after three attempts."
                    ) from error
                time.sleep(2**attempt)
