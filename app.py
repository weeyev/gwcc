"""Vercel entrypoint using the repository's backend source and sibling assets."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "backend" / "src"))

from geocast.api import app  # noqa: E402, F401
