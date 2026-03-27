# cnlab

Web front end for a **Computer Networks Lab** (BCS653-style syllabus): 17 experiments with interactive visuals, per-experiment manuals, and full-page docs with runnable **Python** examples under `experiments/`.

## Stack

- Next.js (App Router), React, TypeScript, Tailwind CSS
- Python 3 for socket, ARQ, routing, HTTP, RPC, and simulation scripts (stdlib only where possible)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the experiment tabs, then **Docs** in the navbar for theory, procedures, and bundled source.

## Python labs

From the repo root:

```bash
python3 experiments/arq_protocols.py stop-wait --frames 4
python3 experiments/socket_client_server.py server --port 9000
```

See each experiment’s Docs page for exact commands.

## Build

```bash
npm run build
npm start
```

## Repository

[github.com/AJKakarot/cnlab](https://github.com/AJKakarot/cnlab)
