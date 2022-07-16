Skate Web
==============

This web application is the interactive component of the Skate project. For the analysis component, see https://github.com/retrievertech/seismogram-pipeline.

The Skate web app allows browsing a large collection of analog WWSSN seismograms, overlaid with digital trace data that was extracted using our analysis component.

Skate is currently deployed at https://seismo.redfish.com

data-tools
----------
Tools to sanitize/import the station and file data. The data is in the repo in `data-tools/data`. You can run:
```sh
npm install
node jsonize.js
```

This will produce `files.json` and `stations.json`. Then you can import data into mongo:
```sh
node mongo-import.js
```

This assumes you started mongo:
```sh
mongod --dbpath <some directory>
```

And have set up an aws cli profile called `seismo` with credentials to read the s3 bucket:
```sh
aws configure --profile seismo
```

server
------
A node server atop mongo.
```sh
cd server
npm install
cp config.example.js config.js
node server.js # starts on port 3000
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

The server listens on port 3010 and sits behind an nginx proxy that listens on port 3000.
nginx implements SSL and serves the static web app content on ports 80 and 443.
The nginx config is located at `/etc/nginx/sites-enabled/seismogram`.

Restart the server with `pm2 restart all`, or have a look at [deploy.sh](deploy.sh).


Spinning up a new deployment
---

nginx
```
sudo apt install nginx
```

[nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
```
nvm install 14.16
```

pm2 + bower
```
npm install -g pm2 bower
```

[conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/linux.html)


[mongo](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)


[aws](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#cliv2-linux-install)
```
aws configure --profile seismo
```


clone seismo repos
```
git clone https://github.com/retrievertech/seismogram-app.git
git clone https://github.com/retrievertech/seismogram-pipeline.git
```

setup db
```
cd ~/seismogram-app/data-tools
npm install
node jsonize.js
node mongo-import.js
```

setup server
```
cd ~/seismogram-app/server
npm install
cp config.server.example.js config.js
pm2 start pm2.ecosystem.config.js
pm2 startup
pm2 save
```

setup client
```
cd ~/seismogram-app/client
bower install
cd ~/seismogram-app
sudo cp nginx.conf /etc/nginx/sites-available/seismogram
cd /etc/nginx/sites-enabled/
sudo ln -s ../sites-available/seismogram .
sudo chmod +x $HOME
sudo chown -R :www-data ~/seismogram-app/client
sudo systemctl restart nginx
```

setup processing pipeline
```
cd ~/seismogram-pipeline
conda create --name seismo python=2.7 numpy scipy
conda activate seismo
# had some issues installing geojson and docopt w/ conda
python -m pip install --upgrade pip
pip install geojson docopt matplotlib
```

setup HTTPS w/ [certbot](https://certbot.eff.org/)

