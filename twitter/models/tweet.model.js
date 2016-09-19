const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Tweet Schema Definition.
tweetSchema = new Schema( {
  tweet: {},
  location: { type: String, default: null },
  sentiment: { type: Number, default: null },
  candidate: { type: String, default: null }
});

// Construct and Export the Model.
module.exports = mongoose.model('tweet', tweetSchema);