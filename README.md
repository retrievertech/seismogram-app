seismogram-app
==============

Beginning of a browser app for searching/browsing seismograms. Eventually editing.

data-tools
----------
Tools to sanitize/import the station and file data. The data is in the repo in `data-tools/data`. You can run:
```sh
npm install
node jsonize.js
```

This will produce `files.json` and `stations.json`. Then you can import data into mongo:
```sh
sh mongo-import.sh
```

This assumes you started mongo:
```sh
mongod --dbpath <some directory>
```

server
------
A node server atop mongo.
```sh
cd server
npm install
node app # starts on port 3000
```

client
------
An angular frontend.
```sh
bower install
```
Serve the client directory using a web server and load it in the browser, assuming the above steps are done.

EC2
---
On our EC2 instance, the mongodb config file is located at `/etc/mongod.conf`.
