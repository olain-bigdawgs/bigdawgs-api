const multer = require("multer");
const bodyParser = require("body-parser");
const _ = require("lodash");
const path = require("path");
const Video = require("../models/Video");
const cloudinary = require("../services/cloudinary");
const bytes = require("bytes");
// const file_upload_limit = "2147483648";
const file_upload_limit = "10485760";

/**
 * POST /video
 * Create a new video
 */
exports.postVideoUpload = async (req, res) => {
  if (req.files) {
    let upload = req.files[0];
    let video_format = path.extname(upload.filename).substr(1);

    console.log(upload);
    console.log(upload.size < file_upload_limit);
    if (upload.size < file_upload_limit) {
      let data = {
        name: _.get(req.body, "name"),
        caption: _.get(req.body, "caption"),
        signoff: _.get(req.body, "sign_off"),
        format: video_format,
        size: upload.size
      };

      let video = new Video(data);
      let cld = {
        path: upload.path,
        folder_name: "Videos"
      };

      video
        .save()
        .then(video => {
          cloudinary.upload(cld);
          res.status(201).json(video);
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
            msg: "Attached video exceeded to upload limit"
          }
        ]
      });
    }

    // add validation to accept jpeg & png only
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
