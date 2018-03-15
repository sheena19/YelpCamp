var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/users"),
    seedDB = require("./seeds");

//requiring routes
var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    authRoutes = require("./routes/index");

// mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb://sheenashah19:sheena@ds215089.mlab.com:15089/yelp-camp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed database

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
    res.locals.error = req.flash("error"); //anything under message in flash can be used in every page
    res.locals.success = req.flash("success"); //anything under message in flash can be used in every page
    next();
});

app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

app.listen(process.env.PORT, process.env.IP);