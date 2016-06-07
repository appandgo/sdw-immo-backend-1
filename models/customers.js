const mongoose = require('mongoose');

const CustomersSchema = new mongoose.Schema({
  last_name: String,
  first_name: String,
  email: { type: String, required: true, index: { unique: true } },
  phone: { type: String, unique: true },
  address: [ { building: String, coord: { type: [Number], index: '2d' }, street: String, zipcode: String } ],
},
{
    timestamps: true
});

module.exports = mongoose.model('Customer', CustomersSchema);
