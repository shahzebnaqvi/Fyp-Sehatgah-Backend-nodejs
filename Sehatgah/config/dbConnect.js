const { default: mongoose } = require("mongoose")


uri = "mongodb+srv://balaaj:balaaj@sehatgah.irfkezq.mongodb.net/Sehatgah?retryWrites=true&w=majority"
const dbConnect = ()=>{
try
{
    mongoose.set("strictQuery", false);

   // const conn = mongoose.connect(process.env.MONGODB_URL)
  console.log(' connected');
  return mongoose.connect(uri,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
  });

}
catch(error){
    console.log('NOT connected');
}
}
module.exports = dbConnect;