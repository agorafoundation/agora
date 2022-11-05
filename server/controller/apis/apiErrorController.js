


exports.handleApiError = ( error, res ) => {

    res.set( "x-agora-message-title", error.messageTitle );
    res.set( "x-agora-message-detail", error.messageBody );
    return res.status( error.statusCode ).json( error );
};