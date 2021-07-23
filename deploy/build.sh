#!/bin/sh

tag=$(git describe --tags)

docker build -t registry.digitalocean.com/yare/yare-main:$tag .
docker build -t registry.digitalocean.com/yare/yare-game:$tag -f game/Dockerfile .

docker push registry.digitalocean.com/yare/yare-main:$tag
docker push registry.digitalocean.com/yare/yare-game:$tag

echo "Images pushed with tag $tag"
