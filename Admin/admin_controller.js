const Model = require('../Model');
const { endConnection } = require('../dataBaseConnection');
const chalk = require("chalk");
// const { getAllData } = require('../Model');
const fs = require("fs");
const mv = require('mv');
const moment = require('moment')
var admin = require("firebase-admin");

var serviceAccount = require("./igotaxy-firebase-adminsdk-2c5sg-2a09a1a5ee.json");

admin.initializeApp({
  
  credential: admin.credential.cert(serviceAccount)
});


const CheckoutNotify = async(req,res,next)=>{
  try {
    


const Token = req.params.token;
console.log(Token);
admin.messaging().send({
  token : Token,
  data:{
    customData:"Igotaxy",
    id:'1',
    ad:"Your Profile Approved",
    subTitle:"Notify Sub"
  },
  android:{
    notification:{
      body:" Your Documents were Approved 😊.You can now able to bid and start your Rides",
      title:"Congratulations",
      color:"#FFF566",
      priority:"high",
      sound:"default",
      vibrateTimingsMillis:[200,500,800],
      imageUrl:"https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=719&q=80"
    }
  }
}).then((msg)=>{
  console.log(msg);
    res.send(msg)
    res.status(200)
}).catch((err)=>{
  res.send(err)
  res.status(404)
  console.log(err);
})
  } catch (error) {
    console.log(error);
    res.send(false)
    res.status(500)
  }
}


const SendAssignedTripNotification = async(req,res,next)=>{
  try {
    
    let body = req.body;


// const Token = req.params.token;
// console.log(Token);
admin.messaging().send({
  token : body.token,
  data:{
    customData:"Igotaxy",
    id:'1',
    ad:"Your Profile Approved",
    subTitle:"Notify Sub"
  },
  android:{
    notification:{
      body:body.body,
      title: body.title,
      color:"#FFF566",
      priority:"high",
      sound:"default",
      vibrateTimingsMillis:[200,500,800],
      imageUrl:"https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=719&q=80"
      // "https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=719&q=80"
    }
  }
}).then((msg)=>{
  console.log(msg);
    res.send(msg)
    res.status(200)
}).catch((err)=>{
  res.send(err)
  res.status(404)
  console.log(err);
})
  } catch (error) {
    console.log(error);
    res.send(false)
    res.status(500)
  }
}

