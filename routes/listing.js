const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");

// The form sends the image as a link (text); the model stores it as { url, filename }.
function imageFromForm(link) {
    const url = typeof link === "string" ? link.trim() : "";
    return url ? { url, filename: "listingimage" } : undefined;
}


router.get("/",wrapAsync(async (req,res)=>{
    const allListings =await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs")
});

//this is show route

router.get("/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}));

router.post("/",isLoggedIn,validateListing,wrapAsync(async (req,res,next)=>{
    const data = { ...req.body.listing };
    const image = imageFromForm(data.image);
    if (image) data.image = image; else delete data.image; // empty link -> default picture
    const newListing = new Listing(data);
    //console.log(req.user);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","new Listing created");
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req, res)=>{
    let {id} = req.params;
const listing = await Listing.findById(id);
if(!listing){
        req.flash("error","Listing does not exist");
        return res.redirect("/listings");
    }
res.render("listings/edit.ejs",{listing});
}));

//update route
router.put("/:id",isLoggedIn,isOwner,validateListing, wrapAsync(async (req, res)=>{
let {id} = req.params;
const data = { ...req.body.listing };
const image = imageFromForm(data.image);
if (image) data.image = image; else delete data.image;
await Listing.findByIdAndUpdate (id, data);
req.flash("success","Listing updated");
res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
}));

module.exports = router;