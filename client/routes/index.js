var express = require('express');
var router = express.Router();

// Database magic.
const Tweet = require(__dirname + '/../models/tweet.model');

// Routes are totally super complicated, better only use one!
router.get('/', function(req, res) {
  // We're going to need some boilerplate data objects for our maps.
  let arrayTrump = [['State', 'Sentiment']];
  let arrayClinton = [['State', 'Sentiment']];

  // Aggregate the data for Trump.
  Tweet.aggregate([
    {$match: { candidate: 'Donald Trump' }},
    {$group: { _id: '$location', avg: { $avg: '$sentiment' }}}
  ], (err, resultsTrump) => {
    if (!err) {
      resultsTrump.map((result) => arrayTrump.push([result._id, result.avg]));

      // Aggregate the data for Clinton.
      Tweet.aggregate([
        {$match: { candidate: 'Hillary Clinton' }},
        {$group: { _id: '$location', avg: { $avg: '$sentiment' }}}
      ], (err, resultsClinton) => {
        if (!err) {
          resultsClinton.map((result) => arrayClinton.push([result._id, result.avg]));

          // Pass through the data to the template and render the page.
          res.render('index', { trump: JSON.stringify(arrayTrump), clinton: JSON.stringify(arrayClinton) });
        } else res.render('error', { message: 'Oops! There was an issue with a query.', error: err })
      });
    } else res.render('error', { message: 'Oops! There was an issue with a query.', error: err })
  });
});

module.exports = router;