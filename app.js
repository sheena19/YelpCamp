var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    seedDB = require("./seeds");

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

/*Campground.create({
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
});*/

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
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
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
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});
//NEW - show form to create new campground
app.get("/campgrounds/new", function (req, res) {
    res.render("campgrounds/new");
});
//SHOW - more info about one campground
app.get("/campgrounds/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //render it to the template
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//========================
//COMMENTS ROUTE
//========================

app.get("/campgrounds/:id/comments/new", function (req, res) {
    //find campground
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            // console.log(campground.name);
            res.render("comments/new", {campground: campground});
        }
    });
});

app.post("/campgrounds/:id/comments", function (req, res) {
    //lookup for campground using id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            //create a new comment
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    //add that comment to resp campground id
                    campground.comments.push(comment);
                    campground.save();
                    //redirect to show page of campground
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

app.listen(3000, function () {
    console.log("The YelpCamp Sever has started!");
});