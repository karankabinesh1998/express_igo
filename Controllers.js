const Model = require('./Model');
const {  endConnection } = require('./dataBaseConnection');



const GetData = async(req,res)=>{
    res.send("hello world")
}



module.exports={
    GetData
}