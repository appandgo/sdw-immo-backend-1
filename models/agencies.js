var mongoose = require('mongoose');

var AgenciesSchema = new mongoose.Schema({
  state: { type: Boolean, required: true, default: true },
  name: { type: String, required: true },
  address: { building: { type: String, required: true },
    street: { type: String, required: true },
    zipcode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true } },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  users: [ { id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'} } ],
  sales: [ { id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sales'} } ],
  rents: [ { id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rents'} } ]
},
{
    timestamps: true
});

module.exports = mongoose.model('Agency', AgenciesSchema);
