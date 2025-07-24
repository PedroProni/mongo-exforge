# -------- Stage 1 --------
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build && \
    mkdir -p dist/infrastructure/documentation/config && \
    cp src/infrastructure/documentation/config/description.txt dist/infrastructure/documentation/config/description.txt

# -------- Stage 2 -------- 
FROM node:20-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]