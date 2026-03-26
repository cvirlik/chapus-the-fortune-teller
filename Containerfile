FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx tsc \
    && npm prune --omit=dev \
    && npm cache clean --force

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/build ./build

USER node

CMD ["node", "build/luck-checker.js"]
