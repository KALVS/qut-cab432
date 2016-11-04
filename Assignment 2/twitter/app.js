"use strict";

const Twitter = require('twitter');
const request = require('request');

// Application Configuration.
const config = require(__dirname + '/config.js');

// Create a Twitter Client.
const client = new Twitter({
  consumer_key: config.twitter.consumer.key,
  consumer_secret: config.twitter.consumer.secret,
  access_token_key: config.twitter.access.key,
  access_token_secret: config.twitter.access.secret
});

// Start the Twitter Stream using the Client.
const stream = client.stream('statuses/filter', { track: config.twitter.track });

// For each data event on the stream, add the tweet to the DB.
stream.on('data', tweet => {
  let tweetText;

  if(tweet != undefined) { // tweet is not undefined
    if(tweet.extended_tweet){ // tweet has extended tweet field
      tweetText = tweet.extended_tweet.full_text;
    } else {
      if(tweet.retweeted_status) { // tweet is retweet
        tweetText = tweet.retweeted_status.text;
      } else {
        tweetText = tweet.text;
      }
    }
  }

  request.post('http://localhost:3000/tweet').form({ tweet: tweetText });
});
