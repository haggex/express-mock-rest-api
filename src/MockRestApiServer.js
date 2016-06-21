import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {ResponseHandler} from  "mock-response-handler";


export class MockRestApiServer {

    constructor(port,mockApiPath,options) {
        this.started = false;
        this.options = options;
        this.port = port;
        this.mockApiPath = mockApiPath;
        this.responseHandler = new ResponseHandler();
        this.server = null;
    }
    stop() {
        if(this.server != null && this.started == true) {
            this.server.stop();
        }
    }
    start() {
        var app = express();
        var corsOptionsDelegate = (req, callback) => {
            console.log("CORS DELEGATE");
            callback(null,{ origin: true, credentials : true});
        };
        app.use(cors(corsOptionsDelegate));
        app.set('etag', false);
        app.set("port", this.port);

        var responseApi = express();
        responseApi.use(bodyParser.json());
        responseApi.post("/add",(request,response) => {
            var json = request.body;
            this.responseHandler.mapResponse(json.path, json.method, json.responseHttpStatus, json.responseBody, json.responseHeaders || {});
            this.setCacheHeaders(response);
            response.send('{"result" : "OK"}');
        });
        responseApi.post("/list",(request,response) => {
            var json = request.body;
            var requests = this.responseHandler.getResponses(json.path, json.method,json.status)
            this.setCacheHeaders(response);
            response.json(requests);
        });
        responseApi.get("/reset",(request,response)=>{
            this.responseHandler.reset();
            response.status(200);
            this.setCacheHeaders(response);
            response.set("Content-Type", "application/json");
            response.send('{"result" : "OK"}');
        });

        var mockApi = express();
        mockApi.use(bodyParser.json());
        mockApi.post("/*",(request,response)=>{
            console.log("Handle POST");
            this.handleRequest(request, "POST", response);
        });
        mockApi.get("/*",(request,response)=>{
            console.log("Handle GET");
            this.handleRequest(request, "GET", response);
        });

        app.use("/responses",responseApi);
        app.use(this.mockApiPath,mockApi);

        var welcome = express();
        welcome.get("/",(req,res)=>{
            res.send("Welcome!");
        });
        app.use("/",welcome);

        this.server = app.listen(app.get('port'), () => {
            var port = this.server.address().port;
            console.log('Magic happens on port ' + port);
            this.started = true;
        });
    }
    setGlobalHeaders(request, response) {
        if(this.options.useRequestHostAsAllowOrigin) {
            response.set("Access-Control-Allow-Origin",request.headers.host)
        }
        if(this.options.headers) {
            for(var h in this.options.headers) {
                response.set(h,this.options.headers[h]);
            }
        }
    }

    handleRequest(request, method, response) {
        var apiResponse = this.responseHandler.onRequest(request.url,method,request.body,null);
        if (apiResponse) {
            if (apiResponse.responseHeaders) {
                for (var x in response.responseHeaders) {
                    response.set(x, response.responseHeaders[x]);
                }
            }
            this.setCacheHeaders(response);
            console.log("Sending response = ", apiResponse.responseBody);
            response.status(apiResponse.responseHttpStatus);
            if(apiResponse.responseBody) {
                response.json(apiResponse.responseBody);
            } else {
                response.send();
            }

        } else {
            this.notFound(response, request);
        }
    }

    setCacheHeaders(response) {
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.header('Expires', '-1');
        response.header('Pragma', 'no-cache');
    }

    notFound(response, request) {
        response.status(404).send("No response mapped for " + request.url + " available: " + this.responseHandler.getMappedPaths());
    }

}

