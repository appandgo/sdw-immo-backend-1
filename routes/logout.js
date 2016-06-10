var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', function(req, res) {
    req.logout();
});

/*

router.post('/logout/:id', function(req, res) {
    req.logout();
});

*/

module.exports = router;
