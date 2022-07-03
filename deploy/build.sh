#!/bin/sh

tag=$(git describe --tags || git rev-parse HEAD)

docker build -t registry.digitalocean.com/yare/yare-main:$tag .
docker build -t registry.digitalocean.com/yare/yare-game:$tag -f game/Dockerfile .
docker build -t registry.digitalocean.com/yare/yare-transpiler:$tag ./transpiler

docker push registry.digitalocean.com/yare/yare-main:$tag
docker push registry.digitalocean.com/yare/yare-game:$tag
docker push registry.digitalocean.com/yare/yare-transpiler:$tag

echo "Images pushed with tag $tag"
