const User = require("../models/userModel");
const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")

const authMiddleware = asyncHandler(async (req, res,next) => {
    let token;
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token=(req.headers.authorization.split(" ")[1]);
         try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
               const user = await User.findById(decoded?.id);
               req.user = user;
               next();
            
            }
        }
        catch (error) {
            throw new Error(`not authorize token expire , please login again`);
        }
    }
    else {
        throw new Error(`There is no token attached to header`)
    }
});

const isdoctor = asyncHandler (async(req,res,next)=>{
    console.log(req.user);
   const {email} = req.user;
   // console.log({email});
   const doctorUSer  = await User.findOne({email});
     // console.log(doctorUSer);
   if(doctorUSer.role !== "doctor"){
    throw new Error (`You are not an doctor`)
   }
   else{
    next();
   }

})

module.exports = {authMiddleware,isdoctor};