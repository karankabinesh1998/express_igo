const Model = require('../Model');
const { endConnection } = require('../dataBaseConnection');
const chalk = require("chalk");
// const { getAllData } = require('../Model');
const fs = require("fs");
 const mv = require('mv');


const UploadImage = async (a) =>{
    try {
      console.log(a,"fkhdsjkh")
      let image = a.profile_dp;
      console.log(image,"data")
      let imagename  = image.name.split(".");
      let sampleFile;
      let uploadPath = "";

      if (!a.files || Object.keys(a.files).length === 0) {
      // return res.status(400).send('No files were uploaded.');
      }

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      sampleFile = a.profile_dp;
      Pathcheck = __dirname + '/Images/UserProfile/'
      uploadPath = __dirname + '/Images/UserProfile/'+imagename[0]+`_${Date.now()}`+'.'+imagename[1];

      sendfile = imagename[0]+`_${Date.now()}`+'.'+imagename[1] ;

      fs.mkdir(Pathcheck, { recursive: true }, (err) => {
      if (err) throw err;
      });

      //console.log(uploadPath)
      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(uploadPath, function(err) {
      if (err)
        return err;
      //res.send('File uploaded!');
      // return uploadPath
      });
  
  return sendfile
     
  } catch (error) {
     console.log(error);
  }
  }


   
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


const Check_Db = async(req,res,next)=>{
  try {

    const checkemail = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      1,
      1,
      1
    )

    res.send(checkemail)
    
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const AddUser = async(req,res,next) =>{
    const tableName = `tbl_user_web`;
    const body = req.body;
     console.log(req.files);
    try{
  
      const data = await UploadImage(req.files)
  
     // console.log(data,"succeess")
  
      if(data !== undefined){
        body.profile_dp = data;
      }else{
        body.profile_dp = null;
      }
  
      console.log(body)
  
      const checkemail = await Model.getAllData(
        `*`,
        `${tableName}`,
        `email_id = '${body.email_id}'`,
        1,
        1
      )
      console.log(checkemail)
      if(checkemail.length){
        let data = false;
         res.send(data)
      }else{
        const result = await Model.addMaster(tableName, body);
        if(result){
          endConnection();
          result.profile_pic = data;
         // console.log(result);
          res.send(result);
        }
  
       
   }
     //res.send("success")
    //  endConnection();
  
    }catch(error){
      endConnection();
      console.log(chalk.red(error));
      next(error);
      res.status(500)
    }
  }

  const getFreedom = async (req, res, next) => {
    let body = req.body.value ? req.body.value : req.body;
    // let device = req.body.device;
    console.log(body);
    try {
      var result = [];

       result = await Model.getAllData(
            body.select,
            body.tableName,
            body.condition,
            body.groupby,
            body.orderby
          );
          if(result){
            endConnection();
           res.send(result);
          }
     
      
       
    } catch (error) {
      //db end connection
      endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  };

  const updateMaster = async (req, res, next) => {
    const tableName = req.params.tableName;
    const body = req.body.categoryArray;
    const id = req.body.id;
    let columname = req.params.id;
  
    try {
      const result = await Model.updateMaster(
        tableName,
        id,
        body,
        columname
      );
      if (result) {
         res.status(200);
          res.send(result);
      }
      // db end connection
      // endConnection();
      //res.send(result);
    } catch (error) {
      //db end connection
      // endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  };


  const deleteMaster = async (req, res, next) => {
    const tableName = req.params.tableName;
  
    const id = req.params.id;
    try {
      const result = await Model.deleteMasterfromTable(
        tableName,
        `id=${id}`
      );
      //console.log(result);
      if (result) {
       // const RD = await DeleteToRedis(tableName, id, 159);
        
      }
      //db end connection
      endConnection();
      res.send(result);
    } catch (error) {
      //db end connection
      endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  };


module.exports={
    LoginAdmin,
    DownloadImage,
    AddUser,
    getFreedom,
    updateMaster,
    deleteMaster,
    Check_Db
}