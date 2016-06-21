import {MockServerApi} from "mock-response-handler";
import {http} from "./HttpProvider";
var expect = require('chai').expect;

describe("Basic Request/Response Test",()=>{

    var testCall;

    var mockServerApi;
    beforeEach(()=>{
        mockServerApi = new MockServerApi(http, "http://localhost:8999","/responses", "/mock-api");
    });
    afterEach((done)=>{
        mockServerApi.reset().then(()=>{
            done();
        }).catch( err=> {
            done();
            assert(false,"error  resetting mock server " + err);
        });
    });

    it("Test basic request to mocked endpoint", ()=>{

        var expectedResponse = { testingNumber : 1, testingString : "test", nested : { variable : "var"}};
        var testRequest = {testRequestVar : "var1"};

        var request = mockServerApi.mockApiRequest();
        return request
            .path("/testing/1")
            .status(200)
            .method("POST")
            .body(expectedResponse)
            .execute()
            .then( info => {
                return http.doPost(info.url,testRequest).then( response => {
                    expect(expectedResponse).to.deep.equal(response.data);
                });
            });
    });


    it("Test multiple requests to one mocked endpoint", ()=>{

        //two responses
        var expectedResponse = { testingNumber : 1, testingString : "test", nested : { variable : "var"}};
        var expectedResponse2 = { testingNumber : 2, testingString : "test2", nested : { variable : "var2"}};
        var testRequest = {testRequestVar : "var 1"};
        var first = mockServerApi.mockApiRequest();
        var second = mockServerApi.mockApiRequest();

        //add the responses to the mock server
        return Promise.all([
            first.path("/testing/1").status(200).method("POST").body(expectedResponse).execute(),
            second.path("/testing/1").status(200).method("POST").body(expectedResponse2).execute(),
            ])
            .then( infos => {
                //call the mocked api endpoints 3 times expecting 2 different responses (first, second, second)
                return Promise.all([
                    http.doPost(infos[0].url,testRequest).then( response => {
                        expect(expectedResponse).to.deep.equal(response.data);
                    }),
                    http.doPost(infos[1].url,testRequest).then( response => {
                        expect(expectedResponse2).to.deep.equal(response.data);
                    }),
                    http.doPost(infos[1].url,testRequest).then( response => {
                        expect(expectedResponse2).to.deep.equal(response.data);
                    })
                ]);
            }).then( test => {
                //verify the requests that where made to the mock api (mapped by responses)
                return mockServerApi.getResponses().then(res => {
                    var responses = res.data;
                    expect(responses.length).to.equal(2);
                    expect(responses[0].requests.length).to.equal(1);
                    expect(responses[0].requests[0].requestIndex).to.equal(0);
                    expect(responses[1].requests.length).to.equal(2);
                    expect(responses[1].requests[0].requestIndex).to.equal(1);
                    expect(responses[1].requests[1].requestIndex).to.equal(2);
                })
            }).then( t => {
                return mockServerApi.getResponses("/testing/1", "POST", 200).then(responses => {
                    expect(responses.data.length).to.equal(2);
                })
            });
    });


    it("Test multiple requests to multiple mocked endpoints", ()=>{

        //two responses
        var expectedResponse = { testingNumber : 1, testingString : "test", nested : { variable : "var"}};
        var expectedResponse2 = { testingNumber : 2, testingString : "test2", nested : { variable : "var2"}};
        var testRequest = {testRequestVar : "var 1"};
        var testRequest2 = {testRequestVar : "var 2"};
        var first = mockServerApi.mockApiRequest();
        var second = mockServerApi.mockApiRequest();

        //add the responses to the mock server
        return Promise.all([
            first.path("/testing/1").status(200).method("POST").body(expectedResponse).execute(),
            second.path("/another/1").status(200).method("POST").body(expectedResponse2).execute(),
        ])
            .then( infos => {
                //call the mocked api endpoints 3 times expecting 2 different responses (first, second, second)
                return Promise.all([
                    http.doPost(infos[0].url,testRequest).then( response => {
                        expect(expectedResponse).to.deep.equal(response.data);
                    }),
                    http.doPost(infos[1].url,testRequest2).then( response => {
                        expect(expectedResponse2).to.deep.equal(response.data);
                    })
                ]);
            }).then( test => {
                //verify the requests that where made to the mock api (mapped by responses)
                return mockServerApi.getResponses().then(res => {
                    var responses = res.data;
                    expect(responses.length).to.equal(2);
                    expect(responses[0].requests.length).to.equal(1);
                    expect(responses[0].requests[0].requestIndex).to.equal(0);
                    expect(responses[0].requests[0].body).to.deep.equal(testRequest);
                    expect(responses[1].requests.length).to.equal(1);
                    expect(responses[1].requests[0].requestIndex).to.equal(1);
                    expect(responses[1].requests[0].body).to.deep.equal(testRequest2);
                })
            }).then( t => {
                return mockServerApi.getResponses("/another/1", "POST", 200).then(responses => {
                    expect(responses.data.length).to.equal(1);
                })
            });
    });

    it("Test http status 500 request to mocked endpoint", ()=>{

        var testRequest = {testRequestVar : "var 1"};
        var first = mockServerApi.mockApiRequest();

        //add the responses to the mock server
        return first.path("/testing/1").status(500).method("POST").execute()
            .then( info => {
                //call the mocked api expecting 500 http status
                return new Promise((resolve,reject)=>{
                    http.doPost(info.url,testRequest).then( response => {
                        reject("Server should have return 500");
                    }).catch(err => {
                        resolve();
                    })
                });
            }).then( test => {
                //verify the requests that where made to the mock api (mapped by responses)
                return mockServerApi.getResponses().then(res => {
                    var responses = res.data;
                    expect(responses.length).to.equal(1);
                    expect(responses[0].requests.length).to.equal(1);
                    expect(responses[0].requests[0].body).to.deep.equal(testRequest);
                    expect(responses[0].requests[0].requestIndex).to.equal(0);
                })
            });
    });
});