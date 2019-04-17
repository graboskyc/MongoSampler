# MongoSampler

This example is similar to what Compass will do but instead of sampling the collection, it will use the whole collection. 

For performance considerations visit [the npm page](https://www.npmjs.com/package/mongodb-schema).

![](CompassScreenshot.png)

# Usage
Basic Usage: 
`graboskycMBP:MongoSampler graboskyc$ ./index.js --host mongodb+srv://username:passwd@host --db dbname --collection colname`

Add the `--values` flag if you want to include values into the JSON output

Use the `--sample` flag if instead of using all documents in the collection and instead use a random 1000 documents

# Editing
Edit `index.js` to put in database, collection, and connection string. Then run the `index.js` and the output will look similar to [SampleOut.json](SampleOut.json) for a given collection whose documents look like [SampleDoc.json](SampleDoc.json).

The `removeValues` boolean will determine whether to pass back all possible values or not.