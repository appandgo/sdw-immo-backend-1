var express = require('express');
var FrontUser = require('../models/frontusers');
var jwt = require('jsonwebtoken');
var functions = require('../functions');
var router = express.Router();

/* POST new user */
router.post('/', function(req, res) {
  var frontuser = new FrontUser();

  frontuser.first_name = req.body.first_name;
  frontuser.last_name = req.body.last_name;
  frontuser.username = req.body.username;
  frontuser.password = req.body.password;
  frontuser.phone = req.body.phone;
  frontuser.email = req.body.email;

  frontuser.save(function(err) {
    if (err)
      res.json(err);
    res.json(frontuser);
  });
});

/* GET frontusers listing. */
router.get('/', functions.middleware, function(req, res, next) {
  FrontUser.find(function(err, frontusers) {
    if (err)
      res.json(err);
    res.json(frontusers);
  });
});

/* GET user. */
router.get('/:user_id', functions.middleware, function(req, res, next) {
  FrontUser.findById(req.params.frontuser_id, function(err, frontuser) {
    if (err)
      res.json(err);
    res.json(frontuser);
  });
});

/* PUT update user. */
router.put('/:frontuser_id', functions.middleware, function(req, res, next) {
  FrontUser.findById(req.params.frontuser_id, function(err, user) {
    if (err)
      res.json(err);

    frontuser.state = req.body.state || frontuser.state;
    frontuser.first_name = req.body.first_name || frontuser.first_name;
    frontuser.last_name = req.body.last_name || frontuser.last_name;
    frontuser.username = req.body.username || frontuser.username;
    frontuser.password = req.body.password || frontuser.password;
    frontuser.phone = req.body.phone || frontuser.phone;
    frontuser.email = req.body.email || frontuser.email;

    if ( typeof req.body.sale_id !== 'undefined' && req.body.sale_id )
      frontuser.sales_wishlist.push({id: req.body.sale_id});

    if ( typeof req.body.rent_id !== 'undefined' && req.body.rent_id )
      frontuser.rents_wishlist.push({id: req.body.rent_id});

    frontuser.save(function(err) {
      if (err)
        res.json(err);
      res.json(frontuser);
    });
  });
});

/* DELETE user. */
router.delete('/:user_id', functions.middleware, function(req, res, next) {
  FrontUser.findByIdAndRemove(req.params.frontuser_id, function(err, frontuser) {
    if (err)
      res.json(err);
    res.json(frontuser);
  });
});

/* LOGIN frontuser. */
router.post('/login', function(req, res) {
  FrontUser.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!frontuser) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (frontuser) {
      // check if password matches
      if (frontuser.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        // if user is found and password is right
        // create a token
        var token = jwt.sign(frontuser, req.app.get('secretKey'), {
          expiresIn: 60 * 60 // expires in 24 hours
        });
        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }
  });
});

module.exports = router;
