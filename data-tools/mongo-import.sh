db=seismo
mongo $db --eval "db.dropDatabase()" && \
mongoimport --db=$db --collection=stations --jsonArray --file stations.json && \
mongoimport --db=$db --collection=files --jsonArray --file files.json && \
mongo $db --eval "db.files.ensureIndex({date:1})" && \
mongo $db --eval "db.files.ensureIndex({stationId:1})"

