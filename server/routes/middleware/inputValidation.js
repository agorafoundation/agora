const z = require( 'zod' );
const { errorController } = require( '../../controller/apis/apiErrorController' );
const ApiMessage = require( '../../model/util/ApiMessage' );

exports.validate = ( schema ) => {
    return ( req, res, next ) => {

        const { error, data } = schema.safeParse( req.body );
        
        if ( !error ) {
            req.body = data;
            return next();
        }

        // There is an error

        errorController( ApiMessage.createBadRequestError( error.issues ), res );
    };
};