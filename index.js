const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");

const port = 80;

mongoose.set("strictQuery", false);

const database = mongoose.connect("mongodb://127.0.0.1:27017/linkShortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = mongoose.Schema({
  email: String,
  password: String,
  t_acC: String,
  urls: String,
});

const URLSchema = mongoose.Schema({
  url: String,
  shortened_url: String,
});

const User = mongoose.model("user", userSchema);
const URL = mongoose.model("urls", URLSchema);

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "account-react", "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "account-react", "build", "index.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "account-react", "build", "index.html"));
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "account-react", "build", "index.html"));
});
app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "account-react", "build", "index.html"));
});
app.get("/my-urls", (req, res) => {
  res.sendFile(path.join(__dirname, "account-react", "build", "index.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "account-react", "build", "index.html"));
});

app.post("/account", (req, res) => {
  if (req.body.actionTook == "login") {
    let user = User.findOne({
      email: req.body.accountEmail,
    }).exec();
    user.then((val) => {
      if (val) {
        if (val.password == req.body.accountPass) {
          let newTC = generateAccessKey();
          User.updateOne(
            { email: req.body.accountEmail, password: req.body.accountPass },
            { t_acC: newTC },
            (err, user) => {
              if (err) {
                res
                  .status(500)
                  .send(
                    JSON.stringify({ error: "Couldn't log in. Try Again" })
                  );
              }
              if (!user) {
                res
                  .status(404)
                  .send(JSON.stringify({ error: "No User found" }));
              } else {
                res.status(200).send(JSON.stringify({ t_acC: newTC }));
              }
            }
          );
        } else {
          res.status(500).send(JSON.stringify({ error: "Password Wrong" }));
        }
      } else {
        res
          .status(404)
          .send(JSON.stringify({ error: "No User Found with that Email" }));
      }
    });
  } else {
    let newTC = generateAccessKey();
    let user = User.findOne({
      email: req.body.accountEmail,
    }).exec();
    user.then((val) => {
      if (val) {
        if (val.password == req.body.accountPass) {
          let newTC = generateAccessKey();
          User.updateOne(
            { email: req.body.accountEmail, password: req.body.accountPass },
            { t_acC: newTC },
            (err, user) => {
              if (err) {
                res
                  .status(500)
                  .send(
                    JSON.stringify({ error: "Couldn't log in. Try Again" })
                  );
              }
              if (!user) {
                res
                  .status(404)
                  .send(JSON.stringify({ error: "No User found" }));
              } else {
                res.status(200).send(JSON.stringify({ t_acC: newTC }));
              }
            }
          );
        } else {
          res.status(500).send(JSON.stringify({ error: "Password Wrong" }));
        }
      } else {
        const newUser = new User({
          email: req.body.accountEmail,
          password: req.body.accountPass,
          t_acC: newTC,
          urls: JSON.stringify([]),
        });
        newUser.save();
        res.send(JSON.stringify({ t_acC: newTC }));
      }
    });
  }
});

app.post("/urls", (req, res) => {
  let allURLsOfUser = [];
  if (req.body.loggedIn) {
    let theVal = User.findOne({ t_acC: req.body.t_acC }).exec();
    theVal.then((user) => {
      if (user) {
        allURLsOfUser = JSON.parse(user.urls);
      }
    });
  }
  let url = req.body.url;
  URL.find({ url: url }).exec((err, urL) => {
    if (err) {
      res.status(500).send(JSON.stringify({ error: err }));
    }
    if (urL.length == 0) {
      let shortened_url = generateShortenedURL();
      const newURL = new URL({
        url: url,
        shortened_url: shortened_url[0],
      });
      newURL.save();
      if (req.body.loggedIn) {
        // if (!allURLsOfUser.includes([url, shortened_url[1]])) {
        //   allURLsOfUser.push([url, shortened_url[1]]);
        // }
        let isInURL = allURLsOfUser.some((data) => {
          if (data[0] == url && data[1] == shortened_url[1]) {
            return true;
          }
        });
        if (!isInURL) {
          allURLsOfUser.push([url, shortened_url[1]]);
        }
        User.updateOne(
          { t_acC: req.body.t_acC },
          { urls: JSON.stringify(allURLsOfUser) },
          (err, user) => {
            if (err) {
              res.status(500).send(JSON.stringify({ error: err }));
            }
            if (!user) {
              res.status(404).send(JSON.stringify({ error: "No User found" }));
            } else {
              res
                .status(200)
                .send(JSON.stringify({ shortened_url: shortened_url[1] }));
            }
          }
        );
      } else {
        res
          .status(200)
          .send(JSON.stringify({ shortened_url: shortened_url[1] }));
      }
    } else {
      let shortenedURL = "http://localhost/" + urL[0].shortened_url;
      if (req.body.loggedIn) {
        // if (!allURLsOfUser.includes([url, shortenedURL])) {
        //   allURLsOfUser.push([url, shortenedURL]);
        // }

        let isInURL = allURLsOfUser.some((data) => {
          if (data[0] == url && data[1] == shortenedURL) {
            return true;
          }
        });
        if (!isInURL) {
          allURLsOfUser.push([url, shortenedURL]);
        }
        User.updateOne(
          { t_acC: req.body.t_acC },
          { urls: JSON.stringify(allURLsOfUser) },
          (err, user) => {
            if (err) {
              res.status(500).send(JSON.stringify({ error: err }));
            }
            if (!user) {
              res.status(404).send(JSON.stringify({ error: "No User found" }));
            } else {
              res
                .status(200)
                .send(JSON.stringify({ shortened_url: shortenedURL }));
            }
          }
        );
      } else {
        res.status(200).send(JSON.stringify({ shortened_url: shortenedURL }));
      }
    }
  });
});

app.post("/check-user", (req, res) => {
  let user = User.findOne({ t_acC: req.body.t_acC }).exec();
  user.then((val) => {
    if (val) {
      res.status(200).send(JSON.stringify({ logIn: true }));
    } else {
      res
        .status(404)
        .send(JSON.stringify({ logIn: false, error: "Access Invalid" }));
    }
  });
  user.catch((err) => {
    res.status(400).send(JSON.stringify({ logIn: false, error: err }));
  });
});

app.post("/get-urls", (req, res) => {
  let user = User.findOne({ t_acC: req.body.t_acC }).exec();
  user.then((val) => {
    if (val) {
      res.status(200).send(val.urls);
    } else {
      res.status(404).send(JSON.stringify({ error: "Invalid Request!" }));
    }
  });
  user.catch((err) => {
    res.status(500).send(JSON.stringify({ error: err }));
  });
});

// For the shortened URLs
app.get(/^\/\w{5}\d{5}$/, (req, res) => {
  let theURL = req._parsedOriginalUrl.href.slice(1);
  URL.find({ shortened_url: theURL }).exec((err, urL) => {
    if (err) {
      res.status(500).send(JSON.stringify({ error: err }));
    }
    if (!urL) {
      res.status(404).send(JSON.stringify({ error: "No URL found" }));
    } else {
      res.redirect(urL[0].url);
    }
  });
});

app.listen(port, () => {
  console.log(`Server Started at :${port}`);
});

const keysToUse =
  "abcdefghijklmnopqrstuvwxyz123456789+-*/=,./';[]{}:?><~`@!#$%^&()";
const generateAccessKey = () => {
  let length = Math.round(Math.random() * 100),
    accessCode = "";
  for (let i = 0; i < length; i++) {
    accessCode += keysToUse[Math.round(Math.random() * 64)];
  }
  return accessCode;
};

const keysToUseInURL = "abcdefghijklmnopqrstuvwxyz123456789";

const generateShortenedURL = () => {
  let short_url = "";
  for (let i = 0; i < 5; i++) {
    short_url += keysToUseInURL.slice(0, 26)[Math.round(Math.random() * 26)];
  }
  for (let i = 0; i < 5; i++) {
    short_url += keysToUseInURL.slice(26)[Math.round(Math.random() * 8)];
  }
  return [short_url, "http://localhost/" + short_url];
};
