const multer = require("multer");
const bodyParser = require("body-parser");
const _ = require("lodash");
const path = require("path");
const Video = require("../models/Video");
const bytes = require("bytes");

/**
 * POST /video
 * Create a new video
 */
exports.postVideoUpload = async (req, res) => {
  if (req.files) {
    let upload = req.files[0];
    let video_format = path.extname(upload.filename).substr(1);

    console.log(upload);
    let data = {
      name: _.get(req.body, "name"),
      caption: _.get(req.body, "caption"),
      signoff: _.get(req.body, "sign_off"),
      format: video_format,
      size: upload.size
    };

    let video = new Video(data);

    video
      .save()
      .then(video => {
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

    // add validation to accept jpeg & png only
  } else {
    res.status(400).send({
      message: "No video uploaded"
    });
  }
};
