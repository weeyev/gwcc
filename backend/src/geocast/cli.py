"""Explicit training entry point: python -m geocast.cli train --source sample."""

import argparse
import sys

from geocast.config import REGIONS, Settings
from geocast.pipeline import train_region


def main():
    parser = argparse.ArgumentParser(prog="geocast")
    commands = parser.add_subparsers(dest="command", required=True)
    train = commands.add_parser(
        "train", help="Fetch or load observations, train, validate, and save models"
    )
    train.add_argument("--region", choices=["all", *REGIONS], default="all")
    train.add_argument("--source", choices=["sample", "live"], default="sample")
    args = parser.parse_args()
    settings = Settings.from_env()
    regions = list(REGIONS) if args.region == "all" else [args.region]
    failed = False
    for region in regions:
        print(f"Training {region} from {args.source} observations…", flush=True)
        try:
            artifact, path = train_region(settings, region, args.source)
            metrics = artifact["training"]["errors"]
            print(
                f"Saved {path}; RMSE: "
                + ", ".join(f"{key}={value['rmse']:.3f}" for key, value in metrics.items())
            )
        except (ValueError, OSError, RuntimeError, KeyError) as error:
            print(f"Training failed for {region}: {error}", file=sys.stderr)
            failed = True
    return int(failed)


if __name__ == "__main__":
    raise SystemExit(main())
