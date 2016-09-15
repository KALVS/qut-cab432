const gcloud = require('google-cloud');
const language = gcloud.language;

// Application Configuration and Secrets.
const config = require(__dirname + '/config.js');

// Import, Configure and Initialize Mongoose.
const mongoose = require('mongoose');
const Tweet = require(__dirname + '/models/tweet.model');
mongoose.connect(config.mongo.uri, (error) => {
    (error) ? console.log('Database Connection Error: ' + error) : console.log('Successfully Connected to MongoLab!');
});

const languageClient = language({
    projectId: 'cab432-142505',
    keyFilename: 'CAB432-18dbd972d19d.json'
});

// This is yucky but for the life of me I can't find a nice pattern for asynchronous recursion to process more than a single tweet at a time.
const getTweetSentiment = () => {
    Tweet.findOne({ sentiment: null }).exec().then(doc => {
        if (doc === null) getTweetSentiment();
        else {
            languageClient.detectSentiment(doc.tweet.text, (err, sentiment) => {
                if (err) {
                    if (err.code == 400) {
                        doc.remove();
                        console.log('Removed Tweet');
                        getTweetSentiment();
                    }
                }
                else {
                    console.log('Sentiment is ', sentiment);
                    doc.sentiment = sentiment;
                    doc.save();
                    getTweetSentiment();
                }
            });
        }
    }).catch(error => console.log({ error }));
};

getTweetSentiment();