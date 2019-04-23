#!/usr/bin/env node

/////////////////////
// Global Configuration
/////////////////////
// all required packages
var mongodb = require('mongodb');
const chalk = require('chalk');
const parseSchema = require('mongodb-schema');
const commandLineArgs = require('command-line-args')

// global variables
var dbName = "";
var colName = "";
var connstr = ""+dbName;
var keepValues = false;
var sample = 0;
var all = false;
var returnJSON = {"results":[]};
var progress = {};

// command line argument parser
const optionDefinitions = [
    { name: 'host', alias: 'm', type: String, description:"Connection string including mongdb://, username, password, no trailing /" },
    { name: 'db', alias: 'd', type: String, description:"Database name" },
    { name: 'collection', alias: 'c', type: String, description:"Collection name" },
    { name: 'values', alias: 'v', type: Boolean, description:"If supplied, include values in response" },
    { name: 'sample', alias: 's', type: Number, description:"If included, only do a sample of specified number of docs" },
    { name: 'all', alias: 'a', type: Boolean, description:"If included, ignores db and collection flags and finds all dbs and collections" },
    { name: 'help', alias: 'h', type: Boolean, description:"If included, print help and quit" }
  ]
const options = commandLineArgs(optionDefinitions)

// if argument was help, draw basic help screen and quit
if(options.hasOwnProperty('help')) {
    console.log(chalk.yellow("\nMongoSampler\n"));
    console.log("A simple application to see what keys exist in a MongoDB collection that didn't enforce a schmea.\n");
    console.log("\tOptions:");
    for(i=0; i<optionDefinitions.length; i++) {
        console.log("\t\t-"+optionDefinitions[i].alias+" --"+optionDefinitions[i].name+" \t\t"+optionDefinitions[i].description);
    }
    return process.exit(0);
}

// it was not help
// parse all other arguments
if (options.hasOwnProperty('db')) { dbName = options.db; }
if (options.hasOwnProperty('collection')) { colName = options.collection; }
if (options.hasOwnProperty('host')) { connstr = options.host + "/" + dbName; }
if (options.hasOwnProperty('values')) { keepValues = options.values; }
if (options.hasOwnProperty('sample')) { sample = options.sample; }
if (options.hasOwnProperty('all')) { all = options.all; }

/////////////////////
// Function declarations
/////////////////////
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

// given a namespace (dbName.collectionName), run the same
// code as what compass runs on schema tab and put results of that into global returnJSON object
function analyzeSchema(namespace, client, pipeline) {
  //console.log(namespace)
  var dbname = namespace.split('.')[0];
  var colname = namespace.split('.')[1];
  var db = client.db(dbname);
  var op ={};
  if(!keepValues) { op = {'storeValues':false}; }
  parseSchema(db.collection(colname).aggregate(pipeline), op, function(err, schema) {
      if (err) return console.error(chalk.red(err));
      var newobj = {};
      newobj.database = dbname;
      newobj.collection = colname;
      if(keepValues) {
        newobj.schema = schema;
      } else {
        newobj.schema = walk(schema);
      }
      returnJSON.results.push(newobj);
      delete progress[namespace];
      loopsLeft(client);
  });
}

// using global state it will track what still needs to be processed
// when complete, write out full JSON doc of returnJSON and quit and close mdb connection
function loopsLeft(client) {
  if(Object.keys(progress).length == 0) {
      console.log(JSON.stringify(returnJSON, null, 2));
      client.close();
      return process.exit(0);
  }
}


/////////////////////
// Main loop
/////////////////////
mongodb.connect(connstr, { useNewUrlParser: true }, function(err, client){
    if(err){
        console.error(chalk.red('Could not connect to mongodb:', err));
        return process.exit(1);
    }

    // if using sample, use that count, otherwise we will use all docs
    var pipeline = [];
    if(sample>0) {
        pipeline.push({ '$sample': { 'size': sample }});
    }

    // if all databases
    if(all) {
      var db = client.db("admin");
      var admin = db.admin();
      // use admin db to find all databases and iterate over it
      admin.listDatabases(function (err, dbObjects) {
          for(d=0;d<dbObjects.databases.length;d++){
              // ignore system databases
              if((dbObjects.databases[d].name != "admin") && (dbObjects.databases[d].name != "local")&& (dbObjects.databases[d].name != "auth")&& (dbObjects.databases[d].name != "config")) {
                  // find all collections for this database
                  // this nightmare code is because this is an async function
                  // so much less code would be needed if every call was sync and blocking
                  client.db(dbObjects.databases[d].name).listCollections().toArray(function (err, collInfos) {
                      for (var i = 0; i < collInfos.length; i++) {
                          progress[collInfos[i].idIndex.ns] = true;
                          analyzeSchema(collInfos[i].idIndex.ns, client);
                      }
                  });

              }
          }
      });
    } else {
      // if only one specified db
      var db = client.db(dbName);
      analyzeSchema(dbName+"."+colName,client);
    }
});

