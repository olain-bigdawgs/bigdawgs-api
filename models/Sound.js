const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const SoundSchema = new mongoose.Schema({
  name: String,
  format: { type: String, enum: ['mp3', 'wav', 'm4a', 'aiiff', 'wma'], default: 'mp3' },
  size: String,
  greetingCardID: { type: mongoose.Schema.Types.ObjectID, ref: 'GreetingCard' },
}, { timestamps: true });

const Sound = mongoose.model('Sound', SoundSchema);

module.exports = Sound;