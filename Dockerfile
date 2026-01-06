# ========= BASE =========
FROM node:20-alpine AS base
WORKDIR /app

# ========= DEPS =========
FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ========= DEVELOPMENT =========
FROM base AS development
ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY package.json yarn.lock ./

EXPOSE 3000
CMD ["yarn", "dev"]

# ========= BUILD =========
FROM base AS build
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# ========= PRODUCTION =========
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["yarn", "start"]