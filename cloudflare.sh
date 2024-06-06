# !/bin/bash

npm install --global "pnpm@9.1.4"
pnpm --filter @jaybeeuu/site... install
pnpm --filter @jaybeeuu/site... build