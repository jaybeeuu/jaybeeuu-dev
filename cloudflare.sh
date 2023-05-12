# !/bin/bash

npm install --global "pnpm@8.3.1"
pnpm --filter @jaybeeuu/site... install
pnpm --filter @jaybeeuu/site... build