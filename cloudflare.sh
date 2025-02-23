# !/bin/bash

npm install --global "pnpm@10.4.1"
pnpm --filter @jaybeeuu/site... install
pnpm --filter @jaybeeuu/site... build