const mailjet = require('node-mailjet');

const transporter = mailjet.connect(
  "<Your Key1>",
  "<Your Key2>"
)


module.exports = function(email, title, body, html,callback){
  const request = transporter.post('send').request({
  FromEmail: '<Your Email>',
  FromName: 'E-Store',
  Subject: title,
  'Text-part':body,
  'Html-part':html,
  Recipients: [{ Email: email }],
	})
	request
	.then(result => {
		callback();
	})
	.catch(err => {
		callback("error occured");
	})
}