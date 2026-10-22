const Listing=require("../models/listing")
const ExpressError=require("../utils/ExpressError")

let geocodingQueue=Promise.resolve()
let lastGeocodingRequestAt=0
const activeGeocodingRequests=new Map()

const geocodeListing=(location,country)=>{
    const cacheKey=JSON.stringify([location.trim().toLowerCase(),country.trim().toLowerCase()])
    const activeRequest=activeGeocodingRequests.get(cacheKey)
    if(activeRequest){
        return activeRequest
    }

    const geocodingRequest=geocodingQueue.then(async()=>{
        const cachedListing=await Listing.findOne({
            location,
            country,
            "geometry.type":"Point"
        }).select("geometry").lean()
        if(hasGeometry(cachedListing?.geometry)){
            return cachedListing.geometry
        }

        const waitTime=Math.max(0,1000-(Date.now()-lastGeocodingRequestAt))
        if(waitTime>0){
            await new Promise(resolve=>setTimeout(resolve,waitTime))
        }
        lastGeocodingRequestAt=Date.now()

        const query=new URLSearchParams({
            q:`${location}, ${country}`,
            format:"jsonv2",
            limit:"1"
        })
        const response=await fetch(`https://nominatim.openstreetmap.org/search?${query}`,{
            headers:{
                "Accept":"application/json",
                "User-Agent":"WanderLust/1.0"
            }
        })

        if(!response.ok){
            throw new ExpressError(502,`OpenStreetMap geocoding service returned ${response.status}.`)
        }

        const [result]=await response.json()
        const longitude=Number(result?.lon)
        const latitude=Number(result?.lat)
        if(
            !Number.isFinite(longitude) ||
            !Number.isFinite(latitude) ||
            longitude < -180 ||
            longitude > 180 ||
            latitude < -90 ||
            latitude > 90
        ){
            throw new ExpressError(422,"Could not find coordinates for this location. Please provide a more specific location.")
        }

        return {
            type:"Point",
            coordinates:[longitude,latitude]
        }
    })

    activeGeocodingRequests.set(cacheKey,geocodingRequest)
    geocodingQueue=geocodingRequest.then(()=>undefined,()=>undefined)
    geocodingRequest.then(
        ()=>activeGeocodingRequests.delete(cacheKey),
        ()=>activeGeocodingRequests.delete(cacheKey)
    )
    return geocodingRequest
}

const hasGeometry=geometry=>geometry?.type==="Point" &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length===2 &&
    geometry.coordinates.every(Number.isFinite)

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({})
    res.render("./listings/index.ejs",{allListings})
}

module.exports.renderNewForm=async (req,res)=>{
    // console.log(req.user)
    res.render("./listings/new.ejs")
}

module.exports.showListing=async (req,res)=>{
    let {id}=req.params
    const listing=await Listing.findById(id).populate("owner").populate({path:"reviews",populate:{path:"author"}})//to properly show all reviews data
    if (!listing) {
        req.flash("error","Listing you requested for doesnt exist;)")
        return res.redirect("/listings")
    }
    if(!hasGeometry(listing.geometry)){
        listing.geometry=await geocodeListing(listing.location,listing.country)
        await listing.save()
    }
    res.render("./listings/show.ejs",{listing})
}

module.exports.createListing=async (req,res)=>{
    const newListing=new Listing(req.body.listing)
    newListing.owner=req.user._id
    newListing.geometry=await geocodeListing(newListing.location,newListing.country)
    if(req.file){
        newListing.image={
            url:req.file.secure_url,
            filename:req.file.public_id
        }
    }
    await newListing.save();
    req.flash("success","New Listing Created!")
    res.redirect("/listings")
}

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params
    const listing=await Listing.findById(id)
    if (!listing) {
        req.flash("error","Listing you requested for doesnt exist;)")
        return res.redirect("/listings")
    }
    let originalImageUrl=listing.image.url
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_300")
    res.render("./listings/edit.ejs",{listing,originalImageUrl})
}

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params
    let listing=await Listing.findById(id)
    if (!listing) {
        req.flash("error","Listing you requested for doesnt exist;)")
        return res.redirect("/listings")
    }
    const locationChanged=listing.location!==req.body.listing.location || listing.country!==req.body.listing.country
    Object.assign(listing,req.body.listing)
    if(locationChanged || !hasGeometry(listing.geometry)){
        listing.geometry=await geocodeListing(listing.location,listing.country)
    }
    if(req.file){
        listing.image={
            url:req.file.secure_url,
            filename:req.file.public_id
        }
    }
    await listing.save()
    req.flash("success","Listing Updated!")
    res.redirect(`/listings/${id}`)
}

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params
    let deletedListing=await Listing.findByIdAndDelete(id)
    req.flash("success","Listing Deleted!")
    res.redirect("/listings")
}