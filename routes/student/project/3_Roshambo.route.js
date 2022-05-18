const router = require('express').Router();
var compiler = require('compilex');
var options = {stats : true}; //prints stats on console 
compiler.init(options);
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://appts:Appts123456789@apptsystem.jgb2f.mongodb.net/test";
const mydatabase = "APPTSystem";

router.post('/submit', async (req, res, next) => {
  const person = req.user;
  var code = req.body.code;
  var lang = req.body.lang;
  var currentProject = "Roshambo";
  var timetodo = 0;

  //*** COMPILER */
  var envData = { OS : "linux" , cmd : "gcc" };
  compiler.compileCPP(envData , code , function (data) {
    //compiler.compileCPP(envData, code, function (data) {
    var dataOut = data.output;
    if(dataOut === undefined || dataOut === null) {console.log("DataOut@undefined!!!! : "+dataOut)}
    else ;
    //** DATABASE */
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(mydatabase);
      var query = { email:person.email};
      dbo.collection("StudentAnswer").find(query).toArray(function(err, result) {
        if (err) throw err;
        if(Object.keys(result).length >= 1){
          for (let i = 0; i < Object.keys(result).length; i++) {
            if(result[i].contentName === currentProject) timetodo++;
          }
        }
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db(mydatabase);
          var myobj = { 
            timetodo:timetodo+1,
            times: new Date().toLocaleString(), 
            email: person.email,
            role:person.role,
            contentName:currentProject,
            lang:lang,
            code:code,
            output:dataOut
          };
          dbo.collection("StudentAnswer").insertOne(myobj, function(err, res) {
            if (err) throw err;
            db.close();
          });
        });
      });
    });//** DATABASE */
  }); //*** COMPILER */

  try {
      res.redirect('/project')    
  } catch (error) {
    next(error);
  }
});


router.get('/', async (req, res, next) => {
  const person = req.user;
  if(person != undefined){
    // PRETEST Check
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(mydatabase);
      var query = { email: person.email };
      dbo.collection("StudentAnswer").find(query).toArray(function(err, StudentAnswer) {
        if (err) throw err;
        if(Object.keys(StudentAnswer).length === 0){
          res.redirect('/')
        }
        else{
          res.render('student/project/3_Roshambo', { person });
        }
        db.close();
      });
    });
    // PRETEST Check
      
  }
});

module.exports = router;