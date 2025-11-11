#!/bin/bash

###
# List available CDK stacks
#
# @description This script lists all available CDK stacks for the specified environment
# by querying CDK directly.
#
# @usage
#   ./scripts/list-stacks.sh [environment]
#
# @example
#   ./scripts/list-stacks.sh development
#   ./scripts/list-stacks.sh production
###

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${1:-development}"

# Set environment variable
export NODE_ENV="$ENVIRONMENT"

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Available CDK Stacks - Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Fetching stacks from CDK...${NC}\n"

# Get all stacks from CDK and filter by environment
ALL_STACKS=()
while IFS= read -r line; do
  if [[ "$line" =~ -${ENVIRONMENT}$ ]]; then
    ALL_STACKS+=("$line")
  fi
done < <(cdk list 2>/dev/null)

if [[ ${#ALL_STACKS[@]} -eq 0 ]]; then
  echo -e "${YELLOW}No stacks found for environment: ${ENVIRONMENT}${NC}"
  echo -e "${YELLOW}Make sure your CDK app is properly configured.${NC}\n"
  exit 1
fi

echo -e "${GREEN}Available stacks:${NC}\n"

for i in "${!ALL_STACKS[@]}"; do
  NUM=$((i + 1))
  STACK_NAME="${ALL_STACKS[$i]}"
  # Extract base name without environment suffix
  BASE_NAME=$(echo "$STACK_NAME" | sed "s/-${ENVIRONMENT}$//")
  echo -e "  ${BLUE}$NUM.${NC} ${STACK_NAME} ${YELLOW}(${BASE_NAME})${NC}"
done

echo -e "\n${YELLOW}To exclude stacks from deployment, use:${NC}"
echo -e "  pnpm cdk:deploy:dev --exclude StackName1,StackName2"
echo -e "\n${YELLOW}Examples:${NC}"
echo -e "  ${BLUE}•${NC} Exclude bucket: ${GREEN}pnpm cdk:deploy:dev --exclude FilesBucketStack${NC}"
echo -e "  ${BLUE}•${NC} Exclude multiple: ${GREEN}pnpm cdk:deploy:dev --exclude FilesBucketStack,ConfigNotificationsQueueStack${NC}"

echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"

