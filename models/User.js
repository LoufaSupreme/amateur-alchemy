const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise; // required to suppress console.log error msg
// const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"],
    required: "Please supply an email address",
  },
  name: {
    type: String,
    required: "Please supply a name",
    trim: true,
  }
});

// exposes the "register" method on the User schema
userSchema.plugin(passportLocalMongoose, { usernameField: 'email'});

// improves error messages, particularly for unique:true errors
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);