const Model = require('./Model');
const { endConnection } = require('./dataBaseConnection');
const chalk = require("chalk");


var whitelist = [
    "localhost:3000",
    "localhost:3006",
    "localhost:4000",
    "192.168.0.124:3000",
    "igotaxy.com",
   "192.168.0.124:3006",
   "igotaxy.in",
   ];
   
  
   
   const corsOptionsDelegate = (req, res, next) => {
     try {
       console.log(req.headers.origin,"HEADERS");
       console.log(req.headers.referer,"ORIGINS");
       if (req.headers.origin !== undefined) {
         const splitReferer = req.headers.referer.split("/");
         const splitOrgin = req.headers.origin.split("/");
         const reqOrgin = splitOrgin[2];
         const reqReferer = splitReferer[2];
         console.log(splitReferer[2] + "->" + splitOrgin[2]);
         console.log( whitelist.indexOf(reqOrgin),whitelist.indexOf(reqReferer))
         if (
           whitelist.indexOf(reqOrgin) !== -1 &&
           whitelist.indexOf(reqReferer) !== -1
         ) {
           
           next();
         }
       } else {
         return res.status(400).json("Unauthorized Routes");
       }
     } catch (error) {
       return res.status(401).json({
         status: 401,
         message: "Invalid Request"
       });
     }
   };


   
const GetData = async(req,res,next)=>{

    try {

        

        res.send("hello world")

        // console.log(chalk.red("error"))
        
    } catch (error) {
        res.send(500)
        console.log(chalk.red(error));
        next(error)
    }
   
}



module.exports={
    GetData
}