// console.log(serviceAccount , "serviceAccount");



 const UploadDocument1 = async (a,b,editImage=false,OldFile = null) =>{

  try {
    console.log(OldFile,editImage,"OldFile")
    let image = a;
    console.log(a,"data")
    let imagename  = image.name.split(".");
  let sampleFile;
  let uploadPath = "";

  if (!a.files || Object.keys(a.files).length === 0) {
   // return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = a;
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

  if(editImage==true){

    let removeFilePAth = __dirname + '/Images/' + `/${b}/`+OldFile;
    console.log(removeFilePAth,"removeFilePAth");
    fs.unlink(removeFilePAth,function(err){
      if(err) return console.log(err);
      console.log('file deleted successfully');
       }); 

  }

return sendfile
   
} catch (error) {
   console.log(error);
}
}

 const UploadDocument = async (a,b,editImage=false,OldFile = null) =>{

  try {
    console.log(OldFile,editImage,"OldFile")
    let image = a.file;
    console.log(a,"data")
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

  if(editImage==true){

    let removeFilePAth = __dirname + '/Images/' + `/${b}/`+OldFile;
    console.log(removeFilePAth,"removeFilePAth");
    fs.unlink(removeFilePAth,function(err){
      if(err) return console.log(err);
      console.log('file deleted successfully');
       }); 

  }

return sendfile
   
} catch (error) {
   console.log(error);
}
}

const UploadImage = async (a,editImage=false,OldFile = null) =>{
    try {
      // console.log(a,"fkhdsjkh");
      console.log(editImage,OldFile,"CheckOldFile");
      let image = a.profile_dp;
      console.log(image,"data");
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

      if(editImage==true){

        let removeFilePAth = __dirname + '/Images/UserProfile/'+OldFile;
        console.log(removeFilePAth,"removeFilePAth");
        fs.unlink(removeFilePAth,function(err){
          if(err) return console.log(err);
          console.log('file deleted successfully');
           }); 

      }
  
  return sendfile
     
  } catch (error) {
     console.log(error);
  }
  }

const UpdateToken =async(req,res,next)=>{
  let body = req.body;
  let id = req.params.id;
  try {

    let ChangeStatus = await Model.updateMaster(`tbl_user_web`,id,body);

    if(ChangeStatus){

      console.log(ChangeStatus,"Changestatus");
        endConnection();

        res.send(result)
        res.status(200)
    }
    
  } catch (error) {
    res.status(500)
    console.log(chalk.red(error));
    next(error)
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


const addMaster = async (req, res, next) => {
  const tableName = req.params.tableName;
  const body = req.body; 
 console.log(body)
  try {

    const GetUserDeatils = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      `id=${body.user_id}`,
      1,
      1
    )
    if(GetUserDeatils){

    let debited_credited = body.debited_credited;
    console.log(debited_credited,"debited_credited");
    let wallet = GetUserDeatils[0].wallet==null ? 0 : GetUserDeatils[0].wallet ;

    console.log(wallet,"wallet");

    if(debited_credited=="credited"){
        
      wallet = parseInt(wallet) + parseInt(body.amount)

    }else{

      wallet = parseInt(wallet) - parseInt(body.amount)

    }

    console.log(wallet,"wallet2");

    const result = await Model.updateMaster(
      `tbl_user_web`,
      req.body.user_id,
      {wallet : wallet },
      columname ="id"
    );
    if(result){

    const result1 = await Model.addMaster(tableName, body);
    console.log(result);
    console.log(result1);
        if(result1){


          const GetUserDeatils1 = await Model.getAllData(
            `*`,
            `tbl_user_web`,
            `id=${body.user_id}`,
            1,
            1
          );

if(GetUserDeatils1){
          res.send(GetUserDeatils1);
          res.status(200);

}
        }

    }


  }

    
  
    
    
   //db end connection
    endConnection();
    
  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};

const AddBidTrips = async(req,res,next)=>{
  console.log(req.body);
    try{

    let addData = await Model.addMaster(`tbl_bidding_trips`,req.body)

    if(addData){

      let result = await Model.getAllData(
        `*`,
        `tbl_bidding_trips`,
        `vendor_id=${req.body.vendor_id}`,
        1,
        `id DESC`
      )

      if(result.length){

        console.log(result);
        res.send(result)
        res.status(200)
      }
      
    }

    }catch (error) {
      //db end connection
      endConnection();
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
  
     console.log(data,"succeess")
  
      if(data !== undefined){
        body.profile_dp = data;
      }else{
        body.profile_dp = null;
      }
  
      console.log(body)
  
      const checkemail = await Model.getAllData(
        `email_id,mobile`,
        `${tableName}`,
        `email_id = '${body.email_id}' or mobile = '${body.mobile}'`,
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

  const AppDocumentUpload = async(req,res,next)=>{
    const body = req.body;
    try {
      console.log(req.body,"AppDocumentUpload");
      console.log(req.files,"Files");
      console.log(req.files.aadhar_front,"aadhar_front")
      let CheckDoc = await Model.getAllData(
        `*`,
        `tbl_vendar_documents`,
        `userid=${body.userid}`,
        1,
        1
      );

        if(req.files.aadhar_front !== undefined ){
        body.aadhar_front = await UploadDocument1(req.files.aadhar_front,body.userid,req.body.aadhar_front=='null' ? false : true , req.body.aadhar_front ? req.body.aadhar_front : null );
        }else if(req.files.aadhar_back !== undefined){
          body.aadhar_back = await UploadDocument1(req.files.aadhar_back,body.userid,req.body.aadhar_back=='null' ? false : true , req.body.aadhar_back ? req.body.aadhar_back : null);
        }else if(req.files.driving_licence_front !== undefined){
        body.driving_licence_front = await UploadDocument1(req.files.driving_licence_front,body.userid, req.body.driving_licence_front=='null' ? false : true , req.body.driving_licence_front ? req.body.driving_licence_front : null);
        }else if(req.files.driving_licence_back !== undefined){
        body.driving_licence_back = await UploadDocument1(req.files.driving_licence_back,body.userid, req.body.driving_licence_back=='null' ? false : true , req.body.driving_licence_back ? req.body.driving_licence_back : null);
        }else if(req.files.pancard_front !== undefined){
        body.pancard_front = await UploadDocument1(req.files.pancard_front,body.userid, req.body.pancard_front=='null' ? false : true , req.body.pancard_front ? req.body.pancard_front : null);
        }else if(req.files.pancard_back !== undefined){
        body.pancard_back = await UploadDocument1(req.files.pancard_back,body.userid, req.body.pancard_back=='null' ? false : true , req.body.pancard_back ? req.body.pancard_back : null);
        }

        console.log(body,"421");

      if(CheckDoc.length){

        const result = await Model.updateMaster(
          `tbl_vendar_documents`,
          CheckDoc[0].id,
          body,
          columname = "id"
        );
        if (result) {

          let CheckDoc1 = await Model.getAllData(
            `*`,
            `tbl_vendar_documents`,
            `userid=${body.userid}`,
            1,
            1
          );
          if(CheckDoc1){

            console.log(CheckDoc1,"updateMaster");
            res.status(200);
             res.send(CheckDoc1);
          }

           
        }
       

      }else{

        const result = await Model.addMaster(`tbl_vendar_documents`, body );
        if(result){
    
          // result.body = body;

          let CheckDoc1 = await Model.getAllData(
            `*`,
            `tbl_vendar_documents`,
            `userid=${body.userid}`,
            1,
            1
          );
          if(CheckDoc1){

            console.log(CheckDoc1,"addMaster");
            res.status(200);
             res.send(CheckDoc1);
          }

          // console.log(result,"updateMaster");
          // res.send(result);
          // res.status(200)
    
        }

      }



      
    } catch (error) {
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
  
      body.driving_licence_front = await UploadDocument(Files[body.driving_licence_front],body.userid);
  
      if(body.driving_licence_front == undefined){
        body.driving_licence_front = null
      }
  
     }
     
     if(Files[body.driving_licence_back] == null ){
  
      body.driving_licence_back = null ;
  
     }else{
      Files[body.driving_licence_back] = {file : Files[body.driving_licence_back] }
  
      body.driving_licence_back = await UploadDocument(Files[body.driving_licence_back],body.userid);
  
      if(body.driving_licence_back === undefined){
        body.driving_licence_back = null;
      }
     }
     
     if( Files[body.aadhar_front] == null ){
     
      body.aadhar_front = null;
      
     }else{
      Files[body.aadhar_front] = {file : Files[body.aadhar_front] }
  
      body.aadhar_front = await UploadDocument(Files[body.aadhar_front],body.userid);
  
      if(body.aadhar_front === undefined){
        body.aadhar_front = null;
      }
     }
     
     if( Files[body.aadhar_back]== null ){
  
      body.aadhar_back = null;
  
     }else{
       
      Files[body.aadhar_back] = {file : Files[body.aadhar_back] }
      body.aadhar_back = await UploadDocument(Files[body.aadhar_back],body.userid);
  
      if(body.aadhar_back == undefined){
        body.aadhar_back = null
      }
  
     }


     if( Files[body.pancard_front]== null ){
  
      body.pancard_front = null;
  
     }else{
       
      Files[body.pancard_front] = {file : Files[body.pancard_front] }
      body.pancard_front = await UploadDocument(Files[body.pancard_front],body.userid);
  
      if(body.pancard_front == undefined){
        body.pancard_front = null
      }
  
     }


     if( Files[body.pancard_back]== null ){
  
      body.pancard_back = null;
  
     }else{
       
      Files[body.pancard_back] = {file : Files[body.pancard_back] }
      body.pancard_back = await UploadDocument(Files[body.pancard_back],body.userid);
  
      if(body.pancard_back == undefined){
        body.pancard_back = null
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


  const randomString=async(length, chars)=>{
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}



  const AddTrips = async (req, res, next) => {
    const newcustomer = req.params.newcustomer;
    let body = req.body;
  console.log(body);
  
    try {

      if(newcustomer==0){
        body.trip_id = await randomString(10, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        
        const result = await Model.addMaster(`tbl_trips`, body );

        if(result){
          console.log(result);



          let getData = await Model.getAllData(`*`,`tbl_trips`,`id=${result.insertId}`,1,1)

          if(getData){
            res.send(getData)
            res.status(200);
          }
        }
      }else if(newcustomer==1){

   let customer1 = JSON.parse(body.customer);

   let customer = customer1[0]

        console.log(customer);

        customer.status = 1;
        customer.userType = 4;

        let AddNewCustomer = await Model.addMaster(`tbl_user_web`,customer);

        if(AddNewCustomer){

          delete body.customer;

          body.customer_id = AddNewCustomer.insertId;

          body.trip_id = await randomString(10, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');

          console.log(body,"527");

          const result1 = await Model.addMaster(`tbl_trips`, body );

          if(result1){

            console.log(result1,"533");

            let getData1 = await Model.getAllData(`*`,`tbl_trips`,`id=${result1.insertId}`,1,1)

            if(getData1){

              console.log(getData1,"539");



              // res.send(getData1)
              // res.status(200);
            }
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

        let BiddingTrip = await Model.getAllData(
          `*`,
          `tbl_bidding_trips`,
          `vendor_id = ${result[0].id} and status = 'approved'`,
          1,
          `id DESC`
        )

        if(BiddingTrip){
          result[0].BiddingTrip  = JSON.stringify(BiddingTrip);
        }else{
          result[0].BiddingTrip  = JSON.stringify([]);
        }


        let WalletHistory = await Model.getAllData(
          `tbl_wallet_master_history.*`,
          `tbl_user_web,tbl_wallet_master_history`,
          `tbl_user_web.id = ${result[0].id} and tbl_wallet_master_history.user_id = tbl_user_web.id`,
          `1`,
          `tbl_wallet_master_history.id DESC`
        )

        let tbl_vendar_documents = await Model.getAllData(
          `*`,
          `tbl_vendar_documents`,
          `userid=${result[0].id}`,
          1,
          1
        )
        if(tbl_vendar_documents){

          
          result[0].Documentation = JSON.stringify(tbl_vendar_documents)

        }else{

          result[0].Documentation = null

        }
        
        if(WalletHistory){
         
          let arr =[]

          let wait = await   WalletHistory.map((ival,i)=>{
            
            arr.push([i+1 , ival.amount , ival.debited_credited ,ival.created_At])

          })

          
          await Promise.all(wait);
          
           result[0].wallethistory = JSON.stringify(arr);

           console.log(result);
       
            res.send(result);
            res.status(200);
      }else{

        result[0].wallethistory = null;
        // console.log(result);
    
         res.send(result);
         res.status(200);

      }
      }else{
        res.send(false);
        res.status(404)
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
    
  // console.log(body);
    try {

      let result = await Model.getAllData(
        `*`,
        `tbl_user_web`,
        `email_id='${body.email_id}' and password ='${body.password}' and status = 1 and userType = 3`,
        1,
        1
      )
      if(result){
        // console.log(result);

        


        let WalletHistory = await Model.getAllData(
          `tbl_wallet_master_history.*`,
          `tbl_user_web,tbl_wallet_master_history`,
          `tbl_wallet_master_history.user_id = tbl_user_web.id and tbl_wallet_master_history.user_id=${result[0].id}`,
          1,
          1
        );

        let tbl_vendar_documents = await Model.getAllData(
          `*`,
          `tbl_vendar_documents`,
          `userid=${result[0].id}`,
          1,
          1
        )
        if(tbl_vendar_documents){

          
          result[0].Documentation = JSON.stringify(tbl_vendar_documents)

        }else{

          result[0].Documentation = null

        }

        let BiddingTrip = await Model.getAllData(
          `*`,
          `tbl_bidding_trips`,
          `vendor_id = ${result[0].id}`,
          1,
          `id DESC`
        )

        if(BiddingTrip){
          result[0].BiddingTrip  = JSON.stringify(BiddingTrip)
        }else{
          result[0].BiddingTrip  = JSON.stringify([])
        }

        if(WalletHistory){

          // console.log(WalletHistory,"WalletHistoryWalletHistory");
         
          let arr =[]

          let wait = await WalletHistory.map((ival,i)=>{
            
            arr.push([i+1 , ival.amount , ival.debited_credited ,ival.created_At])

          })

          
          await Promise.all(wait);

          console.log(arr,"arrarrarr");
          
           result[0].wallethistory = JSON.stringify(arr);
           console.log(result,"resultresultresult");
      //  log
            // ;
            res.status(200);
            res.send(result)
      }else{

        result[0].wallethistory = null;
        console.log(result);
    
         res.send(result);
         res.status(200);

      }
      }else{
        res.status = 404;
        res.send(false);
      }
     


    } catch (error) {
      //db end connection
      // endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  };

  const UpdateBiddingApproval = async(req,res,next)=>{
    const tableName = req.params.tableName;
    const body = req.body.categoryArray;
    const id = req.body.id;
    let columname = req.params.id;

    console.log(req.params);
    console.log(req.body);
    try {

     const FetchData = await Model.getAllData(
       `id`,
       `tbl_bidding_trips`,
       `trip_id = ${req.params.vend_id}`,
       1,
       1
     )
     if(FetchData){
       console.log(FetchData,"1157");

       let wait = await FetchData.map(async(ival,i)=>{

        if(ival.id == id){
          let result1 = await Model.updateMaster(
            tableName,
            id,
            body
          );
        }else{
          let result2 = await Model.updateMaster(
            tableName,
            ival.id,
            {status : 'waiting'}
          );
        }

        if(i+1==FetchData.length){
          let result11 = await Model.getAllData(
            `tbl_bidding_trips.*,tbl_user_web.username as UserName,tbl_user_web.token,tbl_trips.trip_assigned_to`,
            `tbl_bidding_trips,tbl_user_web,tbl_trips`,
            `tbl_bidding_trips.vendor_id = tbl_user_web.id and  tbl_trips.id = tbl_bidding_trips.trip_id  and tbl_bidding_trips.trip_id = ${req.params.vend_id}`,
            1,
            `tbl_bidding_trips.req_amount `
        ) 
        if(result11){
          res.send(result11);
          res.status(200)
        }
        }

       })

       await Promise.all(wait)

     }
      
    } catch (error) {
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  }

  const updateMasterApp = async (req, res, next) => {
    const tableName = req.params.tableName;
    const body = req.body;
    // const id = req.body.id;
    let id = req.params.id;
   console.log(body);
    try {
      const result1 = await Model.updateMaster(
        tableName,
        id,
        body
      );
      if (result1) {
        console.log(result1,"500");

        let result = await Model.getAllData(
          `*`,
          `${tableName}`,
          `id = ${id}`,
          1,
          1
        )
        if(result){
          // console.log(res1,"updateMasterApp");
          // res.status(200);
          // res.send(res1);
          let BiddingTrip = await Model.getAllData(
            `*`,
            `tbl_bidding_trips`,
            `vendor_id = ${result[0].id}`,
            1,
            `id DESC`
          )
  
          if(BiddingTrip){
            result[0].BiddingTrip  = JSON.stringify(BiddingTrip)
          }else{
            result[0].BiddingTrip  = JSON.stringify([])
          }
  
  
          let WalletHistory = await Model.getAllData(
            `tbl_wallet_master_history.*`,
            `tbl_user_web,tbl_wallet_master_history`,
            `tbl_user_web.id = ${result[0].id} and tbl_wallet_master_history.user_id = tbl_user_web.id`,
            `1`,
            `tbl_wallet_master_history.id DESC`
          )
  
          let tbl_vendar_documents = await Model.getAllData(
            `*`,
            `tbl_vendar_documents`,
            `userid=${result[0].id}`,
            1,
            1
          )
          if(tbl_vendar_documents){
  
            
            result[0].Documentation = JSON.stringify(tbl_vendar_documents)
  
          }else{
  
            result[0].Documentation = null
  
          }
          
          if(WalletHistory){
           
            let arr =[]
  
            let wait = await   WalletHistory.map((ival,i)=>{
              
              arr.push([i+1 , ival.amount , ival.debited_credited ,ival.created_At])
  
            })
  
            
            await Promise.all(wait);
            
             result[0].wallethistory = JSON.stringify(arr);
  
             console.log(result,1353);
         
              res.send(result);
              res.status(200);
        }else{
  
          result[0].wallethistory = null;
          // console.log(result);
      
           res.send(result,"1181");
           res.status(200);
  
        }

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



  const UpdateUser = async(req,res,next) =>{
    // const tableName = `tbl_user_web`;
    // const body = req.body;

    const tableName = req.params.tableName;
    const body = req.body;
    const id = req.params.editid;
    let columname = req.params.id;
      console.log(req.body,"581");

     console.log(req.files,"582");
    try{

      let UpdateOldImage = await Model.getAllData(
        `*`,
        `${tableName}`,
        `id = ${id}`,
        1,
        1
      )
      if(UpdateOldImage){
  
      const data = await UploadImage(req.files,true,UpdateOldImage[0].profile_dp)
  
     console.log(data,"succeess")
  
      if(data !== undefined){
        body.profile_dp = data;
      }else{
        body.profile_dp = null;
      }
  
      console.log(body)
  
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



  const UploadUserProfile =async(req,res,next)=>{
      const id = req.params.id;
      let tableName = 'tbl_user_web';
      let columname = "id";
      let body = req.body;
      try {
          console.log(body);
          console.log(id);



        let UpdateOldImage = await Model.getAllData(
        `*`,
        `${tableName}`,
        `id = ${id}`,
        1,
        1
      )
      if(UpdateOldImage){
  
      const data = await UploadImage(req.files,true,UpdateOldImage[0].profile_dp)
  
        console.log(data,"succeess")
     
         if(data !== undefined){
           body.profile_dp = data;
         }else{
           body.profile_dp = null;
         }

         const result1 = await Model.updateMaster(
          tableName,
          id,
          body,
          columname
        );
        if (result1) {
          console.log(result,"500");
  
          let result = await Model.getAllData(
            `*`,
            `${tableName}`,
            `id = ${id}`,
            1,
            1
          )
          if(result){

            let BiddingTrip = await Model.getAllData(
              `*`,
              `tbl_bidding_trips`,
              `vendor_id = ${result[0].id}`,
              1,
              `id DESC`
            )
    
            if(BiddingTrip){
              result[0].BiddingTrip  = JSON.stringify(BiddingTrip)
            }else{
              result[0].BiddingTrip  = JSON.stringify([])
            }
    
    
            let WalletHistory = await Model.getAllData(
              `tbl_wallet_master_history.*`,
              `tbl_user_web,tbl_wallet_master_history`,
              `tbl_user_web.id = ${result[0].id} and tbl_wallet_master_history.user_id = tbl_user_web.id`,
              `1`,
              `tbl_wallet_master_history.id DESC`
            )
    
            let tbl_vendar_documents = await Model.getAllData(
              `*`,
              `tbl_vendar_documents`,
              `userid=${result[0].id}`,
              1,
              1
            )
            if(tbl_vendar_documents){
    
              
              result[0].Documentation = JSON.stringify(tbl_vendar_documents)
    
            }else{
    
              result[0].Documentation = null
    
            }
            
            if(WalletHistory){
             
              let arr =[]
    
              let wait = await   WalletHistory.map((ival,i)=>{
                
                arr.push([i+1 , ival.amount , ival.debited_credited ,ival.created_At])
    
              })
    
              
              await Promise.all(wait);
              
               result[0].wallethistory = JSON.stringify(arr);
    
               console.log(result,1353);
           
                res.send(result);
                res.status(200);
          }else{
    
            result[0].wallethistory = null;
            // console.log(result);
        
             res.send(result);
             res.status(200);
    
          }


            // console.log(result,"670");
            // res.status(200);
            // res.send(res1);
          }

        }
      }

        
      } catch (error) {
        endConnection();
        console.log(chalk.red(error));
        next(error);
        res.status(500)
      }


  }


  const UpdateVendarDocument = async(req,res,next)=>{

    const tableName = req.params.tableName;
    const id = req.params.id;
    const body = req.body;
    const Files = req.files;
    try{
     

  
    // console.log(Files[body.driving_licence_front] )

    let UploadImageChck = await Model.getAllData(
      `*`,
      `${tableName}`,
      `userid= ${id}`,
      1,
      1
    )
    if(UploadImageChck){
     
      console.log(UploadImageChck,"UploadImageChck");
    
  
     if( Files[body.driving_licence_front] == undefined  ){
  
       body.driving_licence_front = body.driving_licence_front ;
  
     }else{
  
      Files[body.driving_licence_front] = {file : Files[body.driving_licence_front]}
  
      body.driving_licence_front = await UploadDocument(Files[body.driving_licence_front],id,UploadImageChck[0].driving_licence_front ? true :  false , UploadImageChck[0].driving_licence_front);
  
      if(body.driving_licence_front == undefined){
        body.driving_licence_front = null
      }
  
     }
     
     if(Files[body.driving_licence_back] == undefined ){
  
      body.driving_licence_back = body.driving_licence_back ;
  
     }else{
      Files[body.driving_licence_back] = {file : Files[body.driving_licence_back] }
  
      body.driving_licence_back = await UploadDocument(Files[body.driving_licence_back],id,UploadImageChck[0].driving_licence_back ? true : false,UploadImageChck[0].driving_licence_back);
  
      if(body.driving_licence_back === undefined){
        body.driving_licence_back = null;
      }
     }
     
     if( Files[body.aadhar_front] == undefined ){
     
      body.aadhar_front = body.aadhar_front;
      
     }else{
      Files[body.aadhar_front] = {file : Files[body.aadhar_front] }
  
      body.aadhar_front = await UploadDocument(Files[body.aadhar_front],id,UploadImageChck[0].aadhar_front ? true : false,UploadImageChck[0].aadhar_front);
  
      if(body.aadhar_front === undefined){
        body.aadhar_front = null;
      }
     }
     
     if( Files[body.aadhar_back]== undefined ){
  
      body.aadhar_back = body.aadhar_back;
  
     }else{
       
      Files[body.aadhar_back] = {file : Files[body.aadhar_back] }
      body.aadhar_back = await UploadDocument(Files[body.aadhar_back],id,UploadImageChck[0].aadhar_back ? true : false,UploadImageChck[0].aadhar_back);
  
      if(body.aadhar_back == undefined){
        body.aadhar_back = null
      }
  
     }

     if( Files[body.pancard_front]== undefined ){
  
      body.pancard_front = body.pancard_front;
  
     }else{
       
      Files[body.pancard_front] = {file : Files[body.pancard_front] }
      body.pancard_front = await UploadDocument(Files[body.pancard_front],id,UploadImageChck[0].pancard_front ? true : false,UploadImageChck[0].pancard_front);
  
      if(body.pancard_front == undefined){
        body.pancard_front = null
      }
  
     }

     if( Files[body.pancard_back]== undefined ){
  
      body.pancard_back = body.pancard_back;
  
     }else{
       
      Files[body.pancard_back] = {file : Files[body.pancard_back] }
      body.pancard_back = await UploadDocument(Files[body.pancard_back],id,UploadImageChck[0].pancard_back ? true : false,UploadImageChck[0].pancard_back);
  
      if(body.pancard_back == undefined){
        body.pancard_back = null
      }
  
     }
  
     console.log(body)
     console.log(tableName,"tableName")
     console.log(id,"id")
  
  
     const result = await Model.updateMaster(
      tableName,
      id,
      body,
      columname = "userid"
    );
    if (result) {
      console.log(result);
       res.status(200);
        res.send(result);
    }
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


  const EditDriverdata = async(req,res,next)=>{
    try {

      let body = req.body;

      console.log(body);

      console.log(req.files)

      if( body.file1 !='' ){
        body.driving_license_front = await UploadDocument1(req.files.file1,body.vendor,true,body.driving_license_front);

        console.log(body);
      }else if(body.file2 !=''){
        body.driving_licence_back = await UploadDocument1(req.files.file2,body.vendor,true,body.driving_license_back);
      }else if( body.file3 !='' ){
        body.police_verify = await UploadDocument1(req.files.file3,body.vendor,true,body.police_verify);
      }

      delete body.file1;
      delete body.file2; 
      delete body.file3;  

      let result = await Model.updateMaster(
        `tbl_vendor_drivers`,
        req.params.id,
        body)

      

      if(result){

        let FetchData = await Model.getAllData(
          `tbl_vendor_drivers.*,tbl_user_web.username`,
          `tbl_vendor_drivers,tbl_user_web`,
          `tbl_vendor_drivers.vendor = tbl_user_web.id and tbl_user_web.status = 1`,
          1,
          `tbl_user_web.id`
        )
        if(FetchData){
          console.log(FetchData);
          res.send(FetchData)
          res.status(200)
        }

      }
      
    } catch (error) {
      endConnection();
      console.error(chalk.red(error));
      res.status(500);
      next(error);
    }
  }


  const AddDriverdata = async(req,res,next)=>{
    try {

      let body = req.body;

      console.log(body);

      console.log(req.files)

      if(req.files.file1){
        body.driving_license_front = await UploadDocument1(req.files.file1,body.vendor);

        console.log(body);
      }else if(req.files.file2){
        body.driving_licence_back = await UploadDocument1(req.files.file2,body.vendor);
      }else if(req.files.file3){
        body.police_verify = await UploadDocument1(req.files.file3,body.vendor);
      }

      let result = await Model.addMaster(`tbl_vendor_drivers`,body)

      if(result){

        let FetchData = await Model.getAllData(
          `tbl_vendor_drivers.*,tbl_user_web.username`,
          `tbl_vendor_drivers,tbl_user_web`,
          `tbl_vendor_drivers.vendor = tbl_user_web.id and tbl_user_web.status = 1`,
          1,
          `tbl_user_web.id`
        )
        if(FetchData){
          console.log(FetchData);
          res.send(FetchData)
          res.status(200)
        }

      }
      
    } catch (error) {
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


  const NewTrips = async()=>{

    let finalarray =[];
    try {

      // let d = moment(new Date()).format('MM-DD-YYYY HH:MM:SS');
      
      // console.log(d);

      let result = await Model.getAllData(
        `tbl_trips.*,tbl_user_web.username as customer_name,tbl_city.city as pickuplocation_name,new_city.city as drop_location_name`,
        `tbl_trips,tbl_user_web,tbl_city,tbl_city as new_city`,
        `tbl_user_web.id = tbl_trips.customer_id and tbl_trips.pickup_location=tbl_city.id and tbl_trips.drop_location = new_city.id `,
        1,
        1
      )

      

      if(result){
        console.log('====================================');
        
        let wait = await result.map((ival,i)=>{
          
          let pickDate = new Date(ival.pickup_date);
          // console.log(pickDate.getTime(),'====',new Date().getTime());

          if(pickDate.getTime() > new Date().getTime() ){
            finalarray.push(ival)
          }

          //console.log(ival.pickup_date);

        })

        await Promise.all(wait);

        // console.log(finalarray);
        return finalarray
        console.log('====================================');
      }

      
    } catch (error) {
      console.log(error);
    }
  }

  // CheckTRIPS()

 

const TripsJson = async(req,res,next)=>{
  try{

    

    // let result = await Model.getAllData(
    //   `tbl_trips.*,tbl_user_web.username as customer_name,tbl_city.city as pickuplocation_name,new_city.city as drop_location_name`,
    //   `tbl_trips,tbl_user_web,tbl_city,tbl_city as new_city`,
    //   `tbl_user_web.id = tbl_trips.customer_id and tbl_trips.pickup_location=tbl_city.id and tbl_trips.drop_location = new_city.id `,
    //   1,
    //   1
    // )
    let result = await NewTrips()
    if(result){
      res.status(200)
      res.send(result)
    }

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
    updateMasterApp,
    TripsJson,
    UpdateUser,
    UploadUserProfile,
    addMaster,
    AppDocumentUpload,
    AddBidTrips,
    CheckoutNotify,
    UpdateToken,
    SendAssignedTripNotification,
    UpdateBiddingApproval,
    AddDriverdata,
    EditDriverdata
  }