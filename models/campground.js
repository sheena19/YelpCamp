var mongoose = require("mongoose");

//Schema setup
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment" //name of model
        }
    ]
});
//compile them into model
module.exports = mongoose.model("Campground", campgroundSchema);
