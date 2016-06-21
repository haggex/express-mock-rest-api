(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("express"), require("body-parser"), require("cors"), require("mock-response-handler"));
	else if(typeof define === 'function' && define.amd)
		define("express-mock-rest-api", ["express", "body-parser", "cors", "mock-response-handler"], factory);
	else if(typeof exports === 'object')
		exports["express-mock-rest-api"] = factory(require("express"), require("body-parser"), require("cors"), require("mock-response-handler"));
	else
		root["express-mock-rest-api"] = factory(root["express"], root["body-parser"], root["cors"], root["mock-response-handler"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _MockRestApiServer = __webpack_require__(1);
	
	module.exports = {
	    MockRestApiServer: _MockRestApiServer.MockRestApiServer
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.MockRestApiServer = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _express = __webpack_require__(2);
	
	var _express2 = _interopRequireDefault(_express);
	
	var _bodyParser = __webpack_require__(3);
	
	var _bodyParser2 = _interopRequireDefault(_bodyParser);
	
	var _cors = __webpack_require__(4);
	
	var _cors2 = _interopRequireDefault(_cors);
	
	var _mockResponseHandler = __webpack_require__(5);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var MockRestApiServer = exports.MockRestApiServer = function () {
	    function MockRestApiServer(port, mockApiPath, options) {
	        _classCallCheck(this, MockRestApiServer);
	
	        this.started = false;
	        this.options = options;
	        this.port = port;
	        this.mockApiPath = mockApiPath;
	        this.responseHandler = new _mockResponseHandler.ResponseHandler();
	        this.server = null;
	    }
	
	    _createClass(MockRestApiServer, [{
	        key: "stop",
	        value: function stop() {
	            if (this.server != null && this.started == true) {
	                this.server.stop();
	            }
	        }
	    }, {
	        key: "start",
	        value: function start() {
	            var _this = this;
	
	            var app = (0, _express2.default)();
	            var corsOptionsDelegate = function corsOptionsDelegate(req, callback) {
	                console.log("CORS DELEGATE");
	                callback(null, { origin: true, credentials: true });
	            };
	            app.use((0, _cors2.default)(corsOptionsDelegate));
	            app.set('etag', false);
	            app.set("port", this.port);
	
	            var responseApi = (0, _express2.default)();
	            responseApi.use(_bodyParser2.default.json());
	            responseApi.post("/add", function (request, response) {
	                var json = request.body;
	                _this.responseHandler.mapResponse(json.path, json.method, json.responseHttpStatus, json.responseBody, json.responseHeaders || {});
	                _this.setCacheHeaders(response);
	                response.send('{"result" : "OK"}');
	            });
	            responseApi.post("/list", function (request, response) {
	                var json = request.body;
	                var requests = _this.responseHandler.getResponses(json.path, json.method, json.status);
	                _this.setCacheHeaders(response);
	                response.json(requests);
	            });
	            responseApi.get("/reset", function (request, response) {
	                _this.responseHandler.reset();
	                response.status(200);
	                _this.setCacheHeaders(response);
	                response.set("Content-Type", "application/json");
	                response.send('{"result" : "OK"}');
	            });
	
	            var mockApi = (0, _express2.default)();
	            mockApi.use(_bodyParser2.default.json());
	            mockApi.post("/*", function (request, response) {
	                console.log("Handle POST");
	                _this.handleRequest(request, "POST", response);
	            });
	            mockApi.get("/*", function (request, response) {
	                console.log("Handle GET");
	                _this.handleRequest(request, "GET", response);
	            });
	
	            app.use("/responses", responseApi);
	            app.use(this.mockApiPath, mockApi);
	
	            var welcome = (0, _express2.default)();
	            welcome.get("/", function (req, res) {
	                res.send("Welcome!");
	            });
	            app.use("/", welcome);
	
	            this.server = app.listen(app.get('port'), function () {
	                var port = _this.server.address().port;
	                console.log('Magic happens on port ' + port);
	                _this.started = true;
	            });
	        }
	    }, {
	        key: "setGlobalHeaders",
	        value: function setGlobalHeaders(request, response) {
	            if (this.options.useRequestHostAsAllowOrigin) {
	                response.set("Access-Control-Allow-Origin", request.headers.host);
	            }
	            if (this.options.headers) {
	                for (var h in this.options.headers) {
	                    response.set(h, this.options.headers[h]);
	                }
	            }
	        }
	    }, {
	        key: "handleRequest",
	        value: function handleRequest(request, method, response) {
	            var apiResponse = this.responseHandler.onRequest(request.url, method, request.body, null);
	            if (apiResponse) {
	                if (apiResponse.responseHeaders) {
	                    for (var x in response.responseHeaders) {
	                        response.set(x, response.responseHeaders[x]);
	                    }
	                }
	                this.setCacheHeaders(response);
	                console.log("Sending response = ", apiResponse.responseBody);
	                response.status(apiResponse.responseHttpStatus);
	                if (apiResponse.responseBody) {
	                    response.json(apiResponse.responseBody);
	                } else {
	                    response.send();
	                }
	            } else {
	                this.notFound(response, request);
	            }
	        }
	    }, {
	        key: "setCacheHeaders",
	        value: function setCacheHeaders(response) {
	            response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
	            response.header('Expires', '-1');
	            response.header('Pragma', 'no-cache');
	        }
	    }, {
	        key: "notFound",
	        value: function notFound(response, request) {
	            response.status(404).send("No response mapped for " + request.url + " available: " + this.responseHandler.getMappedPaths());
	        }
	    }]);

	    return MockRestApiServer;
	}();

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=express-mock-rest-api.js.map