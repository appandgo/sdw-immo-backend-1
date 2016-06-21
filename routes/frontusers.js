var express = require('express');
var FrontUser = require('../models/frontusers');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var functions = require('../functions');
var router = express.Router();

/* [POST : /frontusers ] Registering a new frontuser */
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

/* [GET : /frontusers ] Get information from all frontusers */
router.get('/', function(req, res, next) {
  FrontUser.find(function(err, frontusers) {
    if (err)
      res.json(err);
    res.json(frontusers);
  }).select('-password');
});

/* [GET : /frontusers/:frontuser_id ] Get information from a frontuser */
router.get('/:frontuser_id', function(req, res, next) {
  FrontUser.findById(req.params.frontuser_id, function(err, frontuser) {
    if (err)
      res.json(err);
    res.json(frontuser);
  }).select('-password');
});

/* [GET : /frontusers/:frontuser_id/sales ] Get favorite user sales */
router.get('/:frontuser_id/sales', function(req, res, next) {
  FrontUser.findById(req.params.frontuser_id, function(err, frontuser) {
    if (err)
      res.json(err);
    var getFrontUserSales = {};
    _(frontuser.sales).forEach(function(sale) {
      getFrontUserSales[sale.id._id] = sale.id;
      if (getFrontUserSales[sale.id._id].type == 0)
        getFrontUserSales[sale.id._id].type_name = 'Appartement';
      else if (getFrontUserSales[sale.id._id].type == 1)
        getFrontUserSales[sale.id._id].type_name = 'Maison';
      getFrontUserSales[sale.id._id].title = getFrontUserSales[sale.id._id].type_name + ' ' + getFrontUserSales[sale.id._id].characteristics.area + 'm2 ' + getFrontUserSales[sale.id._id].address.city + ' ' + getFrontUserSales[sale.id._id].address.zipcode;
    });
    res.json(getFrontUserSales);
  }).populate('sales.id').lean();
});

/* [GET : /frontusers/:frontuser_id/rents ] Get favorite user rents */
router.get('/:frontuser_id/rents', function(req, res, next) {
  FrontUser.findById(req.params.frontuser_id, function(err, frontuser) {
    if (err)
      res.json(err);
    var getFrontUserRents = {};
    _(frontuser.rents).forEach(function(rent) {
      getFrontUserRents[rent.id._id] = rent.id;
      if (getFrontUserRents[rent.id._id].type == 0)
        getFrontUserRents[rent.id._id].type_name = 'Appartement';
      else if (getFrontUserRents[rent.id._id].type == 1)
        getFrontUserRents[rent.id._id].type_name = 'Maison';
      getFrontUserRents[rent.id._id].title = rent.id.type_name + ' ' + getFrontUserRents[rent.id._id].characteristics.area + 'm2 ' + getFrontUserRents[rent.id._id].address.city + ' ' + getFrontUserRents[rent.id._id].address.zipcode;
    });
    res.json(getFrontUserRents);
  }).populate('rents.id').lean();
});

/* [PUT : /frontusers/:frontuser_id ] Update a frontuser's information */
router.put('/:frontuser_id', function(req, res, next) {
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

    frontuser.save(function(err) {
      if (err)
        res.json(err);
      res.json(frontuser);
    });
  });
});

/* [DELETE : /frontusers/:frontuser_id ] Remove a sale of a frontuser favorites */
router.delete('/:frontuser_id/sales/:sale_id', function(req, res, next) {
  FrontUser.findOneAndUpdate({ '_id': req.params.frontuser_id, 'sales.id': req.params.sale_id }, {$pull: {sales: {id: req.params.sale_id}}}, function(err, frontuser) {
    if (err)
      res.json(err);
    var saleDeleted;
    _(frontuser.sales).forEach(function(sale) {
      if (sale._id == req.params.sale_id)
        saleDeleted = sale;
    });
    res.json(saleDeleted);
  });
});

/* [DELETE : /frontusers/:frontuser_id ] Remove a rent of a frontuser favorites */
router.delete('/:frontuser_id/rents/:rent_id', function(req, res, next) {
  FrontUser.findOneAndUpdate({ '_id': req.params.frontuser_id, 'rents.id': req.params.rent_id }, {$pull: {rents: {id: req.params.rent_id}}}, function(err, frontuser) {
    if (err)
      res.json(err);
    var rentDeleted;
    _(frontuser.rents).forEach(function(rent) {
      if (rent._id == req.params.rent_id)
        rentDeleted = rent;
    });
    res.json(rentDeleted);
  });
});

/* [DELETE : /frontusers/:frontuser_id ] Delete frontuser */
router.delete('/:user_id', function(req, res, next) {
  FrontUser.findByIdAndRemove(req.params.frontuser_id, function(err, frontuser) {
    if (err)
      res.json(err);
    res.json(frontuser);
  });
});

/* [POST : /frontusers/login ] Login a frontuser */
router.post('/login', function(req, res) {
  FrontUser.findOne({
    username: req.body.username
  }, function(err, frontuser) {
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
        delete frontuser.password;
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token,
          frontuser: frontuser
        });
      }
    }
  }).lean();
});

module.exports = router;
