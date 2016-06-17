var express = require('express');
var User = require('../models/users');
var Agency = require('../models/agencies');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
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
    if (req.body.agency_id)
      Agency.findById(req.body.agency_id, function(err, agency) {
        if (err)
          res.json(err);
        agency.users.push({id: user._id});
        agency.save(function(err) {
          if (err)
            res.json(err);
        });
      });
    res.json(user);
  });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find(function(err, users) {
    if (err)
      res.json(err);
    _(users).forEach(function(user) {
      if (user.role == 0)
        user.role_name = 'Super Admin';
      else if (user.role == 1)
        user.role_name = 'Admin';
      else if (user.role == 2)
        user.role_name = 'Editor';
    });
    res.json(users);
  }).select('-password').lean();
});

/* GET user. */
router.get('/:user_id', function(req, res, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.json(err);
    if (user.role == 0)
      user.role_name = 'Super Admin';
    else if (user.role == 1)
      user.role_name = 'Admin';
    else if (user.role == 2)
      user.role_name = 'Editor';
    res.json(user);
  }).select('-password').lean();
});

/* GET user sales. */
router.get('/:user_id/sales', function(req, res, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.json(err);
    var getUserSales = {};
    _(user.sales).forEach(function(sale) {
      getUserSales[sale.id._id] = sale.id;
      if (getUserSales[sale.id._id].type == 0)
        getUserSales[sale.id._id].type_name = 'Appartement';
      else if (getUserSales[sale.id._id].type == 1)
        getUserSales[sale.id._id].type_name = 'Maison';
      getUserSales[sale.id._id].title = getUserSales[sale.id._id].type_name + ' ' + getUserSales[sale.id._id].characteristics.area + 'm2 ' + getUserSales[sale.id._id].address.city + ' ' + getUserSales[sale.id._id].address.zipcode;
    });
    res.json(getUserSales);
  }).populate('sales.id').lean();
});

/* GET user rents. */
router.get('/:user_id/rents', function(req, res, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.json(err);
    var getUserRents = {};
    _(user.rents).forEach(function(rent) {
      getUserRents[rent.id._id] = rent.id;
      if (getUserRents[rent.id._id].type == 0)
        getUserRents[rent.id._id].type_name = 'Appartement';
      else if (getUserRents[rent.id._id].type == 1)
        getUserRents[rent.id._id].type_name = 'Maison';
      getUserRents[rent.id._id].title = rent.id.type_name + ' ' + getUserRents[rent.id._id].characteristics.area + 'm2 ' + getUserRents[rent.id._id].address.city + ' ' + getUserRents[rent.id._id].address.zipcode;
    });
    res.json(getUserRents);
  }).populate('rents.id').lean();
});

/* PUT update user. */
router.put('/:user_id', function(req, res, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.json(err);

    user.state = req.body.state || user.state;
    user.role = req.body.role || user.role;
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.username = req.body.username || user.username;
    user.password = req.body.password || user.password;
    user.phone = req.body.phone || user.phone;
    user.email = req.body.email || user.email;

    if (req.body.agency_id)
      Agency.findById(req.body.agency_id, function(err, agency) {
        if (err)
          res.json(err);
        agency.users.push({id: user._id});
        agency.save(function(err) {
          if (err)
            res.json(err);
        });
      });

    user.save(function(err) {
      if (err)
        res.json(err);
      res.json(user);
    });
  });
});

/* DELETE user. */
router.delete('/:user_id', function(req, res, next) {
  User.findByIdAndRemove(req.params.user_id, function(err, user) {
    if (err)
      res.json(err);
    res.json(user);
  });
});

/* LOGIN user. */
router.post('/login', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, req.app.get('secretKey'), {
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
