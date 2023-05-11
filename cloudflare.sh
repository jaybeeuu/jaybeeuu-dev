# !/bin/bash

npm install --global "pnpm@^8.0.0"
pnpm --filter @jaybeeuu/site... install
pnpm --filter @jaybeeuu/site... build