const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseHidden = require("mongoose-hidden")();

const soundSchema = new mongoose.Schema(
  {
    name: String,
    format: {
      type: String,
      enum: ["mp3", "wav", "m4a", "aiiff", "wma"],
      default: "mp3"
    },
    size: String,
    soundUrl: { type: Schema.Types.Mixed, default: {} },
    greetingCardID: {
      type: mongoose.Schema.Types.ObjectID,
      ref: "GreetingCard"
    }
  },
  { timestamps: true }
);

soundSchema.plugin(mongooseHidden, { hidden: { _id: false } });

const Sound = mongoose.model("Sound", soundSchema);

module.exports = Sound;
