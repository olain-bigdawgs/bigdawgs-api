/**
 * Module dependencies.
 */
const express = require("express");
const compression = require("compression");
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
const chalk = require("chalk");
const errorHandler = require("errorhandler");
const lusca = require("lusca");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo")(session);
const flash = require("express-flash");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const sass = require("node-sass-middleware");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * Controllers (route handlers).
 */
const homeController = require("./controllers/home");
const userController = require("./controllers/user");
// const apiController = require('./controllers/api');
const contactController = require("./controllers/contact");
const imageController = require("./controllers/image");
const videoController = require("./controllers/video");
const soundController = require("./controllers/sound");
const greetingCardController = require("./controllers/greetingcard");

/**
 * API keys and Passport configuration.
 */
// const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("error", err => {
  console.error(err);
  console.log(
    "%s MongoDB connection error. Please make sure MongoDB is running.",
    chalk.red("✗")
  );
  process.exit();
});

/**
 * Express configuration.
 */
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "localhost");
app.set("port", process.env.PORT || 5000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
// app.use(expressStatusMonitor());
app.use(compression());
app.use(
  sass({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public")
  })
);

app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "150mb" }));
app.use(bodyParser.urlencoded({ limit: "150mb", extended: true }));
// app.use(session({
//   resave: true,
//   saveUninitialized: true,
//   secret: process.env.SESSION_SECRET,
//   cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
//   store: new MongoStore({
//     url: process.env.MONGODB_URI,
//     autoReconnect: true,
//   })
// }));
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(flash());
// app.use((req, res, next) => {
//   if (req.path === '/api/upload') {
//     // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.disable("x-powered-by");
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });
// app.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user
//     && req.path !== '/login'
//     && req.path !== '/signup'
//     && !req.path.match(/^\/auth/)
//     && !req.path.match(/\./)) {
//     req.session.returnTo = req.originalUrl;
//   } else if (req.user
//     && (req.path === '/account' || req.path.match(/^\/api/))) {
//     req.session.returnTo = req.originalUrl;
//   }
//   next();
// });
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: true,
      type: "INVALID_JSON"
    });
  }
});
app.use(
  "/",
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/chart.js/dist"), {
    maxAge: 31557600000
  })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/popper.js/dist/umd"), {
    maxAge: 31557600000
  })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"), {
    maxAge: 31557600000
  })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/jquery/dist"), {
    maxAge: 31557600000
  })
);
app.use(
  "/webfonts",
  express.static(
    path.join(__dirname, "node_modules/@fortawesome/fontawesome-free/webfonts"),
    { maxAge: 31557600000 }
  )
);

/**
 * Middleware
 */
const jwtMiddleware = require("./middlewares/jwt");

/**
 * Primary app routes.
 */
app.get("/", (req, res) => {
  return res.json({
    message: "Welcome to BigDawgs Greeting Card API!"
  });
});
app.get("/generate", (req, res) => {
  let payload = {
    email: process.env.APP_EMAIL,
    password: process.env.DEFAULT_PASSWORD
  };
  return res.status(200).json({
    token: jwt.sign(
      payload,
      process.env.JWT_SECRET || "d9171cea2711a69ec413537c2424c310",
      {
        expiresIn: "1h"
      }
    )
  });
});
app.get("/tokentest", jwtMiddleware.verifyToken, (req, res) => {
  return res.json({
    message: "token ok"
  });
});

/**
 * BigDawgs API routes
 */

// test routes
app.get("/test-image", homeController.indexImage);
app.get("/test-video", homeController.indexVideo);

// greeting card routes
app.get("/greeting-card/:id", greetingCardController.getCardById);
app.post("/greeting-card", greetingCardController.postGreetingCard);
app.get("/send/:id", greetingCardController.sendGreetingCardAssets);

// image routes
app.get("/image/:id", imageController.getImageById);
app.post("/image", [upload.any()], imageController.postFileUpload);
app.put("/image/:id", imageController.updateImageById);
app.delete("/image/:id", imageController.deleteImageById);

// video routes
app.get("/video/:id", videoController.getVideoById);
app.post("/video", [upload.any()], videoController.postVideoUpload);
app.put("/video/:id", videoController.updateVideoById);
app.delete("/video/:id", videoController.deleteVideoById);

// sound routes
app.get("/sound/:id", soundController.getSoundById);
app.post("/sound", [upload.any()], soundController.postSoundUpload);
app.put("/sound/:id", soundController.updateSoundById);
app.delete("/sound/:id", soundController.deleteSoundById);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Server Error");
  });
}

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  console.log(
    "%s App is running at http://localhost:%d in %s mode",
    chalk.green("✓"),
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

module.exports = app;
