module.exports.init = function(){
    const mongoose = require('mongoose');
    mongoose.connect('<Get this from connect to an app>')
    .then(function(){
      console.log("db is on");
    }).catch(function(){
      console.log("db is off");
    })
  }
