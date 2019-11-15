const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const greetingCardSchema = new mongoose.Schema({
  name: String,
  imageID: { type: mongoose.Schema.Types.ObjectID, ref: 'Image' },
  videoID: { type: mongoose.Schema.Types.ObjectID, ref: 'Video' },
  soundID: { type: mongoose.Schema.Types.ObjectID, ref: 'Sound' },
  productID: String
}, { timestamps: true });

const GreetingCard = mongoose.model('GreetingCard', greetingCardSchema);

module.exports = GreetingCard;