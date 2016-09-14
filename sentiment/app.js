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

// Tweet.find({ sentiment: null }).exec((err, docs) => {
//     if (err) console.log({ error: err });
//     else docs.map((doc, index) => {
//         languageClient.detectSentiment(doc.tweet.text, (err, sentiment) => {
//             console.log('Analysed Tweet ' + index + ' of ' + docs.length);
//             if (err) console.log({ tweet: doc.tweet.text, error: err.message });
//             else {
//                 console.log('Sentiment is ', sentiment);
//                 doc.sentiment = sentiment;
//                 doc.save();
//             }
//         });
//     })
// });

Tweet.find({ sentiment: null }).limit(50).exec().then(docs => {
    docs.map((doc, index) => {
        languageClient.detectSentiment(doc.tweet.text, (err, sentiment) => {
            console.log('Analysed Tweet ' + index + ' of ' + docs.length);

            if (err) {
                if (err.code == 400) {
                    doc.remove();
                    console.log('Removed Tweet ' + index);
                }
            }
            else {
                console.log('Sentiment is ', sentiment);
                doc.sentiment = sentiment;
                doc.save();
            }
        });
    })
}).catch(error => console.log({ error }));