const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  name: String,
  caption: String,
  signoff: String,
  format: { type: String, enum: ['jpg', 'jpeg', 'png'], default: 'jpg' },
  size: String,
  greetingCardID: { type: mongoose.Schema.Types.ObjectID, ref: 'GreetingCard' },
}, { timestamps: true });

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;