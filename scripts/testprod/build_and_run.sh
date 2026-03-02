#!/bin/sh
set -e

export FRONTEND_PORT=${FRONTEND_PORT=5000}
docker-compose -f docker-compose.testprod.yml build
docker-compose -f docker-compose.testprod.yml up -d
