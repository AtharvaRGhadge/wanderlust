const express=require("express")
const router=express.Router()
const wrapAsync=require("../utils/wrapAsync.js")
const {listingSchema}=require("../schema.js")
const ExpressError=require("../utils/ExpressError.js")
const Listing=require("../models/listing.js")
const {isLoggedIn,isOwner}=require("../middleware.js")
const multer  = require('multer')//for image uploading
const {storage}=require("../cloudConfig.js")
const upload = multer({ storage })


const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body)
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg)
    }else{
        next()
    }
}

const requireListingImage=(req,res,next)=>{
    if(!req.file){
        return next(new ExpressError(400,"Please upload a listing image."))
    }
    next()
}

const listingController=require("../controllers/listings.js")
router.route("/")
    //index route
    .get(wrapAsync(listingController.index))
    //create route
    .post(isLoggedIn,
        upload.single("listing[image]"),
        requireListingImage,
        validateListing,
        wrapAsync(listingController.createListing)
    )
    

//new route we placed new route above show route as /new would be treated as id
router.get("/new",isLoggedIn,listingController.renderNewForm)

router.route("/:id")
    //show route
    .get(wrapAsync(listingController.showListing))
    //update route
    .put(isLoggedIn,isOwner, upload.single("listing[image]"),
        validateListing,wrapAsync(listingController.updateListing))
    //delete route
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm))

module.exports=router