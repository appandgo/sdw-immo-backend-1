var express = require('express');
var Sale = require('../models/sales');
var User = require('../models/users');
var Agency = require('../models/agencies');
var functions = require('../functions');
var _ = require('lodash')
var multer = require('multer');
var upload = multer({ dest: '../public/images' });
var fs = require('fs');
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

  sale.state = req.body.state || true;
  sale.type = req.body.type;
  sale.address = address;
  sale.characteristics = characteristics;
  sale.description = req.body.description;
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
      agency.sales.push({id: sale._id});
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
      if (field == 'city' || field == 'country')
        filteredQuery['address.'+field] = req.query[field];
      else if (field == 'rooms' || field == 'bedrooms')
        filteredQuery['characteristics.'+field] = _.toInteger(req.query[field]);
      else
        filteredQuery[field] = req.query[field];
  });

  if (req.query['pricemin'] && req.query['pricemax'])
    filteredQuery['characteristics.price'] = { '$gt' : _.toInteger(req.query['pricemin']),
      '$lt' : _.toInteger(req.query['pricemax']) };

  if (req.query['areamin'] && req.query['areamax'])
    filteredQuery['characteristics.area'] = { '$gt' : _.toInteger(req.query['areamin']),
      '$lt' : _.toInteger(req.query['areamax']) };

  Sale.find(filteredQuery, function(err, sales) {
    if (err)
      res.json(err);
    _(sales).forEach(function(sale) {
      sale.title = sale.type + ' ' + sale.characteristics.area + 'm2 ' + sale.address.city + ' ' + sale.address.zipcode;
    });
    res.json(sales);
  }).lean();
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
    sale.description = req.body.description || sale.description;
    sale.owner = owner || sale.owner;

    if ( typeof req.body.detail_name !== 'undefined' && req.body.detail_name )
      var detail = {'name': req.body.detail_name,
        'more': req.body.detail_more}
      sale.details.push(detail);

    /*console.log(req.file);
    upload.single('image')
    if ( req.file.originalname )
      fs.readFile(req.files.originalname, function (err, data) {
        var newPath = __dirname + "../public/images";
        fs.writeFile(newPath, data, function (err) {
          image = { 'path': newPath };
          sale.images.push(image);
        });
      });*/

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
