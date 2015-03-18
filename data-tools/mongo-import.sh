db=seismo
mongo $db --eval "db.dropDatabase()" && \
mongoimport --db=$db --collection=stations --jsonArray --file stations.json && \
mongoimport --db=$db --collection=files --jsonArray --file files.json
