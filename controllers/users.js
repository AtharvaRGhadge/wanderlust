const User=require("../models/user")

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs")
}

module.exports.signup=async(req,res)=>{
    const {username,email,password}=req.body
    const newUser=new User({email,username})
    let registeredUser

    try{
        registeredUser=await User.register(newUser,password)
    }catch(e){
        req.flash("error",e.message)
        return res.redirect("/signup")
    }

    await new Promise((resolve,reject)=>{
        req.login(registeredUser,(err)=>{
            if(err){
                return reject(err)
            }
            resolve()
        })
    })

    req.flash("success","Welcome to Wanderlust")
    res.redirect("/listings")
}

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs")
}

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","you are logged out!")
        res.redirect("/listings")
    })
}

module.exports.login=async (req,res)=>{//we use middleware
        req.flash("success","Welcome back to Wanderlust!")
        let redirectUrl=res.locals.redirectUrl||"/listings"
        res.redirect(redirectUrl)
}