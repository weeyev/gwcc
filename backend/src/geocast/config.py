"""Repository paths and non-secret region configuration."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[3]
REGIONS = {
    "chengalpattu": {"name": "Chengalpattu", "latitude": 12.6819, "longitude": 79.9888},
    "chennai": {"name": "Chennai", "latitude": 13.0827, "longitude": 80.2707},
    "kanchipuram": {"name": "Kanchipuram", "latitude": 12.8342, "longitude": 79.7036},
}
MODEL_VERSION = "ridge-monthly-v2"


@dataclass(frozen=True)
class Settings:
    sample_dir: Path = ROOT / "data" / "samples"
    artifact_dir: Path = ROOT / "artifacts"
    cache_dir: Path = ROOT / "data" / "cache"
    frontend_dir: Path = ROOT / "frontend"

    @classmethod
    def from_env(cls):
        load_dotenv(ROOT / ".env")
        defaults = cls()
        return cls(
            **{
                key: Path(
                    os.environ.get(f"GEOCAST_{key.upper()}", getattr(defaults, key))
                ).resolve()
                for key in ("sample_dir", "artifact_dir", "cache_dir", "frontend_dir")
            }
        )
