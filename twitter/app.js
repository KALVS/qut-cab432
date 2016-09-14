const Twitter = require('twitter');
const path = require('path');

// Application Configuration and Secrets.
const config = require(__dirname + '/config.js');

// Import, Configure and Initialize Mongoose.
const mongoose = require('mongoose');
const Tweet = require(__dirname + '/models/tweet.model');
mongoose.connect(config.mongo.uri, (error) => {
    (error) ? console.log('Database Connection Error: ' + error) : console.log('Successfully Connected to MongoLab!');
});

// Create a Twitter Client.
const client = new Twitter({
    consumer_key: config.twitter.consumer.key,
    consumer_secret: config.twitter.consumer.secret,
    access_token_key: config.twitter.access.key,
    access_token_secret: config.twitter.access.secret
});

// Start the Twitter Stream using the Client.
const stream = client.stream('statuses/filter', { track: 'realDonaldTrump, DonaldTrump, Donald Trump, Trump, HillaryClinton, Hillary Clinton, Clinton' });

// For each data event on the stream, add the tweet to the DB.
stream.on('data', tweet => addTweet(tweet));

// Helper - Adds Tweet to Database.
function addTweet(tweet) {
    // If there is no Tweet ID, we got an unexpected response object.
    if (!tweet.id) { console.log("Tweet ID is not present!"); return; }

    // Sometimes tweets are sent twice, does this tweet already exist in our DB?
    Tweet.count({"tweet.id": tweet.id}, function(err, count) {
        if (err) { console.log(err); return; }
        if (count > 0) { console.log("Tweet already exists with ID: " + tweet.id); return; }

        // It's not a repeat, save it!
        if (count == 0) {
            const t = new Tweet();
            t.tweet = tweet;
            t.tweet.created_at = new Date(tweet.created_at);
            t.save(function(err) {
                if (err) console.log(err);
                else console.log("Added tweet with ID: " + tweet.id);
            });
        }
    });
}