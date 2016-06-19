import {mockRequest} from "./TestServerUtils";


describe("Basic Request/Response Test",()=>{

    var testCall;

    beforeEach((done)=>{
        var mockApiPath = "/mock-api";
        mockRequest("http://localhost:8999","/responses", mockApiPath)
            .path("/testing/1")
            .status(200)
            .method("POST")
            .body({ testingNumber : 1, testingString : "test", nested : { variable : "var"}})
            .execute()
            .then( apiCall => {
                testCall = apiCall;
                done();
            }).catch(err=>{
                console.log("ERROR =" , err);
                done();
        });

    });


    it("Test basic request to mocked endpoint", (done)=>{
        if(testCall) {
            console.log("TEST CALL = ", testCall);
            testCall().then( response => {
                console.log("TEST CALL RESPONSE = ", response);
                done();
            }).catch(err => {
                console.log("ERR = ", err);
                done();
            });
        }

    });
});