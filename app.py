"""Vercel entrypoint using the repository's backend source and sibling assets."""

import sys
from importlib import import_module
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "backend" / "src"))

app = import_module("geocast.api").app
