db=seismo
login=ubuntu@52.10.53.123

ssh $login "mongoexport -d $db -c files --jsonArray -o mongo.json" && \
ssh $login "tar zcvf mongo.json.tar.gz mongo.json" && \
scp $login:./mongo.json.tar.gz . && \
ssh $login "rm -f mongo.json.tar.gz" && \
tar zxvf mongo.json.tar.gz && \
mongo $db --eval "db.files.remove({})" && \
mongoimport -d $db -c files --jsonArray --file mongo.json && \
rm -f mongo.json.tar.gz mongo.json
