var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var RentsSchema = new mongoose.Schema({
  state: { type: Boolean, required: true, default: true },
  type: {type: String, enum: ['Apartment', 'House']},
  address: { building: { type: String, required: true },
    street: { type: String, required: true },
    zipcode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true } },
  characteristics: { rent: { type: SchemaTypes.Double, required: true },
    including_charges: { type: Boolean, required: true, default: true},
    charges: SchemaTypes.Double,
    area: { type: SchemaTypes.Double, required: true },
    rooms: { type: Number, required: true, min: 1, max: 99 },
    bedrooms: { type: Number, required: true, min: 0, max: 99 } },
  details: [ { name: String, more: String } ],
  images: [ { path: String, caption: String } ],
  views: { type: Number, required: true, default: 0},
  owner: {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, required: true }
  }
},
{
    timestamps: true
});

module.exports = mongoose.model('Rent', RentsSchema);
