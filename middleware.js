const Listing=require("./models/listing.js")
const Review=require("./models/review.js")
const wrapAsync=require("./utils/wrapAsync.js")

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl
        req.flash("error","you must be logged in to create listing")
        return res.redirect("/login")
    }
    next()
}

module.exports.isOwner=wrapAsync(async(req,res,next)=>{
    const listing=await Listing.findById(req.params.id)
    if(!listing){
        req.flash("error","Listing you requested for doesnt exist;)")
        return res.redirect("/listings")
    }
    if(!listing.owner || !listing.owner.equals(req.user._id)){
        const action=req.method==="DELETE"?"delete":"edit"
        req.flash("error",`You don't have permission to ${action}`)
        return res.redirect(`/listings/${listing._id}`)
    }
    next()
})

module.exports.isReviewAuthor=wrapAsync(async(req,res,next)=>{
    const {id,reviewId}=req.params
    const listing=await Listing.findOne({_id:id,reviews:reviewId})
    const review=listing ? await Review.findById(reviewId) : null
    if(!review){
        req.flash("error","Review not found")
        return res.redirect(`/listings/${id}`)
    }
    if(!review.author || !review.author.equals(req.user._id)){
        req.flash("error","You don't have permission to delete this review")
        return res.redirect(`/listings/${id}`)
    }
    next()
})

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl
    }
    next()
}