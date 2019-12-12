const multer = require("multer");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const path = require("path");
const Image = require("../models/Image");
const GreetingCard = require("../models/GreetingCard");
const cloudinary = require("../services/cloudinary");
const bytes = require("bytes");

/**
 * GET /image/:id
 * Get image by id
 */
exports.getImageById = async (req, res) => {
  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";

  let image = await Image.findOne({ _id: objId }).exec();

  if (!image) {
    return res.status(404).json({
      message: "Finding Image Failed",
      errors: [
        {
          msg: "Image not found"
        }
      ]
    });
  }

  return res.status(200).json(image);
};

/**
 * POST /image
 * Create a new image
 */
exports.postFileUpload = async (req, res) => {
  if (req.files) {
    let upload = req.files[0];
    let image_format = path.extname(upload.filename).substr(1);

    let data = {
      name: upload.filename,
      format: image_format,
      size: upload.size
    };

    let cld = {
      path: upload.path,
      folder_name: "Images"
    };

    let cd = cloudinary.upload(cld);

    cd.then(fileupload => {
      data.imageUrl = {
        public_id: fileupload.public_id,
        url: fileupload.secure_url
      };

      let image = new Image(data);

      image
        .save()
        .then(image => {
          let gcdata = {
            imageID: image._id,
            productID: _.get(req.body, "product_id")
          };

          let greetingcard = new GreetingCard(gcdata);

          greetingcard
            .save()
            .then(card => {
              data.greetingCardID = card._id;

              Image.findByIdAndUpdate(image._id, data, { new: true })
                .then(img => {
                  res.status(201).json(img);
                })
                .catch(err => {
                  return res.status(500).json({
                    message: "Something went wrong",
                    errors: [{ msg: err }]
                  });
                });
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
    }).catch(err => {
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
  } else {
    return res.status(400).send({
      message: "Validation Failed",
      errors: [
        {
          msg: "No image uploaded"
        }
      ]
    });
  }
};

/**
 * PUT /image/:id
 * Update image by id
 */
exports.updateImageById = async (req, res) => {
  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";
  let image = await Image.findById(objId).exec();

  if (!image) {
    return res.status(404).json({
      message: "Image not found",
      errors: [
        {
          msg: "Unable to locate image"
        }
      ]
    });
  }

  if (req.files) {
    let upload = req.files[0];
    let image_format = path.extname(upload.filename).substr(1);
    let data = {
      name: _.get(req.body, "name"),
      caption: _.get(req.body, "caption"),
      signoff: _.get(req.body, "sign_off"),
      format: image_format,
      size: upload.size
    };

    let cld = {
      path: upload.path,
      folder_name: "Images"
    };

    let cd = cloudinary.upload(cld);

    cd.then(fileupload => {
      data.imageUrl = {
        public_id: fileupload.public_id,
        url: fileupload.secure_url
      };

      // delete previous attachment
      cloudinary
        .delete(image.imageUrl.public_id)
        .then(res => {
          Image.findByIdAndUpdate(objId, data, { new: true })
            .then(image => {
              res.status(200).json(image);
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
};

/**
 * DELETE /image/:id
 * Delete image by id
 */

exports.deleteImageById = async (req, res) => {
  try {
    await Image.findOne({ _id: req.params.id }).exec();
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      errors: [{ msg: err }]
    });
  }

  let objId = mongoose.Types.ObjectId.isValid(req.params.id)
    ? mongoose.Types.ObjectId(req.params.id)
    : "123456789012";

  let image = await Video.findOne({ _id: objId }).exec();

  if (!image) {
    return res.status(404).json({
      message: "Finding Image Failed",
      errors: [
        {
          msg: "Image not found"
        }
      ]
    });
  } else {
    cloudinary
      .delete(image.imageUrl.public_id)
      .then(res => {
        Image.remove({ _id: objId }, err => {
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
