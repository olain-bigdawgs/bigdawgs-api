/**
 * GET /
 * Home page.
 */
exports.indexImage = (req, res) => {
  res.render("image/index", {
    title: "Home"
  });
};

exports.indexVideo = (req, res) => {
  res.render("video/index", {
    title: "Home"
  });
};
