# cloudflare does not yet support node 18. https://community.cloudflare.com/t/support-node-18-in-pages-or-allow-config/414797
nvm install 16
nvm use 16
npm install --global "pnpm@^7.0.0"
pnpm -r --filter @jaybeeuu/site... install
pnpm run --filter @jaybeeuu/site... build