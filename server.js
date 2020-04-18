var express = require("express");

var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;
var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
  axios.get("https://www.indeed.com/jobs?q=software+developer&l=Austin%2C+TX").then(function (response) {
    var $ = cheerio.load(response.data);

    //console.log($)
    $(".jobsearch-SerpJobCard").each(function (i, element) {
      var result = {};

      link = ($(this)
      .find("a")
      .attr("href"));
      title = $(this)
      .find(".title")
      .text();
      result.link = "www.indeed.com" + link
      // console.log($(element).attr("href"))
      result.title = $(this)
        .children("a")
        .attr("href")
      result.summar = $(this)
        .children("summary")
      console.log(result)

      db.Article.create(result)

        .then(function (dbArticle) {
          console.log(dbArticle);
          console.log(result)

        })
        .catch(function (err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});

app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

