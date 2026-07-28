---
title: Self-Hosting
description: Run Flapjack on your own infrastructure. Single binary, zero dependencies.
---

Flapjack is a single binary with no external dependencies. Run it anywhere — bare metal, Docker, Kubernetes, or a $5/mo VPS.

## Docker (recommended)

```bash
docker run -d \
  --name flapjack \
  -p 7700:7700 \
  -e FLAPJACK_ADMIN_KEY=your-secret-key \
  -v flapjack-data:/var/lib/flapjack \
  --restart unless-stopped \
  ghcr.io/flapjackhq/flapjack
```

This starts Flapjack on port 7700 with persistent data storage.

## Binary download

The official installer detects your OS and CPU architecture, downloads the
matching release archive, verifies its checksum, and extracts the binary:

```bash
curl -fsSL https://install.flapjack.foo | sh
```

Pin a version by passing the tag: `curl -fsSL https://install.flapjack.foo | sh -s -- v1.0.10`.

Prebuilt archives are published on each
[release](https://github.com/flapjackhq/flapjack/releases/latest) for
`x86_64`/`aarch64` Linux (musl), `x86_64`/`aarch64` macOS, and `x86_64` Windows.
Each archive ships alongside a `.sha256` file.

Run it:

```bash
FLAPJACK_ADMIN_KEY=your-secret-key \
  flapjack --data-dir /var/lib/flapjack --bind-addr 0.0.0.0:7700
```

## Configuration

Flapjack is configured via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `FLAPJACK_ADMIN_KEY` | (required) | API key for write operations |
| `FLAPJACK_PUBLIC_IP` | — | Public IP for SSL certificate provisioning |
| `FLAPJACK_SSL_EMAIL` | — | Email for Let's Encrypt SSL certificates |

Command-line flags:

| Flag | Default | Description |
|------|---------|-------------|
| `--data-dir` | `./data` | Directory for index data |
| `--bind-addr` | `0.0.0.0:7700` | Address and port to listen on |

## Systemd service

For production Linux deployments:

```ini
# /etc/systemd/system/flapjack.service
[Unit]
Description=Flapjack Search Engine
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=flapjack
Environment=FLAPJACK_ADMIN_KEY=your-secret-key
ExecStart=/usr/local/bin/flapjack --data-dir /var/lib/flapjack --bind-addr 0.0.0.0:7700
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo useradd -r -s /bin/false flapjack
sudo mkdir -p /var/lib/flapjack
sudo chown flapjack:flapjack /var/lib/flapjack
sudo systemctl enable --now flapjack
```

## SSL/TLS

Flapjack can automatically provision Let's Encrypt SSL certificates for IP-based HTTPS:

```bash
FLAPJACK_ADMIN_KEY=your-secret-key \
FLAPJACK_PUBLIC_IP=203.0.113.10 \
FLAPJACK_SSL_EMAIL=you@example.com \
  ./flapjack --data-dir /var/lib/flapjack --bind-addr 0.0.0.0:7700
```

Alternatively, put Flapjack behind a reverse proxy (nginx, Caddy) that handles SSL.

## Reverse proxy with Caddy

```
search.example.com {
    reverse_proxy localhost:7700
}
```

## Health check

```bash
curl http://localhost:7700/health
```

Returns `200 OK` when Flapjack is ready to serve requests.

## Backups

Flapjack stores all data in the `--data-dir` directory. To back up:

```bash
# Stop Flapjack (or use filesystem snapshots)
sudo systemctl stop flapjack
tar -czf flapjack-backup-$(date +%Y%m%d).tar.gz /var/lib/flapjack
sudo systemctl start flapjack
```

## Resource requirements

| Workload | RAM | Disk | CPU |
|----------|-----|------|-----|
| Small (< 100K documents) | 512 MB | 1 GB | 1 vCPU |
| Medium (100K–1M documents) | 2 GB | 10 GB | 2 vCPUs |
| Large (1M–10M documents) | 8 GB | 50 GB | 4 vCPUs |

Flapjack is built on Rust and Tantivy, so it's efficient with resources. Start small and scale up as needed.
