var express = require('express');
var Rent = require('../models/rents');
var User = require('../models/users');
var Agency = require('../models/agencies');
var FrontUser = require('../models/frontusers');
var fs = require('fs');
var _ = require('lodash');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var dirRents = './public/images/rents/';
    if (!fs.existsSync(dirRents)){
      fs.mkdirSync(dirRents);
    }
    var dirRent = './public/images/rents/'+req.params.rent_id+'/';
    if (!fs.existsSync(dirRent)){
      fs.mkdirSync(dirRent);
    }
    cb(null, dirRent)
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

/* POST new rent */
router.post('/', function(req, res) {
  var rent = new Rent();

  var address = {'building': req.body.building,
    'street': req.body.street,
    'zipcode': req.body.zipcode,
    'city': req.body.city,
    'country': req.body.country};

  var characteristics = {'rent': req.body.rent,
    'including_charges': req.body.including_charges || true,
    'charges': req.body.charges,
    'area': req.body.area,
    'rooms': req.body.rooms,
    'bedrooms': req.body.bedrooms};

  var owner = {'first_name': req.body.first_name,
    'last_name': req.body.last_name,
    'phone': req.body.phone};

  rent.state = req.body.state || true;
  rent.type = req.body.type;
  rent.address = address;
  rent.characteristics = characteristics;
  rent.description = req.body.description;
  rent.owner = owner;

  rent.save(function(err) {
    if (err)
      res.json(err);
    User.findById(req.body.user_id, function(err, user) {
      if (err)
        res.json(err);
      user.rents.push({id: rent._id});
      user.save(function(err) {
        if (err)
          res.json(err);
      });
    });
    Agency.findById(req.body.agency_id, function(err, agency) {
      if (err)
        res.json(err);
      agency.rents.push({id: rent._id});
      agency.save(function(err) {
        if (err)
          res.json(err);
      });
    });
    res.json(rent);
  });
});

/* GET rents listing. */
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

  if (req.query['rentmin'] && req.query['rentmax'])
    filteredQuery['characteristics.rent'] = { '$gte' : _.toInteger(req.query['rentmin']),
      '$lte' : _.toInteger(req.query['rentmax']) };
  else if (req.query['rentmin'])
    filteredQuery['characteristics.rent'] = { '$gte' : _.toInteger(req.query['rentmin']) };
  else if (req.query['rentmax'])
    filteredQuery['characteristics.rent'] = { '$lte' : _.toInteger(req.query['rentmax']) };

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
  else if (req.query['sort'] == 'rent' && req.query['order'] == 'asc')
    sortQuery = {sort: {'characteristics.rent': 1}};
  else if (req.query['sort'] == 'rent' && req.query['order'] == 'desc')
    sortQuery = {sort: {'characteristics.rent': -1}};
  else if (req.query['sort'] == 'area' && req.query['order'] == 'asc')
    sortQuery = {sort: {'characteristics.area': 1}};
  else if (req.query['sort'] == 'area' && req.query['order'] == 'desc')
    sortQuery = {sort: {'characteristics.area': -1}};
  else if (req.query['sort'] == 'rentarea' && req.query['order'] == 'asc')
    sortQuery = {'rentarea': 1};
  else if (req.query['sort'] == 'rentarea' && req.query['order'] == 'desc')
    sortQuery = {'rentarea': -1};

  Rent.aggregate([{ $project: { _id: 1,
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
      rentarea: { $divide: [ '$characteristics.rent', '$characteristics.area' ] } } },
    { $match : { $and: [ filteredQuery ] } },
    { $sort: sortQuery }
  ], function(err, rents) {
    if (err)
      res.json(err);
    _(rents).forEach(function(rent) {
      if (rent.type == 0)
        rent.type_name = 'Appartement';
      else if (rent.type == 1)
        rent.type_name = 'Maison';
      rent.title = rent.type_name + ' ' + rent.characteristics.area + 'm2 ' + rent.address.city + ' ' + rent.address.zipcode;
    });
    res.json(rents);
  });
});

/* GET rent. */
router.get('/:rent_id', function(req, res, next) {
  Rent.findById(req.params.rent_id, function(err, rent) {
    if (err)
      res.json(err);
    rent.views = rent.views + 1;
    var getRent = rent.toJSON();
    if (getRent.type == 0)
      getRent.type_name = 'Appartement';
    else if (getRent.type == 1)
      getRent.type_name = 'Maison';
    getRent.title = getRent.type_name + ' ' + getRent.characteristics.area + 'm2 ' + getRent.address.city + ' ' + getRent.address.zipcode;
    rent.save(function(err) {
      if (err)
        res.json(err);
      res.json(getRent);
    });
  });
});

/* PUT update rent. */
router.put('/:rent_id', upload, function(req, res, next) {
  Rent.findById(req.params.rent_id, function(err, rent) {
    if (err)
      res.json(err);

    var address = {'building': req.body.building || rent.address.building,
      'street': req.body.street || rent.address.street,
      'zipcode': req.body.zipcode || rent.address.zipcode,
      'city': req.body.city || rent.address.city,
      'country': req.body.country || rent.address.country};

    var characteristics = {'rent': req.body.rent || rent.characteristics.rent,
      'including_charges': req.body.including_charges || rent.characteristics.including_charges,
      'charges': req.body.charges || rent.characteristics.charges,
      'area': req.body.area || rent.characteristics.area,
      'rooms': req.body.rooms || rent.characteristics.rooms,
      'bedrooms': req.body.bedrooms || rent.characteristics.bedrooms};

    var owner = {'first_name': req.body.first_name || rent.owner.first_name,
      'last_name': req.body.last_name || rent.owner.last_name,
      'phone': req.body.phone || rent.owner.phone};

    rent.state = req.body.state || rent.state;
    rent.type = req.body.type || rent.type;
    rent.address = address || rent.adress;
    rent.characteristics = characteristics || rent.characteristics;
    rent.description = req.body.description || rent.description;
    rent.owner = owner || rent.owner;

    if (req.file)
      var image = {'path': req.file.path,
        'caption': req.file.caption
      }
      rent.images.push(image)

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
router.delete('/:rent_id', function(req, res, next) {
  Rent.findByIdAndRemove(req.params.rent_id, function(err, rent) {
    if (err)
      res.json(err);
    res.json(rent);
  });
});

/* SAVE rent */
router.post('/:rent_id/save', function(req, res) {
  Rent.findById(req.params.rent_id, function(err, rent) {
    if (err)
      res.json(err);
    FrontUser.findById(req.body.frontuser_id, function(err, frontuser) {
      if (err)
        res.json(err);
      frontuser.rents.push({id: rent._id});
      frontuser.save(function(err) {
        if (err)
          res.json(err);
      });
    });
  });
});

module.exports = router;
