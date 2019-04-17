#!/usr/bin/env node

var mongodb = require('mongodb');
const chalk = require('chalk');
const parseSchema = require('mongodb-schema');
const commandLineArgs = require('command-line-args')

var dbName = "";
var colName = "";
var connstr = ""+dbName;
var keepValues = false;
var sample = false;

const optionDefinitions = [
    { name: 'host', alias: 'h', type: String, description:"Connection string including mongdb://, username, password, no trailing /" },
    { name: 'db', alias: 'd', type: String, description:"Database name" },
    { name: 'collection', alias: 'c', type: String, description:"Collection name" },
    { name: 'values', alias: 'v', type: Boolean, description:"If supplied, include values in response" },
    { name: 'sample', alias: 's', type: Boolean, description:"If included only do a sample of 1000 docs" }
  ]
const options = commandLineArgs(optionDefinitions)

if (options.hasOwnProperty('db')) { dbName = options.db; }
if (options.hasOwnProperty('collection')) { colName = options.collection; }
if (options.hasOwnProperty('host')) { connstr = options.host + "/" + dbName; }
if (options.hasOwnProperty('values')) { keepValues = options.values; }
if (options.hasOwnProperty('sample')) { sample = options.sample; }

console.log(chalk.green('Connecting to: ', connstr));

// get rid of actual values and array length sizes
let walk = doc => {
    for(item in doc){
      if((item === 'values') || (item === 'lengths')){
        delete doc[item]
      }else if((typeof doc[item]) === 'object'){
        walk(doc[item])
      }
    }
    return doc;
}

// pull all fields and data types
mongodb.connect(connstr, { useNewUrlParser: true }, function(err, client){
    if(err){
        console.error(chalk.red('Could not connect to mongodb:', err));
        return process.exit(1);
    }
    var db = client.db(dbName);
    var pipeline = [];

    if(sample) {
        pipeline.push({ '$sample': { 'size': 1000 }});
    }

    parseSchema(db.collection(colName).aggregate(pipeline), function(err, schema) {
        if (err) return console.error(chalk.red(err));

        if(!keepValues) { schema = walk(schema);}

        console.log(JSON.stringify(schema, null, 2));
        client.close();
    });
});

