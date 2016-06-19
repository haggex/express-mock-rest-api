(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("express"), require("body-parser"), require("cors"));
	else if(typeof define === 'function' && define.amd)
		define("express-mock-rest-api", ["express", "body-parser", "cors"], factory);
	else if(typeof exports === 'object')
		exports["express-mock-rest-api"] = factory(require("express"), require("body-parser"), require("cors"));
	else
		root["express-mock-rest-api"] = factory(root["express"], root["body-parser"], root["cors"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__) {
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
	
	var MockApiRestServer = __webpack_require__(1);
	
	function mockRestServer(mockApiPath, port, options) {
	    var mockApiRestServer = new MockApiRestServer(port, mockApiPath, options);
	    mockApiRestServer.start();
	    return function (server) {
	        return function () {
	            server.stop();
	        };
	    }(mockApiRestServer);
	}
	
	module.exports = mockRestServer;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _express = __webpack_require__(2);
	
	var _express2 = _interopRequireDefault(_express);
	
	var _bodyParser = __webpack_require__(3);
	
	var _bodyParser2 = _interopRequireDefault(_bodyParser);
	
	var _cors = __webpack_require__(4);
	
	var _cors2 = _interopRequireDefault(_cors);
	
	var _ResponseHandler = __webpack_require__(5);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var MockRestApiServer = function () {
	    function MockRestApiServer(port, mockApiPath, options) {
	        _classCallCheck(this, MockRestApiServer);
	
	        this.started = false;
	        this.options = options;
	        this.port = port;
	        this.mockApiPath = mockApiPath;
	        this.responseHandler = new _ResponseHandler.ResponseHandler();
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
	            app.disable('etag');
	            app.set("port", this.port);
	
	            var responseApi = (0, _express2.default)();
	            var corsOptionsDelegate = function corsOptionsDelegate(req, callback) {
	                callback(null, { origin: true, credentials: true });
	            };
	            responseApi.options("/add", (0, _cors2.default)(corsOptionsDelegate));
	
	            responseApi.use(_bodyParser2.default.json());
	
	            responseApi.post("/add", function (request, response) {
	                var json = request.body;
	                _this.responseHandler.mapResponse(json.path, json.method, json.responseHttpStatus, json.responseBody, json.responseHeaders || {});
	                response.set("Access-Control-Allow-Origin", request.headers.origin);
	                response.set("Content-Type", "application/json");
	                response.send('{"result" : "OK"}');
	            });
	
	            var mockApi = (0, _express2.default)();
	
	            mockApi.use((0, _cors2.default)(corsOptionsDelegate));
	            mockApi.disable('etag');
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
	                response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
	                response.header('Expires', '-1');
	                response.header('Pragma', 'no-cache');
	                console.log("Sending response = ", apiResponse.responseBody);
	                response.status(apiResponse.responseHttpStatus).json(apiResponse.responseBody);
	            } else {
	                this.notFound(response, request);
	            }
	        }
	    }, {
	        key: "notFound",
	        value: function notFound(response, request) {
	            response.status(404).send("No response mapped for " + request.url + " available: " + this.responseHandler.getMappedPaths());
	        }
	    }]);
	
	    return MockRestApiServer;
	}();
	
	module.exports = MockRestApiServer;

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

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var PathResponse = exports.PathResponse = function () {
	    function PathResponse(path, method, status, body, headers) {
	        _classCallCheck(this, PathResponse);
	
	        this.path = path;
	        this.method = method;
	        this.responseHttpStatus = status;
	        this.responseBody = body;
	        this.responseHeaders = headers;
	        this.requests = [];
	    }
	
	    _createClass(PathResponse, [{
	        key: "onRequest",
	        value: function onRequest(pathRequest) {
	            this.requests.push(pathRequest);
	        }
	    }]);
	
	    return PathResponse;
	}();
	
	var PathRequest = exports.PathRequest = function PathRequest(path, method, requestIndex, body, headers) {
	    _classCallCheck(this, PathRequest);
	
	    this.path = path;
	    this.method = method;
	    this.body = body;
	    this.headers = headers;
	    this.requestIndex = requestIndex;
	};
	
	var PathMapping = exports.PathMapping = function () {
	    function PathMapping(path, method) {
	        _classCallCheck(this, PathMapping);
	
	        this.path = path;
	        this.method = method;
	        this.responses = [];
	        this.currentResponse = 0;
	    }
	
	    _createClass(PathMapping, [{
	        key: "addResponse",
	        value: function addResponse(pathResponse) {
	            this.responses.push(pathResponse);
	        }
	    }, {
	        key: "getNrOfRequests",
	        value: function getNrOfRequests() {
	            return this.responses.reduce(function (prev, current) {
	                var prevLength = prev.requests.length;
	                return (prevLength ? prevLength : 0) + current.requests.length;
	            });
	        }
	    }, {
	        key: "getNextResponse",
	        value: function getNextResponse(pathRequest) {
	            var r = this.responses[this.currentResponse];
	            if (this.currentResponse + 1 < this.responses.length) {
	                this.currentResponse++;
	            }
	            r.onRequest(pathRequest);
	            return r;
	        }
	    }]);
	
	    return PathMapping;
	}();
	
	var ResponseHandler = exports.ResponseHandler = function () {
	    function ResponseHandler() {
	        _classCallCheck(this, ResponseHandler);
	
	        this.pathMappings = [];
	        this.currentRequest = 0;
	    }
	
	    _createClass(ResponseHandler, [{
	        key: "reset",
	        value: function reset() {
	            this.pathMappings = [];
	            this.currentRequest = 0;
	        }
	    }, {
	        key: "getMappedPaths",
	        value: function getMappedPaths() {
	            return this.pathMappings.map(function (pathMapping) {
	                return "[" + pathMapping.method + ":" + pathMapping.path + "]";
	            }).join(",");
	        }
	    }, {
	        key: "mapResponse",
	        value: function mapResponse(path, method, status, body, headers) {
	            var pathResponse = new PathResponse(path, method, status, body, headers);
	            var existing = this.pathMappings.find(function (pathMapping) {
	                return pathMapping.path == pathResponse.path && pathMapping.method == pathResponse.method;
	            });
	
	            if (!existing) {
	                existing = new PathMapping(pathResponse.path, pathResponse.method);
	                this.pathMappings.push(existing);
	            }
	            existing.addResponse(pathResponse);
	        }
	    }, {
	        key: "onRequest",
	        value: function onRequest(path, method, body, headers) {
	            var pathRequest = new PathRequest(path, method, this.currentRequest++, body, headers);
	            var mapping = this.findMapping(path, method);
	            if (mapping) {
	                return mapping.getNextResponse(pathRequest);
	            } else {
	                return null;
	            }
	        }
	    }, {
	        key: "findMapping",
	        value: function findMapping(path, method) {
	            var mapping = this.pathMappings.find(function (pathMapping) {
	                return pathMapping.path == path && pathMapping.method == method;
	            });
	            return mapping;
	        }
	    }, {
	        key: "findMappings",
	        value: function findMappings(path) {
	            var mappings = this.pathMappings.filter(function (pathMapping) {
	                return pathMapping.path == path;
	            });
	            return mappings;
	        }
	    }, {
	        key: "getOptionsForPath",
	        value: function getOptionsForPath(path) {
	            var mappings = this.findMappings(path, method);
	            return mappings.map(function (m) {
	                return m.method;
	            }).join(",");
	        }
	    }, {
	        key: "getRequestsForMappings",
	        value: function getRequestsForMappings(path, method, status) {
	            var requests = [];
	            var mappings = this.pathMappings.filter(function (pathMapping) {
	                if (path && method) {
	                    return pathMapping.path == path && pathMapping.method == method;
	                } else if (path) {
	                    return pathMapping.path == path;
	                } else {
	                    return true;
	                }
	            });
	            var responses = [];
	            mappings.forEach(function (pathMapping) {
	                responses = responses.concat(pathMapping.responses);
	            });
	            if (status) {
	                responses = responses.filter(function (response) {
	                    return response.responseHttpStatus == status;
	                });
	            }
	            responses.forEach(function (response) {
	                requests = requests.concat(response.requests);
	            });
	            responses.sort(function (a, b) {
	                return a.requestIndex - b.requestIndex;
	            });
	
	            return requests;
	        }
	    }]);

	    return ResponseHandler;
	}();

/***/ }
/******/ ])
});
;
//# sourceMappingURL=express-mock-rest-api.js.map