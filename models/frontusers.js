var mongoose = require('mongoose');

var FrontUsersSchema = new mongoose.Schema({
  state: { type: Boolean, required: true, default: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  sales: [ { id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale'} } ],
  rents: [ { id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rent'} } ]
},
{
    timestamps: true
});

module.exports = mongoose.model('FrontUser', FrontUsersSchema);
