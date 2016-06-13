var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var SalesSchema = new mongoose.Schema({
  address: { building: String, street: String, zipcode: String, city: String, country: String },
  characteristics: [ { price: SchemaTypes.Double, area: SchemaTypes.Double, rooms: { type: Number, min: 1, max: 99 }, bedrooms: { type: Number, min: 0, max: 99 } } ],
  details: [ { name: String } ]
},
{
    timestamps: true
});

module.exports = mongoose.model('Sale', SalesSchema);
