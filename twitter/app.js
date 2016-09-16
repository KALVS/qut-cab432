const Twitter = require('twitter');
const geocoder = require('geocoder');
const language = require('google-cloud').language;
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

// Create a Language Client.
const languageClient = language({
  projectId: 'cab432-142505',
  keyFilename: 'CAB432-18dbd972d19d.json'
});

// Start the Twitter Stream using the Client.
const stream = client.stream('statuses/filter', { track: 'realDonaldTrump, DonaldTrump, Donald Trump, Trump, HillaryClinton, Hillary Clinton, Clinton' });

// For each data event on the stream, add the tweet to the DB.
stream.on('data', tweet => addTweet(tweet));

// Helper - Adds Tweet to Database.
function addTweet(tweet) {
  // If there is no Tweet ID, we got an unexpected response object.
  if (!tweet.id) return;

  // Sometimes tweets are sent twice, does this tweet already exist in our DB?
  Tweet.count({"tweet.id": tweet.id}, function(err, count) {
    // Make sure we don't get any dodgy shit going on with our tweets.
    if (err || count > 0 || (tweet.lang != 'en' && tweet.lang != 'es')) return;

    // Only include the data we actually need, there is a lot of useless shit in tweet data that we don't need for this specific application.
    tweet = { id: tweet.id, text: tweet.text, location: tweet.user.location, timestamp: tweet.timestamp_ms };
    console.log(tweet.location);

    // Fetch the additional location and sentiment data we need to analyse the Tweet and save it to the Database.
    geocoder.geocode(tweet.location, (err, data) => {
      if (err) { console.log('Geocode Error!'); return; }
      if (data.results.length == 0) { console.log('Results are empty!', data); return; }
      tweet.location = { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng };

      languageClient.detectSentiment(tweet.text, (err, sentiment) => {
        if (err) { console.log(err); return; }

        // We should probably also figure out which candidate to assign the tweet to.
        const candidate = findCandidate(tweet.text);
        if (!candidate) return;

        const t = new Tweet();
        t.tweet = tweet;
        t.sentiment = sentiment;
        t.candidate = candidate;
        t.save(function(err) {
          if (err) console.log(err);
          else console.log("Added tweet with ID: " + tweet.id + ' to ' + t.candidate);
        });
      });
    });
  });
}

// Helper - Returns the candidates name from the text. There has to be a batter way to do this though?
function findCandidate(text) {
  if (text.indexOf('DonaldTrump') != -1) return 'Donald Trump';
  else if (text.toLowerCase().indexOf('donald trump') != -1) return 'Donald Trump';
  else if (text.toLowerCase().indexOf('trump') != -1) return 'Donald Trump';
  else if (text.toLowerCase().indexOf('hillaryclinton') != -1) return 'Hillary Clinton';
  else if (text.toLowerCase().indexOf('hillary clinton') != -1) return 'Hillary Clinton';
  else if (text.toLowerCase().indexOf('clinton') != -1) return 'Hillary Clinton';
  else return false;
}