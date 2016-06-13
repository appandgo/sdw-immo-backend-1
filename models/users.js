var mongoose = require('mongoose');

var UsersSchema = new mongoose.Schema({
  role: { type: String, enum: ['Super Admin', 'Admin', 'Editor'], required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true }
},
{
    timestamps: true
});

module.exports = mongoose.model('User', UsersSchema);
