var express = require('express');
var passport = require('passport');
var Users = require('../models/users');
var router = express.Router();

/* POST new user */
router.post('/', function(req, res) {
  Users.register(new Users({ first_name : req.body.first_name, last_name : req.body.last_name, username : req.body.username, email : req.body.email, phone : req.body.phone }), req.body.password, function(err, user) {
    if (err)
      res.json(err);
    passport.authenticate('local')(req, res, function () {
      req.session.save(function (err) {
        if (err) {
          return next(err);
        }
        res.json(user);
      });
    });
  });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  Users.find(function(err, users) {
    if (err)
      res.send(err);
    res.json(users);
  });
});

/* GET user. */
router.get('/:user_id', function(req, res, next) {
  Users.findById(req.params.user_id, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
});

/* PUT update user. */
router.put('/:user_id', function(req, res, next) {
  Users.findById(req.params.user_id, function(err, user) {
    if (err)
      res.send(err);
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.save(function(err) {
      if (err)
        res.send(err);
      res.json(user);
    });
  });
});

/* DELETE user. */
router.delete('/:user_id', function(req, res, next) {
  Users.findByIdAndRemove(req.params.user_id, function(err, user) {
      if (err)
        res.send(err);
      res.json({ message: 'User deleted' });
  });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.json(req.user);
});

router.get('/logout', function(req, res) {
    req.logout();
});

module.exports = router;
