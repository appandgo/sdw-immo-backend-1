var mongoose = require('mongoose');

var SchemaTypes = mongoose.Schema.Types;

var SalesSchema = new mongoose.Schema({
  state: { type: Boolean, required: true, default: true },
  type: {type: Number, enum: [0, 1]},
  address: { building: { type: String, required: true },
    street: { type: String, required: true },
    zipcode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true } },
  characteristics: { price: { type: Number, required: true },
    area: { type: Number, required: true },
    rooms: { type: Number, required: true, min: 1, max: 99 },
    bedrooms: { type: Number, required: true, min: 0, max: 99 } },
  details: [ { name: String, more: String } ],
  description: { type: String, required: true },
  images: [ { path: String, caption: String } ],
  owner: {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  reference: { type: String, required: true },
  views: { type: Number, required: true, default: 0}
},
{
    timestamps: true
});

module.exports = mongoose.model('Sale', SalesSchema);
