var express = require('express');
var router = express.Router();

const ctrlMain = require('../controllers/main');

router.get('/', ctrlMain.index);
router.get('/news', (req,res) => res.render('news', {title:'News'}));

module.exports = router;