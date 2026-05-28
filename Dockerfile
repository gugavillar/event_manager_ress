FROM node:24-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_IBGE_UF
ARG NEXT_PUBLIC_PIX_KEY
ARG NEXT_PUBLIC_PHONE
ARG NEXT_PUBLIC_MICROSOFT_CLARITY

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_IBGE_UF=$NEXT_PUBLIC_API_IBGE_UF
ENV NEXT_PUBLIC_PIX_KEY=$NEXT_PUBLIC_PIX_KEY
ENV NEXT_PUBLIC_PHONE=$NEXT_PUBLIC_PHONE
ENV NEXT_PUBLIC_MICROSOFT_CLARITY=$NEXT_PUBLIC_MICROSOFT_CLARITY

COPY . .

RUN pnpm prisma generate
RUN pnpm build

FROM gcr.io/distroless/nodejs24-debian12 AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=320"

USER nonroot

COPY --from=build --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=build --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=build --chown=nonroot:nonroot /app/public ./public

EXPOSE 3000

CMD ["server.js"]
