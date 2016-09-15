const config = {
  mongo: {
    username: '',
    password: '',
    url: '',
    port: 0,
    database: ''
  },
  googleCloud: {
    key: ''
  }
};

// Construct the Mongo URI
config.mongo.uri = 'mongodb://' + config.mongo.username + ':' + config.mongo.password + '@' + config.mongo.url + ':' + config.mongo.port + '/' + config.mongo.database;

module.exports = config;