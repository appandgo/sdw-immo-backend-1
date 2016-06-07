var express = require('express');
var passport = require('passport');
var Users = require('../models/users');
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
