# !/bin/bash

npm install --global "pnpm@8.6.1"
pnpm --filter @jaybeeuu/site... install
pnpm --filter @jaybeeuu/site... build