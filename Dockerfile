FROM node:20-alpine

# --- Working directory ---
WORKDIR /app

# --- Environment ---
ENV NODE_ENV=development

# --- Installer dépendances ---
COPY package.json yarn.lock ./
RUN yarn install

# --- Copier le code (sera écrasé par le volume en dev) ---
#COPY . .

# --- Exposer le port Next.js ---
EXPOSE 3000

# --- Lancer Next.js en mode dev ---
CMD ["yarn", "dev"]
