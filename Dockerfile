# NODE MODULES

FROM node:latest as deps
WORKDIR /app

COPY package*.json ./

RUN npm install

# VITE

FROM node:latest as vite
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY vite.config.ts tsconfig.json index.html package*.json ./
COPY ./web ./web
COPY ./shared ./shared
COPY ./migrations ./migrations

RUN npx vite build

# API

FROM denoland/deno:latest
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=vite /app/dist ./dist

COPY ./deno.json ./deno.lock ./
COPY ./api ./api
COPY ./shared ./shared
COPY ./migrations ./migrations

RUN deno cache api/main.ts

COPY ./migrations ./migrations
COPY ./tsconfig.json ./

CMD [ "deno", "run", "--allow-env", "--allow-net", "--allow-read", "api/main.ts" ]
