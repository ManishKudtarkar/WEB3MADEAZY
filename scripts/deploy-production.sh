#!/usr/bin/env bash
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION}"
: "${ECR_REPOSITORY:?Set ECR_REPOSITORY}"
: "${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID}"

aws ecr get-login-password --region "$AWS_REGION" |
  docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
docker build -f backend/Dockerfile -t "$ECR_REPOSITORY:production" .
docker tag "$ECR_REPOSITORY:production" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:production"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:production"
