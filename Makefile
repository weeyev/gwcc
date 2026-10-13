PYTHON := .venv/bin/python

.PHONY: setup train serve check test
setup:
	python3 -m venv .venv
	$(PYTHON) -m pip install -r backend/requirements-dev.lock -e backend

train:
	$(PYTHON) -m geocast.cli train --source sample

serve:
	$(PYTHON) -m uvicorn geocast.api:app --host 127.0.0.1 --port 5173

check:
	$(PYTHON) -m ruff check backend
	$(PYTHON) -m ruff format --check backend
	npm run check

test:
	$(PYTHON) -m pytest backend/tests
