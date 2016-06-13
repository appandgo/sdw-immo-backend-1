var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var RentsSchema = new mongoose.Schema({
  type: {type: String, enum: ['Apartment', 'House']},
  address: { building: { type: String, required: true },
    street: { type: String, required: true },
    zipcode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true } },
  characteristics: { rent: { type: SchemaTypes.Double, required: true },
    including_charges: { type: Boolean, required: true},
    charges: SchemaTypes.Double,
    area: { type: SchemaTypes.Double, required: true },
    rooms: { type: Number, required: true, min: 1, max: 99 },
    bedrooms: { type: Number, required: true, min: 0, max: 99 } },
  details: [ { name: String, more: String } ]
},
{
    timestamps: true
});

module.exports = mongoose.model('Rent', RentsSchema);
