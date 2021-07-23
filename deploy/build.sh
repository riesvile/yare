#!/bin/sh
set -euxo pipefail

tag=$(git describe --tags)

docker build -t yare-main:$tag .
docker build -t yare-game:$tag -f game/Dockerfile .

docker push yare-main:$tag
docker push yare-game:$tag

echo "Images pushed with tag $tag"