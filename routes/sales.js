var express = require('express');
var Sale = require('../models/sales');
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

  sale.type = req.body.type;
  sale.name = req.body.name;
  sale.address = address;
  sale.characteristics = characteristics;

  sale.save(function(err) {
    if (err)
      res.json(err);
    res.json(sale);
  });
});

/* GET sales listing. */
router.get('/', function(req, res, next) {
  Sale.find(function(err, sales) {
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
    res.json(sale);
  });
});

/* PUT update sale. */
router.put('/:sale_id', function(req, res, next) {
  Sale.findById(req.params.sale_id, function(err, sale) {
    if (err)
      res.json(err);

    var address = {'building': req.body.building,
      'street': req.body.street,
      'zipcode': req.body.zipcode,
      'city': req.body.city,
      'country': req.body.country};

    var characteristics = {'price': req.body.price,
      'area': req.body.area,
      'rooms': req.body.rooms,
      'bedrooms': req.body.bedrooms};

    sale.type = req.body.type || sale.type;
    sale.address = address || sale.adress;
    sale.characteristics = characteristics || sale.characteristics;

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
