# syntax=docker/dockerfile:1.7
FROM node:24-bookworm AS build

ENV PNPM_HOME=/pnpm \
    PNPM_STORE_PATH=/pnpm/store \
    PATH="/pnpm:$PATH" \
    NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable

WORKDIR /repo
COPY . .

WORKDIR /repo/examples/typescript
RUN pnpm install --frozen-lockfile
RUN pnpm --filter x402 build
RUN pnpm --filter facilitator exec tsc --project tsconfig.json --outDir dist
RUN pnpm deploy --filter facilitator --prod --legacy /opt/app

FROM node:24-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /srv/facilitator
COPY --from=build /opt/app ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
