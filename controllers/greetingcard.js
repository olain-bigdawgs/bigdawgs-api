const multer = require("multer");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const path = require("path");
const GreetingCard = require("../models/GreetingCard");
const Image = require("../models/Image");
const Video = require("../models/Video");
const Sound = require("../models/Sound");

exports.getCardById = async (req, res) => {
  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";

  let greeting_card = await GreetingCard.findOne({ _id: objId }).exec();
  let image = await Image.findOne({ _id: greeting_card.imageID }).exec();
  let video = await Video.findOne({ _id: greeting_card.videoID }).exec();
  let sound = await Sound.findOne({ _id: greeting_card.soundID }).exec();

  if (!greeting_card) {
    return res.status(404).json({
      message: "Finding Greeting Card Failed",
      errors: [
        {
          msg: "Greeting Card not found"
        }
      ]
    });
  }

  let display_data = {
    _id: greeting_card._id,
    imageUrl: _.get(image, "imageUrl.url"),
    videoUrl: _.get(video, "videoUrl.url", ""),
    soundUrl: _.get(sound, "soundUrl.url", ""),
    caption: _.get(image, "caption", ""),
    sign_off: _.get(image, "signoff", "")
  };

  return res.status(200).json(display_data);
};

exports.postGreetingCard = async (req, res) => {
  let data = {
    name: _.get(req.body, "name"),
    imageId: _.get(req.body, "imageId"),
    videoId: _.get(req.body, "videoId"),
    soundId: _.get(req.body, "soundId"),
    productID: _.get(req.body, "product_id")
  };

  let greeting_card = new GreetingCard(data);

  greeting_card
    .save()
    .then(card => {
      return res.status(201).json(card);
    })
    .catch(err => {
      return res.status(400).json({
        message: "Something went wrong",
        errors: [
          {
            name: err.name,
            msg: err.message
          }
        ]
      });
    });
};

exports.updateGreetingCard = async (req, res) => {
  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";

  let greeting_card = await GreetingCard.findOne({ _id: objId }).exec();

  if (!greeting_card) {
    return res.status(404).json({
      message: "Finding Greeting Card Failed",
      errors: [
        {
          msg: "Greeting Card not found"
        }
      ]
    });
  }

  let data = {
    name: _.get(req.body, "name", greeting_card.name),
    imageId: _.get(req.body, "imageId", greeting_card.imageId),
    videoId: _.get(req.body, "videoId", greeting_card.videoId),
    soundId: _.get(req.body, "soundId", greeting_card.soundId),
    productID: _.get(req.body, "product_id", greeting_card.productID)
  };

  GreetingCard.findByIdAndUpdate(objId, data, { new: true })
    .then(card => {
      res.status(200).json(card);
    })
    .catch(err => {
      return res.status(500).json({
        message: "Something went wrong",
        errors: [{ msg: err }]
      });
    });
};

exports.deleteGreetingCard = async (req, res) => {
  try {
    await GreetingCard.findOne({ _id: objId }).exec();
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      errors: [{ msg: err }]
    });
  }

  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";

  GreetingCard.remove({ _id: objId }, err => {
    if (err) {
      return res.status(400).json({
        message: "Something went wrong",
        errors: [{ msg: err }]
      });
    }

    return res.status(204).json();
  });
};
