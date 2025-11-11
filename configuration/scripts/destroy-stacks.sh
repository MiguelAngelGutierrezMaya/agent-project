#!/bin/bash

###
# Destroy CDK stacks with exclusion support
#
# @description This script destroys CDK stacks in the configuration service,
# with the ability to exclude specific stacks via command-line arguments.
#
# @usage
#   ./scripts/destroy-stacks.sh [environment] [--exclude stack1,stack2,...]
#
# @example
#   ./scripts/destroy-stacks.sh development --exclude FilesBucketStack
#   ./scripts/destroy-stacks.sh production --exclude FilesBucketStack,ConfigNotificationsQueueStack
###

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${1:-development}"
EXCLUDE_STACKS="${EXCLUDE:-}"
SKIP_CONFIRMATION="${SKIP_CONFIRMATION:-false}"

# Parse arguments (support both env vars and CLI args)
shift || true
while [[ $# -gt 0 ]]; do
  case $1 in
    --exclude)
      EXCLUDE_STACKS="$2"
      shift 2
      ;;
    --yes|-y|--force)
      SKIP_CONFIRMATION=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Set environment variable
export NODE_ENV="$ENVIRONMENT"

echo -e "${RED}═══════════════════════════════════════════════════${NC}"
echo -e "${RED}  CDK Stack Destruction - Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "${RED}═══════════════════════════════════════════════════${NC}"

# Get all available stacks from CDK dynamically
echo -e "\n${BLUE}Fetching available stacks from CDK...${NC}"
STACKS_TEMP=()
while IFS= read -r line; do
  if [[ "$line" =~ -${ENVIRONMENT}$ ]]; then
    STACKS_TEMP+=("$line")
  fi
done < <(cdk list 2>/dev/null)

if [[ ${#STACKS_TEMP[@]} -eq 0 ]]; then
  echo -e "${RED}Error: No stacks found for environment: ${ENVIRONMENT}${NC}"
  echo -e "${RED}Make sure your CDK app is properly configured.${NC}\n"
  exit 1
fi

# Reverse the order for proper teardown (destroy dependent stacks first)
ALL_STACKS=()
for ((i=${#STACKS_TEMP[@]}-1; i>=0; i--)); do
  ALL_STACKS+=("${STACKS_TEMP[$i]}")
done

echo -e "${GREEN}✓ Found ${#ALL_STACKS[@]} stack(s)${NC}"

# Convert exclude list to array
IFS=',' read -ra EXCLUDED <<< "$EXCLUDE_STACKS"

# Build the list of stacks to destroy
STACKS_TO_DESTROY=()
for stack in "${ALL_STACKS[@]}"; do
  EXCLUDE=false
  for excluded in "${EXCLUDED[@]}"; do
    # Remove environment suffix for comparison
    STACK_BASE=$(echo "$stack" | sed "s/-${ENVIRONMENT}$//")
    EXCLUDED_BASE=$(echo "$excluded" | sed "s/-${ENVIRONMENT}$//")
    
    if [[ "$STACK_BASE" == "$EXCLUDED_BASE" ]] || [[ "$stack" == "$excluded" ]]; then
      EXCLUDE=true
      break
    fi
  done
  
  if [[ "$EXCLUDE" == false ]]; then
    STACKS_TO_DESTROY+=("$stack")
  fi
done

# Display destruction plan
echo -e "\n${RED}Stacks to destroy:${NC}"
for stack in "${STACKS_TO_DESTROY[@]}"; do
  echo -e "  ${RED}✗${NC} $stack"
done

if [[ ${#EXCLUDED[@]} -gt 0 ]] && [[ -n "${EXCLUDED[0]}" ]]; then
  echo -e "\n${GREEN}Preserved stacks:${NC}"
  for stack in "${ALL_STACKS[@]}"; do
    SKIP=false
    for excluded in "${EXCLUDED[@]}"; do
      STACK_BASE=$(echo "$stack" | sed "s/-${ENVIRONMENT}$//")
      EXCLUDED_BASE=$(echo "$excluded" | sed "s/-${ENVIRONMENT}$//")
      
      if [[ "$STACK_BASE" == "$EXCLUDED_BASE" ]] || [[ "$stack" == "$excluded" ]]; then
        SKIP=true
        break
      fi
    done
    
    if [[ "$SKIP" == true ]]; then
      echo -e "  ${GREEN}✓${NC} $stack"
    fi
  done
fi

if [[ "$SKIP_CONFIRMATION" == false ]]; then
  echo -e "\n${YELLOW}⚠️  WARNING: This action cannot be undone!${NC}"
  read -p "Are you sure you want to destroy these stacks? (yes/no): " -r
  echo
  if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${BLUE}Destruction cancelled${NC}"
    exit 0
  fi
fi

echo -e "\n${RED}═══════════════════════════════════════════════════${NC}\n"

# Destroy stacks
if [[ ${#STACKS_TO_DESTROY[@]} -eq 0 ]]; then
  echo -e "${YELLOW}No stacks to destroy${NC}"
  exit 0
fi

echo -e "${RED}Destroying stacks...${NC}\n"

# Destroy each stack individually to ensure proper order
for stack in "${STACKS_TO_DESTROY[@]}"; do
  echo -e "${BLUE}Destroying $stack...${NC}"
  cdk destroy "$stack" --force
  echo -e "${GREEN}✓ $stack destroyed${NC}\n"
done

echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Destruction completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"

