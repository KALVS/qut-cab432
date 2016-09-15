const config = {
  mongo: {
    username: '',
    password: '',
    url: '',
    port: 0,
    database: ''
  },
  twitter: {
    consumer: {
      key: '',
      secret: ''
    },
    access: {
      key: '',
      secret: ''
    }
  }
};

// Construct the Mongo URI
config.mongo.uri = 'mongodb://' + config.mongo.username + ':' + config.mongo.password + '@' + config.mongo.url + ':' + config.mongo.port + '/' + config.mongo.database;

module.exports = config;