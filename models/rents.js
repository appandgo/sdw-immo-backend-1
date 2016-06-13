const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

const SchemaTypes = mongoose.Schema.Types;

const RentsSchema = new mongoose.Schema({
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
  details: [ { name: String } ]
},
{
    timestamps: true
});

module.exports = mongoose.model('Rent', RentsSchema);
