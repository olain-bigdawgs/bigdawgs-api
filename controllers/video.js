const multer = require("multer");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const path = require("path");
const Video = require("../models/Video");
const GreetingCard = require("../models/GreetingCard");
const cloudinary = require("../services/cloudinary");
const bytes = require("bytes");
const file_upload_limit = "2147483648";
const fs = require("fs");

/**
 * GET /video/:id
 * Get video by id
 */
exports.getVideoById = async (req, res) => {
  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";

  let video = await Video.findOne({ _id: objId }).exec();

  if (!video) {
    return res.status(404).json({
      message: "Finding Video Failed",
      errors: [
        {
          msg: "Video not found"
        }
      ]
    });
  }

  return res.status(200).json(video);
};

/**
 * POST /video
 * Create a new video
 */
exports.postVideoUpload = async (req, res) => {
  let gcID = mongoose.Types.ObjectId.isValid(
    _.get(req.body, "greeting_card_id")
  )
    ? mongoose.Types.ObjectId(_.get(req.body, "greeting_card_id"))
    : "123456789012";
  let greetingcard = await GreetingCard.findOne({ _id: gcID }).exec();

  let gcdata = {
    name: greetingcard.name,
    productID: greetingcard.productID,
    imageID: greetingcard.imageID,
    soundID: greetingcard.soundID,
    caption: _.get(req.body, "caption"),
    signoff: _.get(req.body, "sign_off")
  };

  if (req.files) {
    let upload = req.files[0];
    let video_format = path.extname(upload.filename).substr(1);

    if (upload.size < file_upload_limit) {
      let data = {
        name: upload.filename,
        format: video_format,
        size: upload.size
      };

      let cld = {
        path: upload.path,
        folder_name: "Videos",
        resource_type: "video"
      };

      let cd = cloudinary.upload_large(cld);

      cd.then(fileupload => {
        data.videoUrl = {
          public_id: fileupload.public_id,
          url: fileupload.secure_url
        };

        let video = new Video(data);

        video
          .save()
          .then(video => {
            gcdata.videoID = video._id;
            fs.unlink(cld.path, err => {
              if (err) {
                console.error(err);
                return;
              }
            });

            GreetingCard.findByIdAndUpdate(gcID, gcdata, { new: true })
              .then(card => {
                console.log(card);
                Promise.all([cd, video]).then(result => {
                  res.status(201).json(video);
                });
              })
              .catch(err => {
                console.log(err);
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
            console.log(err);
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
      }).catch(err => {
        console.log(err);
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
    } else {
      res.status(400).send({
        message: "Validation Failed",
        errors: [
          {
            msg: "Attached video exceeded to upload limit"
          }
        ]
      });
    }
  } else {
    res.status(400).send({
      message: "Validation Failed",
      errors: [
        {
          msg: "No video uploaded"
        }
      ]
    });
  }
};

/**
 * PUT /video/:id
 * Update video by id
 */
exports.updateVideoById = async (req, res) => {
  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";
  let video = await Video.findById(objId).exec();

  if (!video) {
    return res.status(404).json({
      message: "Video not found",
      errors: [
        {
          msg: "Unable to locate video"
        }
      ]
    });
  }

  if (req.files) {
    let upload = req.files[0];
    let video_format = path.extname(upload.filename).substr(1);

    if (upload.size < file_upload_limit) {
      let data = {
        name: _.get(req.body, "name"),
        caption: _.get(req.body, "caption"),
        signoff: _.get(req.body, "sign_off"),
        format: video_format,
        size: upload.size
      };

      let cld = {
        path: upload.path,
        folder_name: "Videos"
      };

      let cd = cloudinary.upload(cld);

      cd.then(fileupload => {
        data.videoUrl = {
          public_id: fileupload.public_id,
          url: fileupload.secure_url
        };

        // delete previous attachment
        cloudinary
          .delete(video.videoUrl.public_id)
          .then(res => {
            Video.findByIdAndUpdate(objId, data, { new: true })
              .then(video => {
                res.status(200).json(video);
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
 * DELETE /video/:id
 * Delete video by id
 */

exports.deleteVideoById = async (req, res) => {
  try {
    await Video.findOne({ _id: req.params.id }).exec();
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      errors: [{ msg: err }]
    });
  }

  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";

  let video = await Video.findOne({ _id: objId }).exec();

  if (!video) {
    return res.status(404).json({
      message: "Finding Video Failed",
      errors: [
        {
          msg: "Video not found"
        }
      ]
    });
  } else {
    cloudinary
      .delete(video.videoUrl.public_id)
      .then(res => {
        Video.remove({ _id: objId }, err => {
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
