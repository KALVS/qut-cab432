"use strict";

const router = require('express').Router();
const models = require('../models');

router.get('/', (req, res) => {
  Promise.all([
    models.Tweet.aggregate('sentiment', 'count'),
    models.Tweet.aggregate('sentiment', 'avg', { dataType: 'float' }),
    models.Word.findOne({ where: { word: 'literally' }}),
    models.Word.findOne({ where: { word: 'figuratively' }}),
    models.Word.findAll({ order: 'count DESC', limit: 50 })
  ]).then(results => {
    // Now we have our data, we need it in a nicer format.
    const totalTweets = results[0];
    const globalSentiment = results[1];
    const defcon = (globalSentiment < -1.5) ? 1 : (globalSentiment >= -1.5 && globalSentiment < -0.5) ? 2 : (globalSentiment >= -0.5 && globalSentiment < 0.5) ? 3 : (globalSentiment >= 0.5 && globalSentiment < 1.5) ? 4 : 5;
    const wordVsWord = Math.floor((results[2].count / (results[2].count + results[3].count)) * 100);
    const wordCloud = [['foo', 10], ['bar', 6], ['lol', 6], ['poo', 6], ['yup', 6]];
    // const wordCloud = results[4].map(word => [word.word, word.count]);
    const data = {
      totalTweets: totalTweets,
      globalSentiment: globalSentiment,
      defcon: defcon,
      wordVsWord: wordVsWord,
      wordCloud: wordCloud
    };

    res.render('index', data);
  });
});

router.get('/raw-data', (req, res) => {
  // Yeah I copy/pasted this. I should have wrapped it in a function, fight me.
  Promise.all([
    models.Tweet.aggregate('sentiment', 'count'),
    models.Tweet.aggregate('sentiment', 'avg', { dataType: 'float' }),
    models.Word.findOne({ where: { word: 'literally' }}),
    models.Word.findOne({ where: { word: 'figuratively' }}),
    models.Word.findAll({ order: 'count DESC', limit: 50 })
  ]).then(results => {
    // Now we have our data, we need it in a nicer format.
    const totalTweets = results[0];
    const globalSentiment = results[1];
    const defcon = (globalSentiment < -1.5) ? 1 : (globalSentiment >= -1.5 && globalSentiment < -0.5) ? 2 : (globalSentiment >= -0.5 && globalSentiment < 0.5) ? 3 : (globalSentiment >= 0.5 && globalSentiment < 1.5) ? 4 : 5;
    const wordVsWord = Math.floor((results[2].count / (results[2].count + results[3].count)) * 100);
    const wordCloud = results[4].map(word => [word.word, word.count]);
    const data = {
      totalTweets: totalTweets,
      globalSentiment: globalSentiment,
      defcon: defcon,
      wordVsWord: wordVsWord,
      wordCloud: wordCloud
    };

    res.json(data);
  });

});

module.exports = router;