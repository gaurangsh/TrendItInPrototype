module.exports.init = function(){
    const mongoose = require('mongoose');
    mongoose.connect('mongodb+srv://<username>:<password>@cluster0.rq2ix.mongodb.net/ecommone?retryWrites=true&w=majority')
    .then(function(){
      console.log("db is on");
    }).catch(function(){
      console.log("db is off");
    })
  }