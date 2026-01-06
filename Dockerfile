# =========================
# 1️⃣ Build stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copie uniquement les fichiers nécessaires au build
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copie du reste du code
COPY . .

# Build frontend (Next / React)
RUN yarn build


# =========================
# 2️⃣ Runtime stage
# =========================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copier uniquement le nécessaire depuis le build
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/.next ./.next        # Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Si React/Vite → adapte :
# COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["yarn", "start"]