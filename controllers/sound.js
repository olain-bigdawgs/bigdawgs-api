const multer = require("multer");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const path = require("path");
const Sound = require("../models/Sound");
const GreetingCard = require("../models/GreetingCard");
const cloudinary = require("../services/cloudinary");
const bytes = require("bytes");
const file_upload_limit = "2147483648";

/**
 * GET /sound/:id
 * Get sound by id
 */
exports.getSoundById = async (req, res) => {
  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";

  let sound = await Sound.findOne({ _id: objId }).exec();

  if (!sound) {
    return res.status(404).json({
      message: "Finding Sound Failed",
      errors: [
        {
          msg: "Sound not found"
        }
      ]
    });
  }

  return res.status(200).json(sound);
};

/**
 * POST /sound
 * Create a new sound
 */
exports.postSoundUpload = async (req, res) => {
  if (req.files) {
    let upload = req.files[0];
    let sound_format = path.extname(upload.filename).substr(1);

    if (upload.size < file_upload_limit) {
      let data = {
        name: _.get(req.body, "name"),
        format: sound_format,
        size: upload.size
      };

      let cld = {
        path: upload.path,
        folder_name: "Sounds",
        resource_type: "video"
      };

      let cd = cloudinary.upload(cld);

      cd.then(fileupload => {
        data.soundUrl = {
          public_id: fileupload.public_id,
          url: fileupload.secure_url
        };

        let sound = new Sound(data);

        sound
          .save()
          .then(sound => {
            let gcID = mongoose.Types.ObjectId.isValid(
              _.get(req.body, "greeting_card_id")
            )
              ? mongoose.Types.ObjectId(_.get(req.body, "greeting_card_id"))
              : "123456789012";

            let greetingcard = GreetingCard.findOne({ _id: gcID }).exec();

            let gcdata = {
              name: greetingcard.name,
              productID: greetingcard.productID,
              imageID: greetingcard.imageID,
              videoID: greetingcard.videoID,
              soundID: sound._id
            };

            GreetingCard.findByIdAndUpdate(gcID, gcdata, { new: true })
              .then(card => {
                res.status(201).json(sound);
              })
              .catch(err => {
                res.status(500).json({
                  message: "Something went wrong",
                  errors: [
                    {
                      name: err.name,
                      msg: err.message
                    }
                  ]
                });
              });
          })
          .catch(err => {
            res.status(500).json({
              message: "Something went wrong",
              errors: [
                {
                  name: err.name,
                  msg: err.message
                }
              ]
            });
          });
      });
    } else {
      res.status(400).send({
        message: "Validation Failed",
        errors: [
          {
            msg: "Attached sound exceeded to upload limit"
          }
        ]
      });
    }
  } else {
    res.status(400).send({
      message: "Validation Failed",
      errors: [
        {
          msg: "No sound uploaded"
        }
      ]
    });
  }
};

/**
 * PUT /sound/:id
 * Update sound by id
 */
exports.updateSoundById = async (req, res) => {
  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";
  let sound = await Sound.findById(objId).exec();

  if (!sound) {
    return res.status(404).json({
      message: "Sound not found",
      errors: [
        {
          msg: "Unable to locate sound"
        }
      ]
    });
  }

  if (req.files) {
    let upload = req.files[0];
    let sound_format = path.extname(upload.filename).substr(1);

    if (upload.size < file_upload_limit) {
      let data = {
        name: _.get(req.body, "name"),
        caption: _.get(req.body, "caption"),
        signoff: _.get(req.body, "sign_off"),
        format: sound_format,
        size: upload.size
      };

      let cld = {
        path: upload.path,
        folder_name: "Sounds"
      };

      let cd = cloudinary.upload(cld);

      cd.then(fileupload => {
        data.soundUrl = {
          public_id: fileupload.public_id,
          url: fileupload.secure_url
        };

        // delete previous attachment
        cloudinary
          .delete(sound.soundUrl.public_id)
          .then(res => {
            Sound.findByIdAndUpdate(objId, data, { new: true })
              .then(sound => {
                res.status(200).json(sound);
              })
              .catch(err => {
                return res.status(500).json({
                  message: "Something went wrong",
                  errors: [{ msg: err }]
                });
              });
          })
          .catch(err => {
            return res.status(500).json({
              message: "Something went wrong",
              errors: [{ msg: err }]
            });
          });
      });
    }
  }
};

/**
 * DELETE /sound/:id
 * Delete sound by id
 */

exports.deleteSoundById = async (req, res) => {
  try {
    await Sound.findOne({ _id: req.params.id }).exec();
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      errors: [{ msg: err }]
    });
  }

  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";

  let sound = await Sound.findOne({ _id: objId }).exec();

  if (!sound) {
    return res.status(404).json({
      message: "Finding Sound Failed",
      errors: [
        {
          msg: "Sound not found"
        }
      ]
    });
  } else {
    cloudinary
      .delete(sound.soundUrl.public_id)
      .then(res => {
        Sound.remove({ _id: objId }, err => {
          if (err) {
            return res.status(400).json({
              message: "Something went wrong",
              errors: [{ msg: err }]
            });
          }

          return res.status(204).json();
        });
      })
      .catch(err => {
        return res.status(500).json({
          message: "Something went wrong",
          errors: [{ msg: err }]
        });
      });
  }
};
