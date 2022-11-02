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
class ApiMessage {
    constructor ( statusCode, messageTitle, messageBody ) {
        this.statusCode = statusCode;
        this.messageTitle = messageTitle;
        this.messageBody = messageBody;
    }
}

exports.createApiMessage = ( statusCode, messageTitle, messageBody ) => {
    return new ApiMessage( statusCode, messageTitle, messageBody );
};