# MongoSampler

This example is similar to what Compass will do but instead of sampling the collection, it will use the whole collection. 

For performance considerations visit [the npm page](https://www.npmjs.com/package/mongodb-schema).

![](CompassScreenshot.png)

# Usage
## From Source:
* Download repo and extract
* Uses libraries `mongodb-schema`, `chalk`, `mongodb`
* `$ ./index.js --host mongodb+srv://username:passwd@host --db dbname --collection colname`

## From Binary
* Download release for Windows, Mac, Linux
* `$ ./MongoSampler-macos --host mongodb+srv://username:passwd@host --db dbname --collection colname`

## Help
```
MongoSampler

A simple application to see what keys exist in a MongoDB collection that didn't enforce a schmea.

        Options:
                -m --host               Connection string including mongdb://, username, password, no trailing /
                -d --db                 Database name
                -c --collection         Collection name
                -v --values             If supplied, include values in response
                -s --sample             If included only do a sample of 1000 docs
                -h --help               If included print help and quit
```

# Editing
Edit `index.js` to put in database, collection, and connection string. Then run the `index.js` and the output will look similar to [SampleOut.json](SampleOut.json) for a given collection whose documents look like [SampleDoc.json](SampleDoc.json).

The `removeValues` boolean will determine whether to pass back all possible values or not.

This was packaged using the package `pkg` with command `pkg index.js`
