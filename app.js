if(process.env.NODE_ENV!="production"){
    require('dotenv').config()
}

const express=require("express")
const app=express()
const mongoose=require("mongoose")
const path=require("path")
const methodOverride=require("method-override")
// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"
const dbUrl=process.env.MONGODB_URI
const ejsMate=require("ejs-mate")
const ExpressError=require("./utils/ExpressError.js")
const session=require("express-session")
const { MongoStore } = require('connect-mongo')
const flash=require("./utils/flash.js")
const passport=require("passport")
const LocalStrategy=require("passport-local")
const User=require("./models/user.js")


const listingsRouter=require("./routes/listing.js")
const reviewsRouter=require("./routes/review.js")
const userRouter=require("./routes/user.js")

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))//properly parse data
app.use(methodOverride("_method"))
// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")))

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600
})

store.on("error",(err)=>{
    console.log("ERROR in MONGO_SESSION_STORE",err)
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,//millisecs in 1 week
        maxAge:7*24*60*60*1000,
        httpOnly:true//to protect from cross-scripting attacks
    }
}

app.use(session(sessionOptions))//session is required for authentication
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))// use static authenticate method of model in LocalStrategy

passport.serializeUser(User.serializeUser());// use static serialize and deserialize of model for passport session support
passport.deserializeUser(User.deserializeUser());

main().then(()=>{
    console.log("DB connected successfully")
}).catch((err)=>{
    console.log(err)
})
async function main(){
    await mongoose.connect(dbUrl)
}

// app.get("/",(req,res)=>{
//     res.send("hi I am root")
// })

app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    res.locals.currUser=req.user
    next()//dont forget next
})

// app.get("/demouser",async (req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta student"//passport adds it by default
//     })
//     let registeredUser=await User.register(fakeUser,"helloworld")
//     res.send(registeredUser)
// })

//always use flash before the routes
app.use("/listings",listingsRouter)
app.use("/listings/:id/reviews",reviewsRouter)
app.use("/",userRouter)
// app.get("/testlisting",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India"
//     })
//     await sampleListing.save()
//     console.log("sample was saved")
//     res.send("successful testing")
// })

app.all("*path",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"))
})//to send standard response for all req other than above

app.use((err,req,res,next)=>{
    let{statusCode=500, message="Something went wrong!"}=err
    // res.status(statusCode).send(message)
    res.status(statusCode).render("error.ejs",{message})
})


app.listen(8080,()=>{
    console.log("listening to port 8080")
})