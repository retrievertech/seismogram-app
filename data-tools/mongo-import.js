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
  await execAndPrint(`mongosh ${db} --eval "db.dropDatabase()"`)
  await execAndPrint(`mongoimport --db=${db} --collection=stations --jsonArray --file stations.json`)
  await execAndPrint(`mongoimport --db=${db} --collection=files --jsonArray --file files.json`)
  await execAndPrint(`mongosh ${db} --eval "db.files.createIndex({date:1})"`)
  await execAndPrint(`mongosh ${db} --eval "db.files.createIndex({stationId:1})"`)
  await execAndPrint(`mongosh ${db} --eval "db.files.createIndex({status:1})"`)
  let processed_files
  let edited_files
  if (devMode) {
    processed_files = fs.readFileSync('data/wwssn-metadata-26-01-2025.txt', 'utf8')
    edited_files = fs.readFileSync('data/wwssn-edited-metadata-26-01-2025.txt', 'utf8')
  } else {
    processed_files = (await execAndPrint(`aws s3 ls "s3://wwssn-metadata/" --profile seismo`, false))
    edited_files = (await execAndPrint(`aws s3 ls "s3://wwssn-edited-metadata/" --profile seismo`, false))
  }

  let filenameRegex = /.*(\d{6}_\d{4}_\d{4}_\d{2}\.png).*/
  processed_files = processed_files
    .split('\n')
    .map(line => {
      let match = filenameRegex.exec(line)
      if (match) return match[1]
      return null
    })
    .filter(filename => !!filename)
    .map(filename => `"${filename}"`)
  
  let chunks = _.chunk(processed_files, 1000)
  for (let chunk of chunks) {
    await execAndPrint(`mongosh ${db} --eval 'db.files.update({name: {$in: [${chunk.join(',')}]}}, {$set: {status:3}}, {multi:true})'`)
  }

  edited_files = edited_files
    .split('\n')
    .map(line => {
      let match = filenameRegex.exec(line)
      if (match) return match[1]
      return null
    })
    .filter(filename => !!filename)
    .map(filename => `"${filename}"`)
  
  chunks = _.chunk(edited_files, 1000)
  for (let chunk of chunks) {
    await execAndPrint(`mongosh ${db} --eval 'db.files.update({name: {$in: [${chunk.join(',')}]}}, {$set: {status:4}}, {multi:true})'`)
  }
}

mongoImport()
