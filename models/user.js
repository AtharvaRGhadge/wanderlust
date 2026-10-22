const { required } = require("joi");
const mongoose=require("mongoose")
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose").default

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    }
})

userSchema.plugin(passportLocalMongoose);//automatically implements username,hashing and salting

module.exports = mongoose.model('User', userSchema);