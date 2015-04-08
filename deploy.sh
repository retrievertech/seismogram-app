#!/bin/sh

function command() {
  ssh -i ~/.ssh/Seismo-ec2.pem ubuntu@54.191.45.106 $1
}

echo "== kill node" && \
command "cd seismogram-app/server && forever stop server.js"
echo "== update repo" && \
command "cd seismogram-app && git pull" && \
echo "== restart node" && \
command "cd seismogram-app/server && forever start server.js"
