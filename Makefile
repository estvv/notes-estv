.PHONY: dev backend frontend install build

dev:
	@echo "Run 'make backend' in one terminal"
	@echo "Run 'make frontend' in another terminal"

backend:
	cd backend && npm run dev

frontend:
	cd frontend && npm run dev

install:
	cd frontend && npm install
	cd backend && npm install

build:
	cd frontend && npm run build
	cd backend && npm run build