const Model = require('./Model');
const { endConnection } = require('./dataBaseConnection');
const chalk = require("chalk");


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