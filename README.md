fetch-url
=========

Node.js的网页抓取模块，支持GET/POST/PUT/DELETE协议。可用于RESTful接口的调用

#Demo

	var f = require("fetch-url");
	f.request({
		"headers" : {
			"Cookie" : "somekey=somevalue"
		},
		"method" : "GET",
		"url" : "http://somedomain",
		"data" : {
			"wd" : "fetch-url"
		}
	}, function(err, data){
		err ? console.log(err) : console.log(data);
	});

#Testing

	$ git clone https://github.com/pangnate/fetch-url
	$ cd fetch-url
	$ npm install
	$ npm test
	
	$ node test/get.js