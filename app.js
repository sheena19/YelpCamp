var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/users"),
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

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Sheena is strong!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
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

app.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res) {
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

app.post("/campgrounds/:id/comments", isLoggedIn, function (req, res) {
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

//===========
//AUTH ROUTES
//===========

// show register form
app.get("/register", function (req, res) {
    res.render("register");
});

//handles sign up logic
app.post("/register", function (req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/campgrounds");
        })
    });
});

//show login form
app.get("/login", function (req, res) {
    res.render("login");
});
//handles login logic
app.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function (req, res) {
});

//logic route
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function () {
    console.log("The YelpCamp Sever has started!");
});