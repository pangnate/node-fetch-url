var f = require("../");
f.request({
	"headers" : {
		"Cookie" : "H_PS_PSSID=some value"
	},
	"method" : "GET",
	"url" : "https://passport.suning.com/ids/login",
	"data" : {
		"wd" : "node-fetch-url"
	}
}, function(err, data){
	err ? console.log(err) : console.log(data);
});
