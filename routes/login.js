var express = require('express');
var passport = require('passport');
var router = express.Router();

router.post('/', passport.authenticate('local'), function(req, res) {
    res.json(req.user);
});

module.exports = router;
