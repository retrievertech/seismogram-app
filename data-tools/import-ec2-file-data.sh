db=seismo
login=ubuntu@seismo.redfish.com

ssh $login "mongoexport -d $db -c files --jsonArray -o mongo.json" && \
ssh $login "tar zcvf mongo.json.tar.gz mongo.json" && \
scp $login:./mongo.json.tar.gz . && \
ssh $login "rm -f mongo.json.tar.gz mongo.json" && \
tar zxvf mongo.json.tar.gz && \
mongo $db --eval "db.files.remove({})" && \
mongoimport --host=127.0.0.1 -d $db -c files --jsonArray --file mongo.json && \
rm -f mongo.json.tar.gz mongo.json
