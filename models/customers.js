var mongoose = require('mongoose');

var CustomersSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  address: { building: { type: String, required: true },
    street: { type: String, required: true },
    zipcode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true } },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  sales: [ { id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale'} } ],
  rents: [ { id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rent'} } ],
},
{
    timestamps: true
});

module.exports = mongoose.model('Customer', CustomersSchema);
