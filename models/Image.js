const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseHidden = require("mongoose-hidden")();

const imageSchema = new mongoose.Schema(
  {
    name: String,
    format: { type: String, enum: ["jpg", "jpeg", "png"], default: "jpg" },
    size: String,
    imageUrl: { type: Schema.Types.Mixed, default: {} },
    greetingCardID: {
      type: mongoose.Schema.Types.ObjectID,
      ref: "GreetingCard"
    }
  },
  { timestamps: true }
);

imageSchema.plugin(mongooseHidden, { hidden: { _id: false } });

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
