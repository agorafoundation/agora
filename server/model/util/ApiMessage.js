/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
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

/**
 * NOT MEANT TO BE EXTERNALLY CALLED, INSTEAD USE OTHER METHODS IN THIS FILE
 * 
 * This is a wrapper for the ApiMessage class. 
 * It is used to create an ApiError response object, this mostly should not be called externally, 
 * if you are trying to call this externally please use a pre-specified API error format or create your own in this file.
 * 
 * @param {number} statusCode 
 * @param {string} messageTitle 
 * @param {string} messageBody 
 * @returns Agora's API Error response
 */
exports.createApiMessage = ( statusCode, messageTitle, messageBody ) => {
    return new ApiMessage( statusCode, messageTitle, messageBody );
};

/**
 * Creates a Bad Request error to be provided to ApiErrorController.errorHandler
 * @param {*} validationIssues Zod validation issues or string values in an array
 * @returns a 400 error
 */
exports.createBadRequestError = ( validationIssues ) => {

    const outputMessage = validationIssues
        .map( issue => {

            // if no issue code is provided, we assume it is just a string and return it
            if( !issue.code ) {
                return issue;
            }

            // Handle all of the known validation error codes
            // Possible codes: https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md#zodissuecode
            
            if ( issue.code === "invalid_type" ) {
                // also handles when not provided
                return `Invalid type for ${issue.path.join( '.' )}, expected ${issue.expected} but got ${issue.received}`;
            }
            // doesn't match given options
            if ( issue.code === "invalid_enum_value" ) {
                return `Invalid enum value for ${issue.path.join( '.' )}`;
            }
            // when the string is not matching a given format, url, email, uuid, etc.
            if ( issue.code === "invalid_string" ) {
                return `Invalid string format for ${issue.path.join( '.' )}, does not match ${issue.validation}`;
            }
            if ( issue.code === "invalid_date" ) {
                // invalid date format
                return `Invalid date for ${issue.path.join( '.' )}`;
            }
            if( issue.code === "too_small" ) {
                return `Value for ${issue.path.join( '.' )} is too small, expected at least ${issue.minimum}`;
            }
            if( issue.code === "too_big" ) {
                return `Value for ${issue.path.join( '.' )} is too big, expected at most ${issue.maximum}`;
            }
            return `Unhandled issue: ${JSON.stringify( issue )}`;
            
        } )
        .join( "; " );

    return new ApiMessage( 400, "Bad Request", outputMessage );
};

/**
 * Creates a Not Authorized error to be provided to ApiErrorController.errorHandler
 * @returns a 401 error
 */
exports.createNotAuthorizedError = ( ) => {
    return new ApiMessage( 401, "Not Authorized", `Not able to associate authorized user with the record` );
};

/**
 * Creates a Not Found error to be provided to ApiErrorController.errorHandler
 * @param {string} resourceName name of the resources that was not found, 
 * @returns a 404 error
 */
exports.createNotFoundError = ( resourceName ) => {
    return new ApiMessage( 404, "Not Found", `${resourceName} not found` );
};

/**
 * Creates a Image Upload error to be provided to ApiErrorController.errorHandler
 * @param {string} resourceName 
 * @returns a 422 error
 */
exports.createImageUploadError = ( resourceName ) => {
    // This one is again a little more complicated, as we are using it to cover a variety of errors. I've left the title and text up to the developers, so as to not hamper their descriptions and their ability to troubleshoot
    return new ApiMessage( 422, "Error uploading image!", `There was a error uploading your image for this ${resourceName.toLowerCase()}. Your ${resourceName.toLowerCase()} should be saved without the image.` );
};

/**
 * To be called when all else fails, this is a catch all for errors that are not handled by the other methods in this file.
 * 
 * @returns a 500 error
 */
exports.createInternalServerError = ( ) => {
    return new ApiMessage( 500, "Internal Server Error", `Something went wrong :(` );
};