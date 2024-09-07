.PHONY: migrations

include .env
export $(shell sed 's/=.*//' .env)

IMAGE_NAME=docker.amatiasq.com/pokedeck
SERVICE_NAME=com_amatiasq_poke
CONTAINER_NAME=amq-pokedeck

install-deps:
	npm i -D drizzle-kit

build:
	npx vite build

# Deployment

deploy: build-image push-image pull-and-restart

build-image:
	docker build --pull -t $(IMAGE_NAME):latest .
	docker tag $(IMAGE_NAME):latest $(IMAGE_NAME):$$(date +%Y-%m-%dT%H-%M-%S)

push-image:
	docker push $(IMAGE_NAME):latest

pull-and-restart:
	ssh amatiasq.com 'VPS_DIR=$$HOME/vps vps/bin/pull-and-restart $(SERVICE_NAME)'


# Development

dev:
	make -j 2 dev-api dev-web

dev-web:
	npx vite

dev-api:
	deno run --watch \
		--allow-net \
		--allow-read \
		--allow-env \
		api/main.ts


# Database

migrations:
	npx drizzle-kit generate

db: stop-db start-db

stop-db:
	docker compose down

start-db:
	docker compose up -d
