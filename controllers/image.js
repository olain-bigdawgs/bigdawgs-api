const multer = require("multer");
const bodyParser = require("body-parser");
const _ = require("lodash");
const path = require("path");
const Image = require("../models/Image");
const cloudinary = require("../services/cloudinary");
const bytes = require("bytes");

/**
 * GET /image
 */
exports.getFileUpload = (req, res) => {
  res.render("image/upload");
};

/**
 * POST /image
 * Create a new image
 */
exports.postFileUpload = async (req, res) => {
  if (req.files) {
    let upload = req.files[0];
    let image_format = path.extname(upload.filename).substr(1);

    console.log(upload);
    let data = {
      name: _.get(req.body, "name"),
      caption: _.get(req.body, "caption"),
      signoff: _.get(req.body, "sign_off"),
      format: image_format,
      size: upload.size
    };

    let image = new Image(data);
    let cld = {
      path: upload.path,
      folder_name: "Images"
    };

    image
      .save()
      .then(image => {
        cloudinary.upload(cld);
        res.status(201).json(image);
      })
      .catch(err => {
        res.status(400).json({
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
          msg: "No image uploaded"
        }
      ]
    });
  }
};
