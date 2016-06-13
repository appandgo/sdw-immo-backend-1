var mongoose = require('mongoose');

var AgenciesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { building: String, street: String, zipcode: String, city: String, country: String },
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
