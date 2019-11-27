const multer = require("multer");
const bodyParser = require("body-parser");
const _ = require("lodash");
const path = require("path");
const GreetingCard = require("../models/GreetingCard");

exports.getCardById = async (req, res) => {
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

  return res.status(200).json(greeting_card);
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
      res.status(201).json(card);
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
