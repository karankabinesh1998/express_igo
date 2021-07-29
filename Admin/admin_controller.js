const Model = require('../Model');
const { endConnection } = require('../dataBaseConnection');
const chalk = require("chalk");
// const { getAllData } = require('../Model');
const fs = require("fs");
 const mv = require('mv');
 const moment = require('moment')


 const UploadDocument = async (a,b) =>{

  try {
    console.log(a,"fkhdsjkh")
    let image = a.file;
    console.log(image.name,"data")
    let imagename  = image.name.split(".");
  let sampleFile;
  let uploadPath = "";

  if (!a.files || Object.keys(a.files).length === 0) {
   // return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = a.file;
  Pathcheck = __dirname + '/Images/' + `/${b}/`
  uploadPath = __dirname + '/Images/'+  `/${b}/` +imagename[0]+`_${Date.now()}`+'.'+imagename[1];

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


  const AddVendarDocument = async(req,res,next)=>{

    const tableName = req.params.tableName;
    const body = req.body;
    const Files = req.files;
    try{
     console.log(body)
  
     console.log(req.files)
  
     if(Files[body.driving_licence_front]== null){
  
       body.driving_licence_front = null;
  
     }else{
  
      Files[body.driving_licence_front] = {file : Files[body.driving_licence_front]}
  
      body.driving_licence_front = await UploadDocument(Files[body.driving_licence_front],body.username);
  
      if(body.driving_licence_front == undefined){
        body.driving_licence_front = null
      }
  
     }
     
     if(Files[body.driving_licence_back] == null ){
  
      body.driving_licence_back = null ;
  
     }else{
      Files[body.driving_licence_back] = {file : Files[body.driving_licence_back] }
  
      body.driving_licence_back = await UploadDocument(Files[body.driving_licence_back],body.username);
  
      if(body.driving_licence_back === undefined){
        body.driving_licence_back = null;
      }
     }
     
     if( Files[body.aadhar_front] == null ){
     
      body.aadhar_front = null;
      
     }else{
      Files[body.aadhar_front] = {file : Files[body.aadhar_front] }
  
      body.aadhar_front = await UploadDocument(Files[body.aadhar_front],body.username);
  
      if(body.aadhar_front === undefined){
        body.aadhar_front = null;
      }
     }
     
     if( Files[body.aadhar_back]== null ){
  
      body.aadhar_back = null;
  
     }else{
       
      Files[body.aadhar_back] = {file : Files[body.aadhar_back] }
      body.aadhar_back = await UploadDocument(Files[body.aadhar_back],body.username);
  
      if(body.aadhar_back == undefined){
        body.aadhar_back = null
      }
  
     }
  
     console.log(body)
  
  
     const result = await Model.addMaster(`tbl_vendar_documents`, body );
      if(result){
  
        result.body = body;
  
        res.send(result);
  
      }
      endConnection();
   //  res.send("Success")
  
    }catch(error){
      endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  }


  const TripsData = async (req, res, next) => {
    
    try {
     
      let result = await Model.getAllData(
        `tbl_trips.*,tbl_user_web.username as customer_name,tbl_city.city as pickuplocation_name,new_city.city as drop_location_name`,
        `tbl_trips,tbl_user_web,tbl_city,tbl_city as new_city`,
        `tbl_user_web.id = tbl_trips.customer_id and tbl_trips.pickup_location=tbl_city.id and tbl_trips.drop_location = new_city.id`,
        1,
        1
      )

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


  const AddTrips = async (req, res, next) => {
    const newcustomer = req.params.newcustomer;
    const body = req.body;
  console.log(body);
  
    try {

      if(newcustomer==0){
        
        const result = await Model.addMaster(`tbl_trips`, body );

        if(result){
          console.log(result);

          let getData = await Model.getAllData(`*`,`tbl_trips`,`id=${result.insertId}`,1,1)

          if(getData){
            res.send(getData)
          }
        }
      }




      

     
    } catch (error) {
      //db end connection
      // endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  };



  const RefreshApp = async (req, res, next) => {
    
    // const body = req.body;

    let id = req.params.id
    
        console.log(id);
    try {

      let result = await Model.getAllData(
        `*`,
        `tbl_user_web`,
        `id=${id}`,
        1,
        1
      )
      if(result){
        console.log(result);
        res.send(result)
      }
     


    } catch (error) {
      //db end connection
      // endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  };



  const AppLogin = async (req, res, next) => {
    
    const body = req.body;
    
  console.log(body);
    try {

      let result = await Model.getAllData(
        `*`,
        `tbl_user_web`,
        `email_id='${body.email_id}' and password ='${body.password}'`,
        1,
        1
      )
      if(result){
        console.log(result);
        res.send(result)
      }
     


    } catch (error) {
      //db end connection
      // endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  };

  const updateMasterApp = async (req, res, next) => {
    const tableName = req.params.tableName;
    const body = req.body;
    // const id = req.body.id;
    let id = req.params.id;
  console.log(body);
    try {
      const result = await Model.updateMaster(
        tableName,
        id,
        body
      );
      if (result) {
        console.log(result,"500");

        let res1 = await Model.getAllData(
          `*`,
          `${tableName}`,
          `id = ${id}`,
          1,
          1
        )
        if(res1){
          console.log(res1);
          res.status(200);
          res.send(res1);
        }

        
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

  const updateMaster = async (req, res, next) => {
    const tableName = req.params.tableName;
    const body = req.body.categoryArray;
    const id = req.body.id;
    let columname = req.params.id;
  console.log(body);
    try {
      const result = await Model.updateMaster(
        tableName,
        id,
        body,
        columname
      );
      if (result) {
        console.log(result,"500");

        let res1 = await Model.getAllData(
          `*`,
          `${tableName}`,
          `id = ${id}`,
          1,
          1
        )
        if(res1){
          console.log(res1);
          res.status(200);
          res.send(res1);
        }

        
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

  const UpdateVendarDocument = async(req,res,next)=>{

    const tableName = req.params.tableName;
    const id = req.params.id;
    const body = req.body;
    const Files = req.files;
    try{
     
  
    // console.log(Files[body.driving_licence_front] )
  
     if( Files[body.driving_licence_front] == undefined  ){
  
       body.driving_licence_front = body.driving_licence_front ;
  
     }else{
  
      Files[body.driving_licence_front] = {file : Files[body.driving_licence_front]}
  
      body.driving_licence_front = await UploadDocument(Files[body.driving_licence_front],body.username);
  
      if(body.driving_licence_front == undefined){
        body.driving_licence_front = null
      }
  
     }
     
     if(Files[body.driving_licence_back] == undefined ){
  
      body.driving_licence_back = body.driving_licence_back ;
  
     }else{
      Files[body.driving_licence_back] = {file : Files[body.driving_licence_back] }
  
      body.driving_licence_back = await UploadDocument(Files[body.driving_licence_back],body.username);
  
      if(body.driving_licence_back === undefined){
        body.driving_licence_back = null;
      }
     }
     
     if( Files[body.aadhar_front] == undefined ){
     
      body.aadhar_front = body.aadhar_front;
      
     }else{
      Files[body.aadhar_front] = {file : Files[body.aadhar_front] }
  
      body.aadhar_front = await UploadDocument(Files[body.aadhar_front],body.username);
  
      if(body.aadhar_front === undefined){
        body.aadhar_front = null;
      }
     }
     
     if( Files[body.aadhar_back]== undefined ){
  
      body.aadhar_back = body.aadhar_back;
  
     }else{
       
      Files[body.aadhar_back] = {file : Files[body.aadhar_back] }
      body.aadhar_back = await UploadDocument(Files[body.aadhar_back],body.username);
  
      if(body.aadhar_back == undefined){
        body.aadhar_back = null
      }
  
     }
  
     console.log(body)
     console.log(tableName,"tableName")
     console.log(id,"id")
  
  
     const result = await Model.updateMaster(
      tableName,
      id,
      body,
      columname = "id"
    );
    if (result) {
      console.log(result);
       res.status(200);
        res.send(result);
    }
      endConnection();
   //  res.send("Success")
  
    }catch(error){
      endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  }


  const UpdateUniqueCity = async(req,res,next) =>{
    let body = req.body;
    let id = req.params.id;
try{
  console.log("check")
  let check = await CmsContent.getFreedom(
    `*`,
    `tbl_city`,
    `city = '${body.city}'`,
    1,
    1
  );

  console.log(check)

  if(!check.length){
   
    const result = await CmsContent.updateMaster(
      `tbl_city`,
      id,
      body,
      `id`
    );
    if (result) {
       res.status(200);
       result.body = body
        res.send(result);
    }
    // db end connection
    endConnection();
    
  }else{
    let data = false;

    res.send(data)
  }




} catch (error) {
  //db end connection
  endConnection();
  console.error(chalk.red(error));
  res.status(500);
  next(error);
}
}

  
  const AddUniqueValueCity = async(req,res,next)=>{
    const tableName = req.params.tableName;
    const body = req.body; 

    try{

     const Checkdata = await Model.getAllData(
         `*`,
         `${tableName}`,
         `city = '${body.city}'`,
         1,
         1
     );
     if(Checkdata.length){
        let data = false;
        res.send(data) 
     }else{

        const result = await Model.addMaster(tableName, body);
        if(result){
          res.send(result);
        }

     }   

    } catch (error) {
        //db end connection
        endConnection();
        console.error(chalk.red(error));
        res.status(500);
        next(error);
      }
}

  const AddUniqueValue = async(req,res,next)=>{
    const tableName = req.params.tableName;
    const body = req.body; 

    try{

     const Checkdata = await Model.getAllData(
         `*`,
         `${tableName}`,
         `state = '${body.state}'`,
         1,
         1
     );
     if(Checkdata.length){
        let data = false;
        res.send(data) 
     }else{

        const result = await Model.addMaster(tableName, body);
        if(result){
          res.send(result);
        }

     }   

    } catch (error) {
        //db end connection
        endConnection();
        console.error(chalk.red(error));
        res.status(500);
        next(error);
      }
}


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


  const DownloadFile = async(req,res,next)=>{
  
    let body = req.params.filename; 
    let name = req.params.name;
  
    try{
  
  
      let  uploadPath = __dirname + '/Images/'+ `${name}/` +`${body}`;
      
      console.log(uploadPath)
  
      res.sendFile(uploadPath)
  
  }catch(error){
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
  
  }


  const UserProfile = async(req,res,next)=>{
  
    let body = req.params.filename; 
    // let name = req.params.name;
  
    try{
  
  
      let  uploadPath = __dirname + '/Images/UserProfile/' +`${body}`;
      
      console.log(uploadPath)
  
      res.sendFile(uploadPath)
  
  }catch(error){
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
  
  }


  const APPregister = async(req,res,next)=>{
    try{
  
    console.log(req.body);
  
    
  
    let Userlogincheck =  await Model.addMaster(
     `tbl_user_web`,
      req.body
    )
    if(Userlogincheck){

      console.log(Userlogincheck);

      let Result = await Model.getAllData(
        `*`,
        `tbl_user_web`,
        `id = ${Userlogincheck.insertId}`,
        1,
        1

      )
      if(Result){
        console.log(Result);
        res.send(Result)
      }
  
     
    }
  
    } catch (error) {
      //db end connection
      endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
    
    }

module.exports={
    LoginAdmin,
    DownloadImage,
    AddUser,
    getFreedom,
    updateMaster,
    deleteMaster,
    Check_Db,
    AddVendarDocument,
    DownloadFile,
    UpdateVendarDocument,
    AddUniqueValue,
    AddUniqueValueCity,
    UpdateUniqueCity,
    AddTrips,
    TripsData,
    AppLogin,
    RefreshApp,
    APPregister,
    UserProfile,
    updateMasterApp
  }