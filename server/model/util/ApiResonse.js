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
class ApiResponse {
    constructor ( payload, messageTitle, messageBody, errorTitle, errorBody ) {
        this.payload = payload;
        this.messageTitle = messageTitle;
        this.messageBody = messageBody;
        this.errorTitle = errorTitle;
        this.errorBody = errorBody;
    }
}

exports.createApiResponse = ( payload, messageTitle, messageBody, errorTitle, errorBody ) => {
    return new ApiResponse( payload, messageTitle, messageBody, errorTitle, errorBody );
}