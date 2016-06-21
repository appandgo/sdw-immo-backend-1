var express = require('express');
var Sale = require('../models/sales');
var User = require('../models/users');
var Agency = require('../models/agencies');
var FrontUser = require('../models/frontusers');
var fs = require('fs');
var _ = require('lodash');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var dirSales = './public/images/sales/';
    if (!fs.existsSync(dirSales)){
      fs.mkdirSync(dirSales);
    }
    var dirSale = './public/images/sales/'+req.params.sale_id+'/';
    if (!fs.existsSync(dirSale)){
      fs.mkdirSync(dirSale);
    }
    cb(null, dirSale)
  },
  filename: function (req, file, cb) {
    var getFileExt = function(fileName){
      var fileExt = fileName.split(".");
      if( fileExt.length === 1 || ( fileExt[0] === "" && fileExt.length === 2 ) ) {
        return "";
      }
      return fileExt.pop();
    }
    cb(null, Date.now() + '.' + getFileExt(file.originalname))
  }
})
var multerStorage = multer({ storage: storage })
var upload = multerStorage.single('image');
var functions = require('../functions');
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

  sale.reference = sale.characteristics.area + sale.characteristics.rooms + sale.characteristics.bedrooms + sale.owner.first_name.substr(0,3) + sale.owner.last_name.substr(-2, 2) + sale.owner.phone.substr(4, 2);

  sale.save(function(err) {
    if (err)
      res.json(err);
    User.findOneAndUpdate({ '_id': req.body.user_id }, {$push: {sales: {id: sale._id}}}, function(err, user) {
      if (err)
        res.json(err);
    });
    Agency.findOneAndUpdate({ '_id': req.body.agency_id }, {$push: {sales: {id: sale._id}}}, function(err, agency) {
      if (err)
        res.json(err);
    });
    res.json(sale);
  });
});

/* GET sales listing. */
router.get('/', function(req, res, next) {
  var filteredQuery = {};

  filteredQuery['state'] = true || false;

  var acceptableFields = ['type', 'city', 'country', 'rooms', 'bedrooms'];

  _(acceptableFields).forEach(function(field) {
    if (req.query[field])
      if (field == 'city' || field == 'country')
        filteredQuery['address.'+field] = req.query[field];
      else if (field == 'rooms' || field == 'bedrooms')
        filteredQuery['characteristics.'+field] = req.query[field];
      else
        filteredQuery[field] = req.query[field];
  });

  if (req.query['pricemin'] && req.query['pricemax'])
    filteredQuery['characteristics.price'] = { '$gte' : _.toInteger(req.query['pricemin']),
      '$lte' : _.toInteger(req.query['pricemax']) };
  else if (req.query['pricemin'])
    filteredQuery['characteristics.price'] = { '$gte' : _.toInteger(req.query['pricemin']) };
  else if (req.query['pricemax'])
    filteredQuery['characteristics.price'] = { '$lte' : _.toInteger(req.query['pricemax']) };

  if (req.query['areamin'] && req.query['areamax'])
    filteredQuery['characteristics.area'] = { '$gte' : _.toInteger(req.query['areamin']),
      '$lte' : _.toInteger(req.query['areamax']) };
  else if (req.query['areamin'])
    filteredQuery['characteristics.area'] = { '$gte' : _.toInteger(req.query['areamin']) };
  else if (req.query['areamax'])
    filteredQuery['characteristics.area'] = { '$lte' : _.toInteger(req.query['areamax']) };

  var sortQuery = {'createdAt': -1};

  if (req.query['sort'] == 'createdat' && req.query['order'] == 'asc')
    sortQuery = {'createdAt': 1};
  else if (req.query['sort'] == 'price' && req.query['order'] == 'asc')
    sortQuery = {'characteristics.price': 1};
  else if (req.query['sort'] == 'price' && req.query['order'] == 'desc')
    sortQuery = {'characteristics.price': -1};
  else if (req.query['sort'] == 'area' && req.query['order'] == 'asc')
    sortQuery = {'characteristics.area': 1};
  else if (req.query['sort'] == 'area' && req.query['order'] == 'desc')
    sortQuery = {'characteristics.area': -1};
  else if (req.query['sort'] == 'pricearea' && req.query['order'] == 'asc')
    sortQuery = {'pricearea': 1};
  else if (req.query['sort'] == 'pricearea' && req.query['order'] == 'desc')
    sortQuery = {'pricearea': -1};

  Sale.aggregate([{ $project: { _id: 1,
      createdAt: 1,
      updatedAt: 1,
      state: 1,
      type: 1,
      address: 1,
      characteristics: 1,
      details: 1,
      description: 1,
      images: 1,
      owner: 1,
      views: 1,
      pricearea: { $divide: [ '$characteristics.price', '$characteristics.area' ] } } },
    { $match : { $and: [ filteredQuery ] } },
    { $sort: sortQuery }
  ], function(err, sales) {
    if (err)
      res.json(err);
    _(sales).forEach(function(sale) {
      if (sale.type == 0)
        sale.type_name = 'Appartement';
      else if (sale.type == 1)
        sale.type_name = 'Maison';
      sale.title = sale.type_name + ' ' + sale.characteristics.area + 'm2 ' + sale.address.city + ' ' + sale.address.zipcode;
    });
    res.json(sales);
  });

});

