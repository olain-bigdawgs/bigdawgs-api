const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseHidden = require("mongoose-hidden")();

const videoSchema = new mongoose.Schema(
  {
    name: String,
    caption: String,
    signoff: String,
    format: {
      type: String,
      enum: ["avi", "mp4", "wmv", "mov"],
      default: "mp4"
    },
    size: String,
    videoUrl: { type: Schema.Types.Mixed, default: {} },
    greetingCardID: {
      type: mongoose.Schema.Types.ObjectID,
      ref: "GreetingCard"
    }
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseHidden, { hidden: { _id: false } });

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
