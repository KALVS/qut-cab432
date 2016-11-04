"use strict";

const router = require('express').Router();
const sentiment = require('sentiment');
const models = require('../models');

router.post('/tweet', (req, res) => {
  const tweet = {};
  tweet.text = req.body.tweet;
  tweet.sentiment = sentiment(tweet.text);

  // Add the initial Tweet and Sentiment to the Database.
  models.Tweet.create({ tweet: tweet.text, sentiment: tweet.sentiment.score });

  // Separate out each word from the tweet and save it to the Database.
  tweet.text.split(' ').map(word => {
    // Remove all special characters, we want URLs, Hashtags, and Tags though. Don't judge, ternary operators are beautiful!
    word = (word.substring(0, 4) === 'http' || word.substring(0, 1) === '@'|| word.substring(0, 1) === '#') ? word : word.replace(/[^a-zA-Z 0-9]+/g,'');

    // Add or Increment the word in the Database.
    models.Word.findOrCreate({ where: { word: word }})
      .spread(word => word.increment('count', { by: 1 }));
  });

  res.json({ success: true });
});

module.exports = router;