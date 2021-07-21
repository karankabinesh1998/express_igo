const Model = require('../Model');
const { endConnection } = require('../dataBaseConnection');
const chalk = require("chalk");
const { getAllData } = require('../Model');





   
const LoginAdmin = async(req,res,next)=>{

    try {

        console.log(req.body);

        let body = req.body;

        let result = await Model.getAllData(
            `*`,
            `tbl_user_web`,
            `email_id='${body.email_id}' and password = '${body.password}' and status = 1`,
            1,
            1
        )

        if(result.length){

            let ChangeStatus = await Model.updateMaster(`tbl_user_web`,result[0].id,{login_status:1});

            if(ChangeStatus){
                endConnection();

                res.send(result)
                res.status(200)
            }

           
        }else{
            res.send(false)
            res.status(302)
        }
        

        
    } catch (error) {
        res.status(500)
        console.log(chalk.red(error));
        next(error)
    }
   
}



const DownloadImage = async(req,res,next)=>{
    let body = req.params.filename;
  
    try{


   let  uploadPath = __dirname + '/Images/'+`${body}`;
  
  
  console.log(uploadPath)
  res.sendFile(uploadPath)

  }catch(error){
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }

}



module.exports={
    LoginAdmin,
    DownloadImage
}