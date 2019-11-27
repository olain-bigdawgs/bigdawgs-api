const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseHidden = require("mongoose-hidden")();

const greetingCardSchema = new mongoose.Schema(
  {
    name: String,
    imageID: { type: mongoose.Schema.Types.ObjectID, ref: "Image" },
    videoID: { type: mongoose.Schema.Types.ObjectID, ref: "Video" },
    soundID: { type: mongoose.Schema.Types.ObjectID, ref: "Sound" },
    productID: String
  },
  { timestamps: true }
);

greetingCardSchema.plugin(mongooseHidden, { hidden: { _id: false } });

const GreetingCard = mongoose.model("GreetingCard", greetingCardSchema);

module.exports = GreetingCard;
