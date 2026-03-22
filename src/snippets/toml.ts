export const code = `\
# Wrangler configuration for color-schemer

name = "color-schemer"
main = "src/worker.ts"
compatibility_date = "2024-01-15"
workers_dev = true

[build]
command = "npm run build"

[vars]
APP_ENV = "production"
MAX_PALETTE_SIZE = 32
ENABLE_ANALYTICS = false

[[routes]]
pattern = "color-schemer.example.com/*"
zone_name = "example.com"

[dev]
port = 8787
local_protocol = "http"
ip = "127.0.0.1"

[observability]
enabled = true
head_sampling_rate = 1.0

[site]
bucket = "./dist"
include = ["*.html", "*.css", "*.js"]
exclude = ["*.map"]

# Deployment metadata
created_at = 2024-01-15
tags = ["web", "design-tools", "color"]`;
