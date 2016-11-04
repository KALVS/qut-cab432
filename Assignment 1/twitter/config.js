const config = {
  mongo: {
    username: 'cab432',
    password: 'cab432',
    url: 'ds019766.mlab.com',
    port: 19766,
    database: 'cab432-api-mashup'
  },
  twitter: {
    consumer: {
      key: 'pp2UJ6wEdt9N2RsN6ckbnPyAP',
      secret: 'RZn0oDE0TYTtfiasL4ZSAaoloXNlM2EdzpSVi404FNLNpm5erJ'
    },
    access: {
      key: '3250619299-8ARjDfL2IxqmITCIa742NhjJqqjphTIxuF6URZ3',
      secret: '9quaG9jxkN6Z3crGwndWQR2CAixDKSxXQv4H4lUDskvVC'
    }
  },
  google: {
    key: 'AIzaSyBa2zvFsNPGduWRz5SCHt5elIm2IIdS3Q8'
  }
};

// Construct the Mongo URI
config.mongo.uri = 'mongodb://' + config.mongo.username + ':' + config.mongo.password + '@' + config.mongo.url + ':' + config.mongo.port + '/' + config.mongo.database;

module.exports = config;