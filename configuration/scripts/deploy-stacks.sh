#!/bin/bash

###
# Deploy CDK stacks with exclusion support
#
# @description This script deploys all CDK stacks in the configuration service,
# with the ability to exclude specific stacks via command-line arguments.
#
# @usage
#   ./scripts/deploy-stacks.sh [environment] [--exclude stack1,stack2,...]
#
# @example
#   ./scripts/deploy-stacks.sh development --exclude FilesBucketStack
#   ./scripts/deploy-stacks.sh production --exclude FilesBucketStack,ConfigNotificationsQueueStack
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
BOOTSTRAP="${BOOTSTRAP:-false}"
SYNTH="${SYNTH:-true}"
OUTPUT_FILE="${OUTPUT_FILE:-outputs.json}"
REQUIRE_APPROVAL="${REQUIRE_APPROVAL:-never}"

# Parse arguments (support both env vars and CLI args)
shift || true
while [[ $# -gt 0 ]]; do
  case $1 in
    --exclude)
      EXCLUDE_STACKS="$2"
      shift 2
      ;;
    --bootstrap)
      BOOTSTRAP=true
      shift
      ;;
    --no-synth)
      SYNTH=false
      shift
      ;;
    --output)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    --require-approval)
      REQUIRE_APPROVAL="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Set environment variable
export NODE_ENV="$ENVIRONMENT"

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  CDK Stack Deployment - Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"

# Get all available stacks from CDK dynamically
echo -e "\n${BLUE}Fetching available stacks from CDK...${NC}"
ALL_STACKS=()
while IFS= read -r line; do
  if [[ "$line" =~ -${ENVIRONMENT}$ ]]; then
    ALL_STACKS+=("$line")
  fi
done < <(cdk list 2>/dev/null)

if [[ ${#ALL_STACKS[@]} -eq 0 ]]; then
  echo -e "${RED}Error: No stacks found for environment: ${ENVIRONMENT}${NC}"
  echo -e "${RED}Make sure your CDK app is properly configured.${NC}\n"
  exit 1
fi

echo -e "${GREEN}✓ Found ${#ALL_STACKS[@]} stack(s)${NC}"

# Convert exclude list to array
IFS=',' read -ra EXCLUDED <<< "$EXCLUDE_STACKS"

# Build the list of stacks to deploy
STACKS_TO_DEPLOY=()
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
    STACKS_TO_DEPLOY+=("$stack")
  fi
done

# Display deployment plan
echo -e "\n${GREEN}Stacks to deploy:${NC}"
for stack in "${STACKS_TO_DEPLOY[@]}"; do
  echo -e "  ${GREEN}✓${NC} $stack"
done

if [[ ${#EXCLUDED[@]} -gt 0 ]] && [[ -n "${EXCLUDED[0]}" ]]; then
  echo -e "\n${YELLOW}Excluded stacks:${NC}"
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
      echo -e "  ${YELLOW}⊘${NC} $stack"
    fi
  done
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}\n"

# Bootstrap if requested
if [[ "$BOOTSTRAP" == true ]]; then
  echo -e "${BLUE}Running CDK bootstrap...${NC}"
  cdk bootstrap
  echo -e "${GREEN}✓ Bootstrap complete${NC}\n"
fi

# Synth
if [[ "$SYNTH" == true ]]; then
  echo -e "${BLUE}Running CDK synth...${NC}"
  cdk synth
  echo -e "${GREEN}✓ Synth complete${NC}\n"
fi

# Deploy stacks
if [[ ${#STACKS_TO_DEPLOY[@]} -eq 0 ]]; then
  echo -e "${YELLOW}No stacks to deploy${NC}"
  exit 0
fi

echo -e "${BLUE}Deploying stacks...${NC}\n"

# Join stacks array into space-separated string
STACKS_STRING="${STACKS_TO_DEPLOY[*]}"

# Deploy with CDK
cdk deploy $STACKS_STRING \
  --require-approval "$REQUIRE_APPROVAL" \
  --outputs-file "$OUTPUT_FILE" \
  --exclusively

echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"

