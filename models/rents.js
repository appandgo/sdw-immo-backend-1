const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

const SchemaTypes = mongoose.Schema.Types;

const RentsSchema = new mongoose.Schema({
  address: [ { building: String, coord: { type: [Number], index: '2d' }, street: String, zipcode: String } ],
  characteristics: [ { price: SchemaTypes.Double, area: SchemaTypes.Double, rooms: { type: Number, min: 1, max: 99 }, bedrooms: { type: Number, min: 0, max: 99 } } ],
  details: [ { name: String } ]
},
{
    timestamps: true
});

module.exports = mongoose.model('Rent', RentsSchema);
