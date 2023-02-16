const mongoose = require('mongoose');

const validatemongoodbId =(id)=>{
    const isValid = (mongoose.Types.ObjectId.isValid(id)) //true OR false
   // console.log(isValid);
    if(!isValid ) throw new Error(`This is not valid`);

};
module.exports = validatemongoodbId;