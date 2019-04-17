#!/usr/bin/env node

var mongodb = require('mongodb');
const chalk = require('chalk');
const parseSchema = require('mongodb-schema');

const dbName = "";
const colName = "";
const connstr = ""+dbName;
const removeValues = true;

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

    parseSchema(db.collection(colName).find(), function(err, schema) {
        if (err) return console.error(chalk.red(err));

        if(removeValues) { schema = walk(schema);}

        console.log(JSON.stringify(schema, null, 2));
        client.close();
    });
});

