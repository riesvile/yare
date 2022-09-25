#!/bin/sh

pull_and_run() {
    docker pull $2
    docker rm -f $1
    docker run -d $3 -p $4:5000 --restart always --name $1 $2
}

CONTAINER_NAME="main"
SERVER_TYPE="real"
PORT=${PORT=5000}
case $1 in
    (main)
        pull_and_run main "registry.digitalocean.com/yare/yare-main:$2" "" $PORT
        exit 0
        ;;
    (transpiler)
        pull_and_run transpiler "registry.digitalocean.com/yare/yare-transpiler:$2" "" $PORT
        exit 0
        ;;
    (t*)
        CONTAINER_NAME="game"
        SERVER_NAME="$1"
        SERVER_TYPE="tutorial"
        ;;
    (d*)
        CONTAINER_NAME="game"
        SERVER_NAME="$1"
        ;;
    (*)
        echo "Unknown server $1"
        exit 1
        ;;
esac

pull_and_run $CONTAINER_NAME "registry.digitalocean.com/yare/yare-$CONTAINER_NAME:$2" "--env SERVER=${SERVER_NAME} --env SERVER_TYPE=${SERVER_TYPE}" $PORT
