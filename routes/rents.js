var express = require('express');
var Rent = require('../models/rents');
var User = require('../models/users');
var Agency = require('../models/agencies');
var FrontUser = require('../models/frontusers');
var fs = require('fs');
var _ = require('lodash');
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

  rent.reference = rent.characteristics.area + rent.characteristics.rooms + rent.characteristics.bedrooms + rent.owner.first_name.substr(0,3) + rent.owner.last_name.substr(-2, 2) + rent.owner.phone.substr(4, 2);

  rent.save(function(err) {
    if (err)
      res.json(err);
    User.findOneAndUpdate({ '_id': req.body.user_id }, {$push: {rents: {id: rent._id}}}, function(err, user) {
      if (err)
        res.json(err);
    });
    Agency.findOneAndUpdate({ '_id': req.body.agency_id }, {$push: {rents: {id: rent._id}}}, function(err, agency) {
      if (err)
        res.json(err);
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

  var perPage = _.toInteger(req.query['perpage']) || 10;
  var page = _.toInteger(req.query['page']) || 0;
  var skip = perPage * page;
  var limit = perPage;

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
    { $sort: sortQuery },
    { $skip: skip },
    { $limit: limit }
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
router.put('/:rent_id', function(req, res, next) {
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

    rent.reference = rent.characteristics.area + rent.characteristics.rooms + rent.characteristics.bedrooms + rent.owner.first_name.substr(0,3) + rent.owner.last_name.substr(-2, 2) + rent.owner.phone.substr(4, 2);

    rent.save(function(err) {
      if (err)
        res.json(err);
      res.json(rent);
    });
  });
});

/* POST new detail. */
router.post('/:rent_id/details', function(req, res) {
  Rent.findById(req.params.rent_id, function(err, rent) {
    if (err)
      res.json(err);

    var detail = {'name': req.body.name,
      'more': req.body.more}
    rent.details.push(detail);

    rent.save(function(err) {
      if (err)
        res.json(err);
      res.json(rent);
    });
  });
});

/* GET details. */
router.get('/:rent_id/details', function(req, res, next) {
  Rent.findOne({ '_id': req.params.rent_id }, function(err, rent) {
    if (err)
      res.json(err);
    res.json(rent.details);
  }).select('details');
});

/* GET detail. */
router.get('/:rent_id/details/:detail_id', function(req, res, next) {
  Rent.findOne({ '_id': req.params.rent_id, 'details._id': req.params.detail_id }, {'details.$': 1}, function(err, rent) {
    if (err)
      res.json(err);
    res.json(rent.details[0]);
  });
});

/* PUT update detail. */
router.put('/:rent_id/details/:detail_id', function(req, res, next) {
  Rent.findOneAndUpdate({ '_id': req.params.rent_id, 'details._id': req.params.detail_id }, {$set: {'details.$.name': req.body.name, 'details.$.more': req.body.more}}, {new: true}, function(err, rent) {
    if (err)
      res.json(err);
    var detailUpdated;
    _(rent.details).forEach(function(detail) {
      if (detail._id == req.params.detail_id)
        detailUpdated = detail;
    });
    res.json(detailUpdated);
  });
});

/* DELETE detail. */
router.delete('/:rent_id/details/:detail_id', function(req, res, next) {
  Rent.findOneAndUpdate({ '_id': req.params.rent_id, 'details._id': req.params.detail_id }, {$pull: {details: {_id: req.params.detail_id}}}, function(err, rent) {
    if (err)
      res.json(err);
    var detailDeleted;
    _(rent.details).forEach(function(detail) {
      if (detail._id == req.params.detail_id)
        detailDeleted = detail;
    });
    res.json(detailDeleted);
  });
});

/* POST new image. */
router.post('/:rent_id/images', function(req, res) {
  Rent.findOneAndUpdate({ '_id': req.params.rent_id }, {$push: {images: {image: req.body.image, caption: req.body.caption}}}, {new: true}, function(err, rent) {
    if (err)
      res.json(err);
    res.json(rent);
  });
});

/* GET images. */
router.get('/:rent_id/images', function(req, res, next) {
  Rent.findOne({ '_id': req.params.rent_id }, function(err, rent) {
    if (err)
      res.json(err);
    res.json(rent.images);
  }).select('images');
});

/* GET image. */
router.get('/:rent_id/images/:image_id', function(req, res, next) {
  Rent.findOne({ '_id': req.params.rent_id, 'images._id': req.params.image_id }, {'images.$': 1}, function(err, rent) {
    if (err)
      res.json(err);
    res.json(rent.images[0]);
  });
});

/* PUT update image. */
router.put('/:rent_id/images/:image_id', function(req, res, next) {
  Rent.findOneAndUpdate({ '_id': req.params.rent_id, 'images._id': req.params.image_id }, {$set: {'images.$.caption': req.body.caption}}, {new: true}, function(err, rent) {
    if (err)
      res.json(err);
    var imageUpdated;
    _(rent.images).forEach(function(image) {
      if (image._id == req.params.image_id)
        imageUpdated = image;
    });
    res.json(imageUpdated);
  });
});

/* DELETE image. */
router.delete('/:rent_id/images/:image_id', function(req, res, next) {
  Rent.findOneAndUpdate({ '_id': req.params.rent_id, 'images._id': req.params.image_id }, {$pull: {images: {_id: req.params.image_id}}}, function(err, rent) {
    if (err)
      res.json(err);
    var imageDeleted;
    _(rent.images).forEach(function(image) {
      if (image._id == req.params.image_id)
        imageDeleted = image;
    });
    res.json(imageDeleted);
  });
});

/* DELETE rent. */
router.delete('/:rent_id', function(req, res, next) {
  Rent.findByIdAndRemove(req.params.rent_id, function(err, rent) {
    if (err)
      res.json(err);
    User.update({ 'rents.id': rent._id }, {$pull: {rents: {id: rent._id}}}, function(err, user) {
      if (err)
        res.json(err);
    });
    Agency.update({ 'rents.id': rent._id }, {$pull: {rents: {id: rent._id}}}, function(err, agency) {
      if (err)
        res.json(err);
    });
    FrontUser.update({ 'rents.id': rent._id }, {$pull: {rents: {id: rent._id}}}, function(err, frontuser) {
      if (err)
        res.json(err);
    });
    res.json(rent);
  });
});

/* SAVE in frontuser favorite rents */
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
