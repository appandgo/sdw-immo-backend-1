var express = require('express');
var Sale = require('../models/sales');
var User = require('../models/users');
var Agency = require('../models/agencies');
var functions = require('../functions');
var _ = require('lodash')
var router = express.Router();

/* POST new sale */
router.post('/', function(req, res) {
  var sale = new Sale();

  var address = {'building': req.body.building,
    'street': req.body.street,
    'zipcode': req.body.zipcode,
    'city': req.body.city,
    'country': req.body.country};

  var characteristics = {'price': req.body.price,
    'area': req.body.area,
    'rooms': req.body.rooms,
    'bedrooms': req.body.bedrooms};

  var owner = {'first_name': req.body.first_name,
    'last_name': req.body.last_name,
    'phone': req.body.phone};

  sale.state = req.body.state;
  sale.type = req.body.type;
  sale.address = address;
  sale.characteristics = characteristics;
  sale.owner = owner;

  sale.save(function(err) {
    if (err)
      res.json(err);
    User.findById(req.body.user_id, function(err, user) {
      if (err)
        res.json(err);
      user.sales.push({id: sale._id});
      user.save(function(err) {
        if (err)
          res.json(err);
      });
    });
    Agency.findById(req.body.agency_id, function(err, agency) {
      if (err)
        res.json(err);
      agency.users.push({id: user._id});
      agency.save(function(err) {
        if (err)
          res.json(err);
      });
    });
    res.json(sale);
  });
});

/* GET sales listing. */
router.get('/', function(req, res, next) {
  var filteredQuery = {};
  var acceptableFields = ['type', 'city', 'rooms', 'bedrooms'];

  _(acceptableFields).forEach(function(field) {
    if (req.query[field])
      filteredQuery[field] = req.query[field];
  });

  if (req.query['min'] && req.query['max'])
    var fields = ['characteristics.price'];
    _(fields).forEach(function(field) {
      filteredQuery['price'] = { $gt : _.toInteger(req.query['min']), $lt : _.toInteger(req.query['max']) }
    });
  console.log(filteredQuery);

  Sale.find(filteredQuery, function(err, sales) {
    if (err)
      res.json(err);
    res.json(sales);
  });
});

/* GET sale. */
router.get('/:sale_id', function(req, res, next) {
  Sale.findById(req.params.sale_id, function(err, sale) {
    if (err)
      res.json(err);
    sale.views = rent.views + 1;
    sale.save(function(err) {
      if (err)
        res.json(err);
      res.json(sale);
    });
  });
});

/* PUT update sale. */
router.put('/:sale_id', function(req, res, next) {
  Sale.findById(req.params.sale_id, function(err, sale) {
    if (err)
      res.json(err);

    var address = {'building': req.body.building || sale.address.building,
      'street': req.body.street || sale.address.street,
      'zipcode': req.body.zipcode || sale.address.zipcode,
      'city': req.body.city || sale.address.city,
      'country': req.body.country || sale.address.country};

    var characteristics = {'price': req.body.price || sale.characteristics.price,
      'area': req.body.area || sale.characteristics.area,
      'rooms': req.body.rooms || sale.characteristics.rooms,
      'bedrooms': req.body.bedrooms || sale.characteristics.bedrooms};

    var owner = {'first_name': req.body.first_name || sale.owner.first_name,
      'last_name': req.body.last_name || sale.owner.last_name,
      'phone': req.body.phone || sale.owner.phone};

    sale.state = req.body.state || sale.state;
    sale.type = req.body.type || sale.type;
    sale.address = address || sale.adress;
    sale.characteristics = characteristics || sale.characteristics;
    sale.owner = owner || sale.owner;

    if ( typeof req.body.detail_name !== 'undefined' && req.body.detail_name )
      var detail = {'name': req.body.detail_name,
        'more': req.body.detail_more}
      sale.details.push(detail);

    sale.save(function(err) {
      if (err)
        res.json(err);
      res.json(sale);
    });
  });
});

/* DELETE sale. */
router.delete('/:sale_id', function(req, res, next) {
  Sale.findByIdAndRemove(req.params.sale_id, function(err, sale) {
    if (err)
      res.json(err);
    res.json(sale);
  });
});

module.exports = router;
