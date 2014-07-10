node-fetch-url
=========

Node.js的网页抓取模块，支持GET/POST/PUT/DELETE协议。可用于RESTful接口的调用

# Demo

	var f = require("node-fetch-url");
	f.request({
		"headers" : {
			"Cookie" : "somekey=somevalue"
		},
		"method" : "GET",
		"url" : "http://somedomain",
		"data" : {
			"wd" : "node-fetch-url"
		}
	}, function(err, data){
		err ? console.log(err) : console.log(data);
	});

# Installation

通过 npm 安装

	$ npm install node-fetch-url

还可以直接下载源码本地安装

	$ git clone https://github.com/pangnate/node-fetch-url
	$ cd node-fetch-url
	$ npm install
	$ npm test

# Testing
	
	$ node test/get.js