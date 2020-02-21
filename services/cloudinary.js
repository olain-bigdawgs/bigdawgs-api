const cloudinary = require("cloudinary");
const async = require("async");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.upload = file => {
  return cloudinary.v2.uploader.upload(
    file.path,
    {
      use_filename: true,
      folder: file.folder_name,
      resource_type: file.resource_type
    },
    (err, res) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

exports.upload_large = file => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_large(
      file.path,
      {
        use_filename: true,
        folder: file.folder_name,
        resource_type: "video",
        chunk_size: 100000000
      },
      (err, res) => {
        resolve(res);
        if (err) {
          console.log(err);
          reject(err);
        }
      }
    );
  });
};

exports.delete = file => {
  return cloudinary.v2.uploader.destroy(file, (err, res) => {
    if (err) {
      console.log(err);
    }
  });
};

exports.deleteMultiple = file => {
  return cloudinary.v2.api.delete_resources(file, (err, res) => {
    if (err) {
      console.log(err);
    }
  });
};
