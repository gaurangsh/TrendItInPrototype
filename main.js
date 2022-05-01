const express = require('express')
const multer = require('multer');
const fs = require('fs');
const db = require("./database/index.js")

const sendMail = require("./utils/sendMail");

const userModel = require("./database/models/user.js")
const cartModel = require("./database/models/cart.js")

const app = express()
const port = 3000
const session = require("express-session");
app.use(express.static(__dirname + '/styles'))
//Setting ejs as default templating engine
// by def, if name of folder is views, then you dont need to specify the folder name
app.set("view engine",'ejs');
app.set("views");
//initiate database connection
db.init();

//middlewares
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static("scripts"))
app.use(express.static("uploads"))
app.use(express.static("styleImages"))
app.use(session({
	secret: 'keyboard cat',
  saveUninitialized: true,
  resave: false
}))

//multer
const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null,'uploads')
	},
	filename: function(req, file, cb){
		const uniqueSuffix = Date.now() + '_' +Math.round(Math.random()* 1E9)
		cb(null, file.fieldname + '-' + uniqueSuffix)
	}
})

const upload = multer({storage:storage})

//Dont use this as no need to pass image on everyline
//app.use(upload.single("profile_pic"))

app.get('/auth', (req, res) => {
	if(req.session.isLoggedIn == true){
		res.redirect("/")
		return;
	}else{
		res.render('auth');
	}
})

app.route('/login').get(function(req,res){
	if(req.session.isLoggedIn == true){
		res.redirect("/")
		return;
	}
	res.render('login',{error:null});
}).post(function(req,res){
	const username = req.body.username;
	const password = req.body.password;

	userModel.findOne({username:username, password:password})
	.then(function(user){
		if(user){
			if(!user.isVerifiedMail){
				res.render("login",{error:"User not verified! Please Verify"})
			}else{
				req.session.user = user;
				console.log(req.session.user)
				req.session.isLoggedIn = true;
				res.redirect("/")
			}
		}else{
			res.render("login",{error:"Invalid UserID / Password"})
		}
	})
})

app.route('/signup').get(function(req,res){
	if(req.session.isLoggedIn == true){
		res.redirect("/")
		return;
	}
	res.render("signup",{error:null});
}).post(upload.single("profile_pic"),function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var file = req.file;
	
	//If username or password or image file is not present:
	if(!username){
		res.render("signup",{error: "Please enter username!"});
		return;
	}

	if(!password){
		res.render("signup",{error: "Please enter password!"});
		return;
	}

	if(!file){
		res.render("signup",{error: "Please upload a profile photo!"});
		return;
	}

	var toCreate = false;
	userModel.findOne({username:username})
	.then(function(user){
		if(user){
			
			res.render("signup",{error:"Account Already Exists!"});
		}else{
			toCreate = true;
			userModel.create({
				username: username,
				password: password,
				profile_pic: file.filename,
				isVerifiedMail: false,
			})
			.then(function(){
				var html = '<h1>Please click here to verify</h1>'+
				'<a href="http://localhost:3000/'+username+'">Click Here</a>'
				sendMail(username, "Welcome to E-Store!","Please click here to verify",
				html,
				function(error){
					if(error){
						//Do error handling
						res.render("signup",{error:"Oops! Could not verify. Please enable to send email"});
					}else{
						res.redirect("/login"); 
					}
				})
				
			}).catch(function(){
				res.render("signup",{error:"Internal Server Error"});
			})	
			
		}
		console.log(user)
		
	})
})

app.get("/",function(req, res){
	
	if(req.session.isLoggedIn){
		fs.readFile("products.js","utf-8",function(err, data){
			const user1 = req.session.user;
			res.render("index", 
			{
				user:user1,
				products: JSON.parse(data)
				
			});
		})
	}else{
		fs.readFile("products.js","utf-8",function(err, data){
			
			res.render("index", 
			{
				user:null,
				products: JSON.parse(data)
				
			});
		})
	}
})

app.post("/logout", function(req,res){
	req.session.destroy();
	res.redirect("/");
	
});

app.get("/verifyuser/:username",function(req, res){
	const username = req.params.username;

	userModel.findOne({username: username}).then(function(user){
		var body = {};
		body.isVerifiedMail = true;
		if(user){
			userModel.findOneAndUpdate({username: username}, {isVerifiedMail:true},(error,data) => {
				if(error){
					res.send("Internal Server Error! Try Again")
				}else{
					res.redirect("/login"); 
				}
			})
		}else{
			res.send("User does not exist")
		}
	})
})

//Add to Cart Functionality
app.route("/cart")
.post(function(req,res){
	var user = null;
	if(req.session.isLoggedIn){
		var product_id = req.body.id;
		user = req.session.user;
		cartModel.create({
			product_id:product_id,
			product_image: "random",
			product_description: "abcd",
			product_name: "abcde",
			user_id: user._id
		}).then(function(){
			res.status(200).json({status:true, message:"Product added to cart", data:null})
		})
	}else{
		res.status(401).json({status:false, message:"Please login", data:null})
		return
	}
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
