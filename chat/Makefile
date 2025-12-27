###############################################################################
# Makefile for Chat Service
#
# This Makefile helps manage the development and deployment environments.
# It allows working locally with pnpm while deploying with npm to Elastic Beanstalk.
#
# Usage:
#   make setup-local    - Prepare local environment (removes node_modules, installs with pnpm)
#   make setup-deploy   - Prepare deployment environment (removes node_modules, installs with npm)
#   make deploy         - Prepare deployment environment and deploy to Elastic Beanstalk
#   make clean          - Remove node_modules and build artifacts
#   make build          - Build the project with npm (TypeScript compilation)
#   make build-local    - Build the project with pnpm (TypeScript compilation)
###############################################################################

.PHONY: help setup-local setup-deploy deploy clean build build-local install-local install-deploy check version

# Default target
.DEFAULT_GOAL := help

# Colors for output
COLOR_RESET := \033[0m
COLOR_BOLD := \033[1m
COLOR_GREEN := \033[32m
COLOR_YELLOW := \033[33m
COLOR_BLUE := \033[34m

###############################################################################
# Help
###############################################################################

help: ## Show this help message
	@echo "$(COLOR_BOLD)Available commands:$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_GREEN)%-15s$(COLOR_RESET) %s\n", $$1, $$2}'

###############################################################################
# Environment Setup
###############################################################################

setup-local: clean install-local ## Prepare local development environment (pnpm)

install-local: ## Install dependencies locally with pnpm
	@echo "$(COLOR_BLUE)Installing dependencies with pnpm...$(COLOR_RESET)"
	@command -v pnpm >/dev/null 2>&1 || { echo "$(COLOR_YELLOW)pnpm is not installed. Installing pnpm...$(COLOR_RESET)"; npm install -g pnpm; }
	pnpm install --frozen-lockfile
	@echo "$(COLOR_GREEN)✓ Local environment ready (pnpm)$(COLOR_RESET)"

setup-deploy: clean install-deploy ## Prepare deployment environment (npm)

install-deploy: ## Install dependencies for deployment with npm
	@echo "$(COLOR_BLUE)Installing dependencies with npm (for deployment)...$(COLOR_RESET)"
	@if [ ! -f package-lock.json ]; then \
		echo "$(COLOR_YELLOW)package-lock.json not found. Generating it...$(COLOR_RESET)"; \
		npm install --package-lock-only; \
	fi
	npm ci
	@echo "$(COLOR_GREEN)✓ Deployment environment ready (npm)$(COLOR_RESET)"

deploy: setup-deploy build ## Prepare deployment environment, build, and deploy to Elastic Beanstalk
	@echo "$(COLOR_BLUE)Deploying to Elastic Beanstalk...$(COLOR_RESET)"
	@command -v eb >/dev/null 2>&1 || { echo "$(COLOR_YELLOW)EB CLI is not installed. Install it with: pip install awsebcli$(COLOR_RESET)"; exit 1; }
	eb deploy
	@echo "$(COLOR_GREEN)✓ Deployment complete$(COLOR_RESET)"

###############################################################################
# Cleanup
###############################################################################

clean: ## Remove node_modules, dist, and other build artifacts
	@echo "$(COLOR_BLUE)Cleaning build artifacts...$(COLOR_RESET)"
	rm -rf node_modules
	rm -rf dist
	rm -rf coverage
	rm -rf .nyc_output
	@echo "$(COLOR_GREEN)✓ Clean complete$(COLOR_RESET)"

###############################################################################
# Build
###############################################################################

build: ## Build the project (TypeScript compilation)
	@echo "$(COLOR_BLUE)Building project...$(COLOR_RESET)"
	npm run build
	@echo "$(COLOR_GREEN)✓ Build complete$(COLOR_RESET)"

build-local: ## Build using local pnpm
	@echo "$(COLOR_BLUE)Building project with pnpm...$(COLOR_RESET)"
	pnpm run build
	@echo "$(COLOR_GREEN)✓ Build complete$(COLOR_RESET)"

###############################################################################
# Utility Commands
###############################################################################

check: ## Check if required package managers are installed
	@echo "$(COLOR_BLUE)Checking package managers...$(COLOR_RESET)"
	@command -v pnpm >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ pnpm installed$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ pnpm not installed$(COLOR_RESET)"
	@command -v npm >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ npm installed$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ npm not installed$(COLOR_RESET)"
	@command -v node >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ node installed ($(shell node --version))$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ node not installed$(COLOR_RESET)"

version: ## Show versions of installed tools
	@echo "$(COLOR_BLUE)Package Manager Versions:$(COLOR_RESET)"
	@command -v pnpm >/dev/null 2>&1 && echo "pnpm: $(shell pnpm --version)" || echo "pnpm: not installed"
	@command -v npm >/dev/null 2>&1 && echo "npm: $(shell npm --version)" || echo "npm: not installed"
	@command -v node >/dev/null 2>&1 && echo "node: $(shell node --version)" || echo "node: not installed"

