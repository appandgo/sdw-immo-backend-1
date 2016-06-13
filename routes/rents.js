var express = require('express');
var Rent = require('../models/rents');
var functions = require('../functions');
var router = express.Router();

/* POST new rent */
router.post('/', functions.middleware, function(req, res) {
  var rent = new Rent();

  var address = {'building': req.body.building,
    'street': req.body.street,
    'zipcode': req.body.zipcode,
    'city': req.body.city,
    'country': req.body.country};

  var characteristics = {'rent': req.body.rent,
    'including_charges': req.body.including_charges,
    'charges': req.body.charges,
    'area': req.body.area,
    'rooms': req.body.rooms,
    'bedrooms': req.body.bedrooms};

  rent.type = req.body.type;
  rent.name = req.body.name;
  rent.address = address;
  rent.characteristics = characteristics;

  rent.save(function(err) {
    if (err)
      res.json(err);
    res.json(rent);
  });
});

/* GET rents listing. */
router.get('/', function(req, res, next) {
  Rent.find(function(err, rents) {
    if (err)
      res.json(err);
    res.json(rents);
  });
});

/* GET rent. */
router.get('/:rent_id', function(req, res, next) {
  Rent.findById(req.params.rent_id, function(err, rent) {
    if (err)
      res.json(err);
    res.json(rent);
  });
});

/* PUT update rent. */
router.put('/:rent_id', functions.middleware, function(req, res, next) {
  Rent.findById(req.params.rent_id, function(err, rent) {
    if (err)
      res.json(err);

    var address = {'building': req.body.building,
      'street': req.body.street,
      'zipcode': req.body.zipcode,
      'city': req.body.city,
      'country': req.body.country};

    var characteristics = {'rent': req.body.rent,
      'including_charges': req.body.including_charges,
      'charges': req.body.charges,
      'area': req.body.area,
      'rooms': req.body.rooms,
      'bedrooms': req.body.bedrooms};

    rent.type = req.body.type || rent.type;
    rent.address = address || rent.adress;
    rent.characteristics = characteristics || rent.characteristics;

    if ( typeof req.body.detail_name !== 'undefined' && req.body.detail_name )
      var detail = {'name': req.body.detail_name,
        'more': req.body.detail_more}
      rent.details.push(detail);

    rent.save(function(err) {
      if (err)
        res.json(err);
      res.json(rent);
    });
  });
});

/* DELETE rent. */
router.delete('/:rent_id', functions.middleware, function(req, res, next) {
  Rent.findByIdAndRemove(req.params.rent_id, function(err, rent) {
    if (err)
      res.json(err);
    res.json(rent);
  });
});

module.exports = router;
