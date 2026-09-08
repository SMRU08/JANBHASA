#!/usr/bin/env python3
"""
Janbhasha Programmatic Server Entry Point
Run: python run.py [--dev] [--host HOST] [--port PORT]
Equivalent to the uvicorn CLI but with Python-level control.
"""

import argparse
import os
import sys

import uvicorn

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8000

def main():
    parser = argparse.ArgumentParser(description="Start the Janbhasha Offline AI Server")
    parser.add_argument("--host",    default=DEFAULT_HOST, help="Bind address (default: 127.0.0.1)")
    parser.add_argument("--port",    default=DEFAULT_PORT, type=int, help="Port (default: 8000)")
    parser.add_argument("--dev",     action="store_true",  help="Enable hot-reload (development only)")
    parser.add_argument("--workers", default=1,            type=int, help="Number of workers (default: 1 — do not increase with GPU)")
    args = parser.parse_args()

    # Offline environment enforcement
    os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
    os.environ.setdefault("HF_DATASETS_OFFLINE",  "1")
    os.environ.setdefault("HF_HUB_OFFLINE",       "1")
    os.environ.setdefault("TOKENIZERS_PARALLELISM","false")

    config = uvicorn.Config(
        app             = "app.main:app",
        host            = args.host,
        port            = args.port,
        workers         = args.workers,
        loop            = "asyncio",
        http            = "httptools",
        log_level       = "debug" if args.dev else "info",
        access_log      = True,
        use_colors      = True,
        reload          = args.dev,
        reload_dirs     = ["app"] if args.dev else None,
        timeout_graceful_shutdown = 15,
        timeout_keep_alive = 30,
        limit_concurrency  = 10,
    )

    server = uvicorn.Server(config)

    print(f"\n{'='*60}")
    print(f"  Janbhasha Offline AI Engine")
    print(f"  Mode   : {'DEVELOPMENT (hot-reload)' if args.dev else 'PRODUCTION'}")
    print(f"  Server : http://{args.host}:{args.port}")
    print(f"  Docs   : http://{args.host}:{args.port}/docs")
    print(f"  Health : http://{args.host}:{args.port}/api/v1/health/")
    print(f"{'='*60}\n")

    server.run()


if __name__ == "__main__":
    main()