/* GET sale. */
router.get('/:sale_id', function(req, res, next) {
  Sale.findById(req.params.sale_id, function(err, sale) {
    if (err)
      res.json(err);
    sale.views = sale.views + 1;
    var getSale = sale.toJSON();
    if (getSale.type == 0)
      getSale.type_name = 'Appartement';
    else if (getSale.type == 1)
      getSale.type_name = 'Maison';
    getSale.title = getSale.type_name + ' ' + getSale.characteristics.area + 'm2 ' + getSale.address.city + ' ' + getSale.address.zipcode;
    sale.save(function(err) {
      if (err)
        res.json(err);
      res.json(getSale);
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

    sale.save(function(err) {
      if (err)
        res.json(err);
      res.json(sale);
    });
  });
});

/* POST new detail. */
router.post('/:sale_id/details', function(req, res) {
  Sale.findById(req.params.sale_id, function(err, sale) {
    if (err)
      res.json(err);

    var detail = {'name': req.body.name,
      'more': req.body.more}
    sale.details.push(detail);

    sale.save(function(err) {
      if (err)
        res.json(err);
      res.json(sale);
    });
  });
});

/* GET details. */
router.get('/:sale_id/details', function(req, res, next) {
  Sale.findOne({ '_id': req.params.sale_id }, function(err, sale) {
    if (err)
      res.json(err);
    res.json(sale.details);
  }).select('details');
});

/* GET detail. */
router.get('/:sale_id/details/:detail_id', function(req, res, next) {
  Sale.findOne({ '_id': req.params.sale_id, 'details._id': req.params.detail_id }, {'details.$': 1}, function(err, sale) {
    if (err)
      res.json(err);
    res.json(sale.details[0]);
  });
});

/* PUT update detail. */
router.put('/:sale_id/details/:detail_id', function(req, res, next) {
  Sale.findOneAndUpdate({ '_id': req.params.sale_id, 'details._id': req.params.detail_id }, {$set: {'details.$.name': req.body.name, 'details.$.more': req.body.more}}, {new: true}, function(err, sale) {
    if (err)
      res.json(err);
    var detailUpdated;
    _(sale.details).forEach(function(detail) {
      if (detail._id == req.params.detail_id)
        detailUpdated = detail;
    });
    res.json(detailUpdated);
  });
});

/* DELETE detail. */
router.delete('/:sale_id/details/:detail_id', function(req, res, next) {
  Sale.findOneAndUpdate({ '_id': req.params.sale_id, 'details._id': req.params.detail_id }, {$pull: {details: {_id: req.params.detail_id}}}, function(err, sale) {
    if (err)
      res.json(err);
    var detailDeleted;
    _(sale.details).forEach(function(detail) {
      if (detail._id == req.params.detail_id)
        detailDeleted = detail;
    });
    res.json(detailDeleted);
  });
});

/* POST new image. */
router.post('/:sale_id/images', upload, function(req, res) {
  Sale.findById(req.params.sale_id, function(err, sale) {
    if (err)
      res.json(err);

    var image = {'path': req.file.path,
      'caption': req.body.caption
    }
    sale.images.push(image);

    sale.save(function(err) {
      if (err)
        res.json(err);
      res.json(sale);
    });
  });
});

/* GET images. */
router.get('/:sale_id/images', function(req, res, next) {
  Sale.findOne({ '_id': req.params.sale_id }, function(err, sale) {
    if (err)
      res.json(err);
    res.json(sale.images);
  }).select('images');
});

/* GET image. */
router.get('/:sale_id/images/:image_id', function(req, res, next) {
  Sale.findOne({ '_id': req.params.sale_id, 'images._id': req.params.image_id }, {'images.$': 1}, function(err, sale) {
    if (err)
      res.json(err);
    res.json(sale.images[0]);
  });
});

/* PUT update image. */
router.put('/:sale_id/images/:image_id', function(req, res, next) {
  Sale.findOneAndUpdate({ '_id': req.params.sale_id, 'images._id': req.params.image_id }, {$set: {'images.$.caption': req.body.caption}}, {new: true}, function(err, sale) {
    if (err)
      res.json(err);
    var imageUpdated;
    _(sale.images).forEach(function(image) {
      if (image._id == req.params.image_id)
        imageUpdated = image;
    });
    res.json(imageUpdated);
  });
});

/* DELETE image. */
router.delete('/:sale_id/images/:image_id', function(req, res, next) {
  Sale.findOneAndUpdate({ '_id': req.params.sale_id, 'images._id': req.params.image_id }, {$pull: {images: {_id: req.params.image_id}}}, function(err, sale) {
    if (err)
      res.json(err);
    var imageDeleted;
    _(sale.images).forEach(function(image) {
      if (image._id == req.params.image_id)
        imageDeleted = image;
    });
    if (fs.existsSync(imageDeleted.path))
      fs.unlinkSync(imageDeleted.path);
    res.json(imageDeleted);
  });
});

/* DELETE sale. */
router.delete('/:sale_id', function(req, res, next) {
  Sale.findByIdAndRemove(req.params.sale_id, function(err, sale) {
    if (err)
      res.json(err);
    _(sale.images).forEach(function(image) {
      if (fs.existsSync(image.path))
        fs.unlinkSync(image.path);
    });
    var dirSale = './public/images/sales/'+req.params.sale_id+'/';
    if (fs.existsSync(dirSale))
      fs.rmdirSync(dirSale);
    User.update({ 'sales.id': sale._id }, {$pull: {sales: {id: sale._id}}}, function(err, user) {
      if (err)
        res.json(err);
    });
    Agency.update({ 'sales.id': sale._id }, {$pull: {sales: {id: sale._id}}}, function(err, agency) {
      if (err)
        res.json(err);
    });
    FrontUser.update({ 'sales.id': sale._id }, {$pull: {sales: {id: sale._id}}}, function(err, front) {
      if (err)
        res.json(err);
    });
    res.json(sale);
  });
});

/* SAVE in frontuser favorite sales */
router.post('/:sale_id/save', function(req, res) {
  Sale.findById(req.params.sale_id, function(err, sale) {
    if (err)
      res.json(err);
    FrontUser.findById(req.body.frontuser_id, function(err, frontuser) {
      if (err)
        res.json(err);
      frontuser.sales.push({id: sale._id});
      frontuser.save(function(err) {
        if (err)
          res.json(err);
      });
    });
  });
});

module.exports = router;
