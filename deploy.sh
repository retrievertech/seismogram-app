#!/usr/bin/env bash

function command() {
  ssh ubuntu@seismo.redfish.com $1
}

echo "== kill node" && \
command "source ~/.profile; pm2 stop seismo-app"
echo "== update repo" && \
command "cd ~/seismogram-app && git pull" && \
command "cd ~/seismogram-pipeline && git pull" && \
echo "== restart node" && \
command "source ~/.profile; pm2 start seismo-app"
