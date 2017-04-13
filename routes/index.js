var express = require('express');
var router = express.Router();


var SwController = require('../controllers/SwController');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SWAPIS DEMO - Aponiar' });
});

router.get('/characters', SwController.getCharacters);
router.get('/character/:name', SwController.getCharacterByName);
router.get('/planetresidents', SwController.getPlanetResidents);

module.exports = router;
