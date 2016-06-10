var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

const UsersSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true, index: { unique: true } },
  password: Buffer,
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true }
},
{
    timestamps: true
});

UsersSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UsersSchema);
