const {format}=require("util")

module.exports=function flash(){
    return (req,res,next)=>{
        if(req.flash){
            return next()
        }

        req.flash=function(type,msg){
            if(this.session===undefined){
                throw new Error("req.flash() requires sessions")
            }

            const messages=this.session.flash=this.session.flash||{}
            if(type&&msg){
                if(arguments.length>2){
                    msg=format.apply(undefined,Array.prototype.slice.call(arguments,1))
                }else if(Array.isArray(msg)){
                    msg.forEach((value)=>{
                        (messages[type]=messages[type]||[]).push(value)
                    })
                    return messages[type].length
                }
                return (messages[type]=messages[type]||[]).push(msg)
            }

            if(type){
                const typeMessages=messages[type]
                delete messages[type]
                return typeMessages||[]
            }

            this.session.flash={}
            return messages
        }

        next()
    }
}
