db=seismo && \
mongo $db --eval "db.dropDatabase()" && \
mongoimport --db=$db --collection=stations --jsonArray --file stations.json && \
mongoimport --db=$db --collection=files --jsonArray --file files.json && \
mongo $db --eval "db.files.ensureIndex({date:1})" && \
mongo $db --eval "db.files.ensureIndex({stationId:1})" && \
mongo $db --eval "db.files.ensureIndex({status:1})" && \
files_with_metadata=`aws s3 ls "s3://wwssn-metadata/" | perl -e '@lines = <>; @lines = map { s/^.*PRE\s//; s/[\/\s]*$//; "\"$_\"" } @lines; print join ",", @lines'` && \
mongo $db --eval 'db.files.update({name: {$in: ['$files_with_metadata']}}, {$set: {status:3}}, {multi:true})'
