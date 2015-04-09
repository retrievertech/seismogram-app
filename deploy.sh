#!/bin/sh

function command() {
  ssh ubuntu@52.10.53.123 $1
}

echo "== kill node" && \
command "cd seismogram-app/server && forever stop server.js"
echo "== update repo" && \
command "cd seismogram-app && git pull" && \
echo "== restart node" && \
command "cd seismogram-app/server && NODE_ENV=production forever start server.js"
