#!/bin/sh
set -euxo pipefail

docker pull $2
docker rm -f $1
docker run -d -p 5000:5000 --restart always --name $1 $2