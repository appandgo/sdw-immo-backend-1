var express = require('express');
var Customer = require('../models/customers');
var functions = require('../functions');
var router = express.Router();

/* POST new customer */
router.post('/', function(req, res) {
  var customer = new Customer();

  var address = {'building': req.body.building,
    'street': req.body.street,
    'zipcode': req.body.zipcode,
    'city': req.body.city,
    'country': req.body.country};

  customer.first_name = req.body.first_name;
  customer.last_name = req.body.last_name;
  customer.address = address;
  customer.phone = req.body.phone;
  customer.email = req.body.email;

  customer.save(function(err) {
    if (err)
      res.json(err);
    res.json(customer);
  });
});

/* GET customers listing. */
router.get('/', function(req, res, next) {
  Customer.find(function(err, customers) {
    if (err)
      res.json(err);
    res.json(customers);
  });
});

/* GET customer. */
router.get('/:customer_id', function(req, res, next) {
  Customer.findById(req.params.customer_id, function(err, customer) {
    if (err)
      res.json(err);
    res.json(customer);
  });
});

/* PUT update customer. */
router.put('/:customer_id', function(req, res, next) {
  Customer.findById(req.params.customer_id, function(err, customer) {
    if (err)
      res.json(err);

    var address = {'building': req.body.building || rent.address.building,
      'street': req.body.street || rent.address.street,
      'zipcode': req.body.zipcode || rent.address.zipcode,
      'city': req.body.city || rent.address.city,
      'country': req.body.country || rent.address.country};

    customer.first_name = req.body.first_name || customer.first_name;
    customer.last_name = req.body.name || customer.last_name;
    customer.address = address || customer.address;
    customer.phone = req.body.phone || customer.phone;
    customer.email = req.body.email || customer.email;

    if ( typeof req.body.sale_id !== 'undefined' && req.body.sale_id )
      customer.sales.push({id: req.body.sale_id});

    if ( typeof req.body.rent_id !== 'undefined' && req.body.rent_id )
      customer.rents.push({id: req.body.rent_id});

    customer.save(function(err) {
      if (err)
        res.json(err);
      res.json(customer);
    });
  });
});

/* DELETE customer. */
router.delete('/:customer_id', function(req, res, next) {
  Customer.findByIdAndRemove(req.params.customer_id, function(err, customer) {
    if (err)
      res.json(err);
    res.json(customer);
  });
});

module.exports = router;
