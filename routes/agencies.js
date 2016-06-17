var express = require('express');
var Agency = require('../models/agencies');
var User = require('../models/users');
var _ = require('lodash');
var functions = require('../functions');
var router = express.Router();

/* POST new agency */
router.post('/', function(req, res) {
  var agency = new Agency();

  var address = {'building': req.body.building,
    'street': req.body.street,
    'zipcode': req.body.zipcode,
    'city': req.body.city,
    'country': req.body.country};

  agency.state = req.body.state || true;
  agency.name = req.body.name;
  agency.address = address;
  agency.phone = req.body.phone;
  agency.email = req.body.email;

  agency.save(function(err) {
    if (err)
      res.json(err);
    res.json(agency);
  });
});

/* GET agencies listing. */
router.get('/', function(req, res, next) {
  Agency.find(function(err, agencies) {
    if (err)
      res.json(err);
    res.json(agencies);
  });
});

/* GET agency. */
router.get('/:agency_id', function(req, res, next) {
  Agency.findById(req.params.agency_id, function(err, agency) {
    if (err)
      res.json(err);
    res.json(agency);
  });
});

/* GET agency users. */
router.get('/:agency_id/users', function(req, res, next) {
  Agency.findById(req.params.agency_id, function(err, agency) {
    if (err)
      res.json(err);
    var getAgencyUsers = {};
    _(agency.users).forEach(function(user) {
      getAgencyUsers[user.id._id] = user.id;
      if (getAgencyUsers[user.id._id].role == 0)
        getAgencyUsers[user.id._id].role_name = 'Super Admin';
      else if (getAgencyUsers[user.id._id].role == 1)
        getAgencyUsers[user.id._id].role_name = 'Admin';
      else if (getAgencyUsers[user.id._id].role == 2)
        getAgencyUsers[user.id._id].role_name = 'Editor';
    });
    res.json(getAgencyUsers);
  }).populate('users.id').lean();
});

/* GET agency sales. */
router.get('/:agency_id/sales', function(req, res, next) {
  Agency.findById(req.params.agency_id, function(err, agency) {
    if (err)
      res.json(err);
    var getAgencySales = {};
    _(agency.sales).forEach(function(sale) {
      getAgencySales[sale.id._id] = sale.id;
      if (getAgencySales[sale.id._id].type == 0)
        getAgencySales[sale.id._id].type_name = 'Appartement';
      else if (getAgencySales[sale.id._id].type == 1)
        getAgencySales[sale.id._id].type_name = 'Maison';
      getAgencySales[sale.id._id].title = getAgencySales[sale.id._id].type_name + ' ' + getAgencySales[sale.id._id].characteristics.area + 'm2 ' + getAgencySales[sale.id._id].address.city + ' ' + getAgencySales[sale.id._id].address.zipcode;
    });
    res.json(getAgencySales);
  }).populate('sales.id').lean();
});

/* GET agency rents. */
router.get('/:agency_id/rents', function(req, res, next) {
  Agency.findById(req.params.agency_id, function(err, agency) {
    if (err)
      res.json(err);
    var getAgencyRents = {};
    _(agency.rents).forEach(function(rent) {
      getAgencyRents[rent.id._id] = rent.id;
      if (getAgencyRents[rent.id._id].type == 0)
        getAgencyRents[rent.id._id].type_name = 'Appartement';
      else if (getAgencyRents[rent.id._id].type == 1)
        getAgencyRents[rent.id._id].type_name = 'Maison';
      getAgencyRents[rent.id._id].title = getAgencyRents[rent.id._id].type_name + ' ' + getAgencyRents[rent.id._id].characteristics.area + 'm2 ' + getAgencyRents[rent.id._id].address.city + ' ' + getAgencyRents[rent.id._id].address.zipcode;
    });
    res.json(getAgencyRents);
  }).populate('rents.id').lean();
});

/* PUT update agency. */
router.put('/:agency_id', function(req, res, next) {
  Agency.findById(req.params.agency_id, function(err, agency) {
    if (err)
      res.json(err);

    var address = {'building': req.body.building || rent.address.building,
      'street': req.body.street || rent.address.street,
      'zipcode': req.body.zipcode || rent.address.zipcode,
      'city': req.body.city || rent.address.city,
      'country': req.body.country || rent.address.country};

    agency.state = req.body.state || agency.state;
    agency.name = req.body.name || agency.name;
    agency.address = address || agency.address;
    agency.phone = req.body.phone || agency.phone;
    agency.email = req.body.email || agency.email;

    if ( typeof req.body.user_id !== 'undefined' && req.body.user_id )
      User.findById(req.body.user_id, function(err, user) {
        if (err)
          res.json(err);
        agency.users.push({id: user._id});
      });

    agency.save(function(err) {
      if (err)
        res.json(err);
      res.json(agency);
    });
  });
});

/* DELETE agency. */
router.delete('/:agency_id', function(req, res, next) {
  Agency.findByIdAndRemove(req.params.agency_id, function(err, agency) {
    if (err)
      res.json(err);
    res.json(agency);
  });
});

module.exports = router;
