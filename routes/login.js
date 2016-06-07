var express = require('express');
var passport = require('passport');
var Users = require('../models/users');
var router = express.Router();

router.post('/', passport.authenticate('local'), function(req, res) {
    res.json(req.user);
});

module.exports = router;
