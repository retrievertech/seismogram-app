const util = require('util');
const exec = util.promisify(require('child_process').exec);
const _ = require('underscore');

const db = "seismo"
const myArgs = process.argv.slice(2)
const devMode = myArgs.length > 0 && myArgs[0] === 'dev'

async function execAndPrint(command, print=true) {
  const { stdout, stderr } = await exec(command, {maxBuffer: 1024 * 1024 * 1024});
  if (print) {
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
  }
  return stdout
}

async function mongoImport() {
  await execAndPrint(`mongo ${db} --eval "db.dropDatabase()"`)
  await execAndPrint(`mongoimport --db=${db} --collection=stations --jsonArray --file stations.json`)
  await execAndPrint(`mongoimport --db=${db} --collection=files --jsonArray --file files.json`)
  await execAndPrint(`mongo ${db} --eval "db.files.ensureIndex({date:1})"`)
  await execAndPrint(`mongo ${db} --eval "db.files.ensureIndex({stationId:1})"`)
  await execAndPrint(`mongo ${db} --eval "db.files.ensureIndex({status:1})"`)
  if (devMode) {
    console.log("Unimplemented. See mongo-import.sh")
  } else {
    let filenameRegex = /.*(\d{6}_\d{4}_\d{4}_\d{2}\.png).*/
    let files_with_metadata = (await execAndPrint(`aws s3 ls "s3://wwssn-metadata/" --profile seismo`, false))
      .split('\n')
      .map(line => {
        let match = filenameRegex.exec(line)
        if (match) return match[1]
        return null
      })
      .filter(filename => !!filename)
      .map(filename => `"${filename}"`)
    
    _.chunk(files_with_metadata, 1000).forEach(async chunk => {
      await execAndPrint(`mongo ${db} --eval 'db.files.update({name: {$in: [${chunk.join(',')}]}}, {$set: {status:3}}, {multi:true})'`)
    })
  }
}
mongoImport();

// db=seismo && \
// mongo $db --eval "db.dropDatabase()" && \
// mongoimport --db=$db --collection=stations --jsonArray --file stations.json && \
// mongoimport --db=$db --collection=files --jsonArray --file files.json && \
// mongo $db --eval "db.files.ensureIndex({date:1})" && \
// mongo $db --eval "db.files.ensureIndex({stationId:1})" && \
// mongo $db --eval "db.files.ensureIndex({status:1})" && \
// if [ "$1" != "dev" ]; then
//   files_with_metadata=`aws s3 ls "s3://wwssn-metadata/" --profile seismo | perl -e '@lines = <>; @lines = map { s/^.*PRE\s//; s/[\/\s]*$//; "\"$_\"" } @lines; print join ",", @lines'`
// else
//   files_with_metadata=`ls -1 ../client/metadata | perl -e '@lines = <>; @lines = map { s/[\/\s]*$//; "\"$_\"" } @lines; print join ",", @lines'`
// fi && \
// mongo $db --eval 'db.files.update({name: {$in: ['$files_with_metadata']}}, {$set: {status:3}}, {multi:true})'
