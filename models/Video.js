const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  name: String,
  caption: String,
  signoff: String,
  format: { type: String, enum: ['avi', 'mp4', 'wmv', 'mov'], default: 'mp4' },
  size: String,
  greetingCardID: { type: mongoose.Schema.Types.ObjectID, ref: 'GreetingCard' },
}, { timestamps: true });

const Video = mongoose.model('Video', VideoSchema);

module.exports = Video;