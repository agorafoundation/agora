/**
 * An error controller for the API.
 * 
 * @param { ApiMessage } error an error object from the ApiMessage class to be handled
 * @param { Express.Response } res the express response object
 * @returns the request with a status code and a error object
 */
exports.errorController = ( error, res ) => {

    if( res ) {
        res.set( "x-agora-message-title", error.messageTitle );
        res.set( "x-agora-message-detail", error.messageBody );

        return res.status( error.statusCode ).json( error );
    }

    return error;
};