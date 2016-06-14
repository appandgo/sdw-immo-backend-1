var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var SalesSchema = new mongoose.Schema({
  state: { type: Boolean, required: true, default: true },
  type: {type: String, enum: ['Apartment', 'House']},
  address: { building: { type: String, required: true },
    street: { type: String, required: true },
    zipcode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true } },
  characteristics: { price: { type: SchemaTypes.Double, required: true },
    area: { type: SchemaTypes.Double, required: true },
    rooms: { type: Number, required: true, min: 1, max: 99 },
    bedrooms: { type: Number, required: true, min: 0, max: 99 } },
  details: [ { name: String, more: String } ]
},
{
    timestamps: true
});

module.exports = mongoose.model('Sale', SalesSchema);
