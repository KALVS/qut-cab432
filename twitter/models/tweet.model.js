const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Tweet Schema Definition.
tweetSchema = new Schema( { tweet: {}, sentiment: { type: Number, default: null } });

// Construct and Export the Model.
module.exports = mongoose.model('tweet', tweetSchema);