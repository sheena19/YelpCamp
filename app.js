var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

//Schema setup
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});
//compile them into model
var Campground = mongoose.model("Campground", campgroundSchema);

Campground.create({
        name: "Salmon Creek",
        image: "https://wallpaper.wiki/wp-content/uploads/2017/04/wallpaper.wiki-Camping-Wallpapers-HD-PIC-WPC008071.jpg",
        description: "This a huge hill, no bathrooms, no water. Beautiful place"
    },
    function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            console.log("Newly created campground:");
            console.log(campground);
        }
    });

//RESTFUL ROUTES
app.get("/", function (req, res) {
    res.render("landing");
});
//INDEX - contains all campground
app.get("/campgrounds", function (req, res) {
    //get all the campgrounds from db
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {campgrounds: allCampgrounds});
        }
    });
});
//CREATE - add new campground
app.post("/campgrounds", function (req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc};
    //create new campground and save it to DB
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});
//NEW - show form to create new campground
app.get("/campgrounds/new", function (req, res) {
    res.render("new");
});

//SHOW - more info about one campground
app.get("/campgrounds/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err){
            console.log(err);
        } else {
            //render it to the template
            res.render("show", {campground: foundCampground});
        }
    });
});
app.listen(3000, function () {
    console.log("The YelpCamp Sever has started!");
});