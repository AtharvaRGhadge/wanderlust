//initialization logic
const mongoose=require("mongoose")
const initData=require("./data.js")
const Listing=require("../models/listing.js")
const User=require("../models/user.js")


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"

async function main(){
    await mongoose.connect(MONGO_URL)
    console.log("DB connected successfully")
    await initDB()
}

const initDB=async ()=>{
    const owner=await User.findOne().sort({_id:1})
    if(!owner){
        throw new Error("Create a user account before initializing listings.")
    }

    await Listing.bulkWrite(initData.data.map((listing)=>({
        updateOne:{
            filter:{title:listing.title},
            update:{$set:{...listing,owner:owner._id}},
            upsert:true
        }
    })))
    console.log("data was initialized")
}

main().then(()=>mongoose.disconnect()).catch(async(err)=>{
    console.error(err)
    await mongoose.disconnect()
    process.exitCode=1
})