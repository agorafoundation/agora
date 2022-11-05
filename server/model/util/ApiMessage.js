/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


/**
 * Wrapper for Agora API responses. Payload contains data to be transported, message and error provide unified 
 * mechanism for communnication with UI or API client.
 */
class ApiMessage{
    constructor ( statusCode, messageTitle, messageBody ) {
        this.statusCode = statusCode;
        this.messageTitle = messageTitle;
        this.messageBody = messageBody;
    }
}

exports.createApiMessage = ( statusCode, messageTitle, messageBody ) => {
    return new ApiMessage( statusCode, messageTitle, messageBody );
};



exports.createNotFoundError = ( resourceName ) => {
    const message = new ApiMessage( 404, "Not Found", `${resourceName} not found` );
    return message;
};

exports.createBadRequestError = ( messageText ) => {
    // The reason why this requires a message pass is because bad request can honestly be anything, so I've left it up to the devs. This can be changed if need be.
    const message = new ApiMessage( 400, "Bad Request", `${messageText}` );
    return message;
};

exports.createNotAuthorizedError = ( resourceName ) => {
    const message = new ApiMessage( 401, "Not Authorized", `You are not authorized to access ${resourceName}` );
    return message;
};

exports.create422Error = ( errorTitle, resourceName, messageBody ) => {
    // This one is again a little more complicated, as we are using it to cover a variety of errors. I've left the title and text up to the developers, so as to not hamper their descriptions and their ability to troubleshoot
    const message = new ApiMessage( 422, `${errorTitle}`, `${resourceName} ${messageBody}` );
    return message;
};

exports.createInternalServerError = ( resourceName ) => {
    const message = new ApiMessage( 500, "Internal Server Error", `Internal server error handling ${resourceName}` );
    return message;
};


exports.create200Response = ( resourceName, messageBody ) => {
    //Threw this one in to help with returning 200s, as I feel it'll just make things easier. Same as before, we use it for multiple different setups, so passing the body is needed.
    const message = new ApiMessage( 200, "Success", `${resourceName} ${messageBody}` );
    return message;
};

exports.create201Response = ( resourceName, messageBody ) => {
    //The exact same as 200, but I saw someone used 201 in tags for a successful response so I felt I should cover it.
    const message = new ApiMessage( 201, "Success", `${resourceName} ${messageBody}` );
    return message;
};