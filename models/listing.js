const mongoose=require("mongoose")
const Schema=mongoose.Schema;
const Review=require("./review.js")

const pointSchema=new Schema({
    type:{
        type:String,
        enum:["Point"],
        required:true
    },
    coordinates:{
        type:[Number],
        required:true,
        validate:{
            validator:coordinates=>coordinates.length===2,
            message:"GeoJSON coordinates must contain longitude and latitude."
        }
    },
    // category:{
    //     type:String,
    //     enum:["mountains","arctic","farms","deserts","beaches"]
    // }
},{_id:false})

const listingSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60", // when img is null or dne
            set: (v) => v === "" ? "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60" : v // when image exists but its link is empty & this is for client or user
            // set used to set condition on default value
        }
    }, // taking as url
    // image:{
    //     type:String,
    //     default:"https://unsplash.com/photos/holland-casino-building-in-amsterdam-vQjAdVIlteM",//when img is null or dne
    //     set:(v)=>v===""?"https://unsplash.com/photos/holland-casino-building-in-amsterdam-vQjAdVIlteM":v,//when image exists but its link is empty & this is for client or user
    //     //set used to set condition on default value
    // },//taking as url
    price: {
        type: Number,
        min: [0, "Price must be a positive number!"],
        required: true
    },
    location:String,
    country:String,
    geometry:pointSchema,
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,//for one to many data rel model
            ref:"Review"//from review model
        }
    ]
})

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})

const Listing=mongoose.model("Listing",listingSchema)
module.exports=Listing