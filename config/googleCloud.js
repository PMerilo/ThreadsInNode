// Imports the Google Cloud client library.
const {Storage} = require('@google-cloud/storage');
const { path } = require('pdfkit');

// Instantiates a client. If you don't specify credentials when constructing
// the client, the client library will look for credentials in the
// environment.
const storage = new Storage({
    keyFilename: path.join(__dirname, '../config/googleCloud.json'),
    projectId: '118338639779935055171'
});
// Makes an authenticated API request.
async function listBuckets() {
  try {
    const results = await storage.getBuckets();

    const [buckets] = results;

    console.log('Buckets:');
    buckets.forEach(bucket => {
      console.log(bucket.name);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }
}
listBuckets();