var express = require('express');
var User = require('../models/users');
var functions = require('../functions');
var router = express.Router();

/* POST new user */
router.post('/', function(req, res) {
  var user = new User();

  user.role = req.body.role;
  user.first_name = req.body.first_name;
  user.last_name = req.body.last_name;
  user.username = req.body.username;
  user.password = req.body.password;
  user.phone = req.body.phone;
  user.email = req.body.email;

  user.save(function(err) {
    if (err)
      res.json(err);
    res.json(user);
  });
});

/* GET users listing. */
router.get('/', functions.middleware, function(req, res, next) {
  User.find(function(err, users) {
    if (err)
      res.json(err);
    res.json(users);
  });
});

/* GET user. */
router.get('/:user_id', functions.middleware, function(req, res, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.json(err);
    res.json(user);
  });
});

/* PUT update user. */
router.put('/:user_id', functions.middleware, function(req, res, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.json(err);

    user.state = user.body.state || user.state;
    user.role = req.body.role || user.role;
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.username = req.body.username || user.username;
    user.password = req.body.password || user.password;
    user.phone = req.body.phone || user.phone;
    user.email = req.body.email || user.email;

    if ( typeof req.body.sale_id !== 'undefined' && req.body.sale_id )
      user.sales_wishlist.push({id: req.body.sale_id});

    if ( typeof req.body.rent_id !== 'undefined' && req.body.rent_id )
      user.rents_wishlist.push({id: req.body.rent_id});

    user.save(function(err) {
      if (err)
        res.json(err);
      res.json(user);
    });
  });
});

/* DELETE user. */
router.delete('/:user_id', functions.middleware, function(req, res, next) {
  User.findByIdAndRemove(req.params.user_id, function(err, user) {
    if (err)
      res.json(err);
    res.json(user);
  });
});

module.exports = router;
