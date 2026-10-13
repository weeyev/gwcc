from dataclasses import replace

import pytest

from geocast.config import Settings


@pytest.fixture
def settings(tmp_path):
    return replace(Settings(), artifact_dir=tmp_path / "artifacts", cache_dir=tmp_path / "cache")
