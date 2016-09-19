const Twitter = require('twitter');
const geocoder = require('google-geocoder');
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

// Create a Geocoder Client.
var geo = geocoder(config.google);

// Create a Language Client.
const languageClient = language({
  projectId: 'ferrous-layout-137723',
  keyFilename: 'QUT-CAB432-11fa54834b88.json'
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

    // Fetch the additional location and sentiment data we need to analyse the Tweet and save it to the Database.
    geo.find(tweet.location, (err, data) => {
      if (err) { console.log('Oops! We have a Geocode Error!', err); return; }
      if (data.length == 0) { console.log('Oops! Geocode results are empty!'); return; }
      else if (data[0].country === undefined || data[0].province_state === undefined) { console.log('Oops! That tweet doesn\'t have a country or province defined!'); return; }
      else if (data[0].country.short_name != 'US') { console.log('Oops! That tweet wasn\'t from within the US!'); return; }

      languageClient.detectSentiment(tweet.text, (err, sentiment) => {
        if (err) { console.log('error1: ', err); return; }

        // We should probably also figure out which candidate to assign the tweet to.
        const candidate = findCandidate(tweet.text);
        if (!candidate) { console.log('We didn\'t find a candidate!'); return; }

        let t = new Tweet();
        t.tweet = tweet;
        t.location = data[0].province_state.long_name;
        t.sentiment = sentiment;
        t.candidate = candidate;
        t.save(function(err) {
          if (err) console.log('error2: ', err);
          else console.log('Added a Tweet to ' + t.candidate + ' in ' + t.tweet.location + ' with sentiment of ' + t.sentiment);
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