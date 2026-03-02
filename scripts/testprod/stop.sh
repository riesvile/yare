#!/bin/sh
set -e

docker-compose -f docker-compose.testprod.yml down -t 4
