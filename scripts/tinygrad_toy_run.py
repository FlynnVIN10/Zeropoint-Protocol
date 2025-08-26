#!/usr/bin/env python3
import argparse
import json
import os
import random
import time
from datetime import datetime, timezone


def iso_now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def main():
    parser = argparse.ArgumentParser(description="TinyGrad Toy Run - emit minimal SCP v1 metrics")
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--dataset", required=True)
    parser.add_argument("--output", required=True, help="Path to metrics.json")
    parser.add_argument("--notes", default="Toy run")
    args = parser.parse_args()

    started_at = iso_now()
    # Simulate training work
    time.sleep(0.2)
    ended_at = iso_now()

    # Generate plausible metrics
    loss = round(random.uniform(0.2, 0.8), 4)
    accuracy = round(random.uniform(0.7, 0.95), 4)

    metrics = {
        "run_id": args.run_id,
        "model": args.model,
        "started_at": started_at,
        "ended_at": ended_at,
        "dataset": args.dataset,
        "metrics": {
            "loss": loss,
            "accuracy": accuracy
        },
        "notes": args.notes
    }

    out_dir = os.path.dirname(os.path.abspath(args.output))
    os.makedirs(out_dir, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(json.dumps(metrics))


if __name__ == "__main__":
    main()
