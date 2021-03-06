/*
 * retch-url.request
 * */
exports.request = function (options, callback) {

	//默认配置
	var def = {
			protocol: "http",
			host: "127.0.0.1",
			port: 80,
			method: "GET",
			url: "/",
			data: {},
			headers: {
				"Host": "node-fetch-url",
				"User-Agent": "node-fetch-url (https://github.com/pangnate/node-fetch-url)",
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
				"Accept-Language": "zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3",
				"Connection": "keep-alive"
			},
			timeout: 5000
		},
		setting, error, timeoutEvent, http, response,
		isHTTPRequest = false,
		methodArr = ["GET", "POST", "PUT", "DELETE"],
		url = require("url"), querystring = require('querystring');

	if (isJson(options)) {
		isHTTPRequest = /^http.*/i.test(options.url);
		setting = extend(def, options);
	} else {
		error = new Error("The first parameter passing a wrong value.");
	}

	// 检测请求的方法是否在规定范围内
	setting.method = setting.method.toUpperCase();
	if (!inArray(setting.method, methodArr)) {
		error = new Error("The method is not identified.");
	}

	// 检测url参数是否是一个绝对地址
	if (typeof setting.url != "string" || !/^http*/i.test(setting.url)) {
		error = new Error("The url must be an absolute address.");
	} else {
		var op = url.parse(setting.url);
		setting.protocol = op.protocol ? op.protocol : "http";
		setting.host = op.hostname ? op.hostname : "127.0.0.1";
		setting.port = op.port ? op.port : 80;
		setting.path = op.path ? op.path.split("?")[0] : "";
		setting.query = op.query ? op.query : "";
	}

	// 修正参数
	setting.protocol = setting.protocol.replace(":", "").toLowerCase();
	setting.port = parseInt(setting.port);
	setting.headers.Host = setting.host;
	if (setting.protocol != "http" && setting.protocol != "https") {
		error = new Error("Need to specify the protocol, currently supports HTTP and HTTPS protocol.");
	} else if (setting.protocol == "https") {
		setting.port = op.port || 443;
	}

	// 处理发送的数据
	var data = querystring.stringify(setting.data);

	// 构造请求
	http = require(setting.protocol);
	var reqSetting = {
		"host": setting.host,
		"port": setting.port,
		"method": setting.method,
		"path": setting.path,
		"headers": setting.headers
	};

	var getString = "?";
	if ("" != setting.query) {
		getString += setting.query;
	}

	// GET请求
	if ("GET" == reqSetting.method && "" != data) {
		setting.query != "" ? getString += "&" : "";
		getString += data;
	} else {
		reqSetting.headers = extend(reqSetting.headers, {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			"Content-Length": data.length
		})
	}
	reqSetting.path += getString.replace(/[?&]$/,'');

	var req = http.request(reqSetting, function (res) {
		var response = {
			status: null,
			headers: null,
			body: ""
		};
		var chunkStr = "";
		response.status = res.statusCode;
		response.headers = res.headers;
		res.setEncoding('binary');
		res.on("data",function (chunk) {
			chunkStr += chunk;
		}).on("end",function () {
				clearTimeout(timeoutEvent);

				//取得目标页面编码
				var charset = "utf8";
				if (res.headers["content-type"] && res.headers["content-type"].split("charset=")[1] != undefined) {
					charset = res.headers["content-type"].split("charset=")[1];
				} else {
					var result = chunkStr.match(/charset=(.*)>/i);
					if (result != undefined && result[1] != undefined) {
						charset = result[1];
					}
				}
				charset = charset.replace(/[^0-9a-zA-Z]/ig, "").toLowerCase();

				//转码
				try {
					var iconv = require('iconv-lite');
				} catch (e) {
					error = new Error("iconv-lite was not installed.");
				}
				chunkStr = iconv.decode(new Buffer(chunkStr, 'binary'), charset);
				response.body = chunkStr;
				if (callback && typeof callback == "function") {
					callback.apply(this, [error, response]);
				}
			}).on("close",function () {
				clearTimeout(timeoutEvent);
			}).on("abort", function () {
				clearTimeout(timeoutEvent);
			});
	});

	// 超时处理
	timeoutEvent = setTimeout(function () {
		req.emit("timeout");
	}, setting.timeout);

	// 捕捉到错误
	req.on("error", function (e) {
		if (callback && typeof callback == "function") {
			callback.apply(this, [error]);
		}
		req.abort();
	});

	// 超时
	req.on("timeout", function () {
		if (req.res) {
			req.res.emit("abort");
		}
		error = new Error("Timeout.");
		req.abort();
	});

	// 其他三类请求
	if ("POST" == setting.method || "PUT" == setting.method || "DELETE" == setting.method) {
		req.write(data);
	}

	// 关闭请求
	req.end();

};

/*
 * 判断一个对象是否为数组
 * */
var isArray = function (obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
};

/*
 * 判断一个元素是否在数组中
 * */
var inArray = function (item, arr) {
	// 不是数组则跳出
	if (!isArray(arr)) {
		return false;
	}
	// 遍历是否在数组中
	for (var i = 0, k = arr.length; i < k; i++) {
		if (item == arr[i]) {
			return true;
		}
	}
	return false;
};


/*
 * 判断一个对象是否为 json
 * */
var isJson = function (obj) {
	return typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
};

/*
 * 两层拷贝对象
 * */
var extend = function (destination, source) {
	for (var p in source) {
		var sou = source[p];
		if (typeof sou == "array" || typeof sou == "object") {
			for (var k in sou) {
				destination[p][k] = sou[k];
			}
		} else {
			destination[p] = sou;
		}
	}
	return destination;
};

