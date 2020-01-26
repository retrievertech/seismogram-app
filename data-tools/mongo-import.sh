db=seismo && \
mongo $db --eval "db.dropDatabase()" && \
mongoimport --db=$db --collection=stations --jsonArray --file stations.json && \
mongoimport --db=$db --collection=files --type json --file files.json && \
mongo $db --eval "db.files.ensureIndex({date:1})" && \
mongo $db --eval "db.files.ensureIndex({stationId:1})" && \
mongo $db --eval "db.files.ensureIndex({status:1})" && \
if [ "$1" != "dev" ]; then
  files_with_metadata=`aws s3 ls "s3://wwssn-metadata/" | perl -e '@lines = <>; @lines = map { s/^.*PRE\s//; s/[\/\s]*$//; "\"$_\"" } @lines; print join ",", @lines'`
  files_with_edited_metadata=`aws s3 ls "s3://wwssn-edited-metadata/" | perl -e '@lines = <>; @lines = map { s/^.*PRE\s//; s/[\/\s]*$//; "\"$_\"" } @lines; print join ",", @lines'`
  echo 'db.files.update({name: {$in: ['$files_with_metadata']}}, {$set: {status:3}}, {multi:true})' > ./foo.js
  mongo $db ./foo.js
  mongo $db --eval 'db.files.update({name: {$in: ['$files_with_edited_metadata']}}, {$set: {status:4}}, {multi:true})'
else
  files_with_metadata=`ls -1 ../client/metadata | perl -e '@lines = <>; @lines = map { s/[\/\s]*$//; "\"$_\"" } @lines; print join ",", @lines'`
  mongo $db --eval 'db.files.update({name: {$in: ['$files_with_metadata']}}, {$set: {status:3}}, {multi:true})'
fi 






