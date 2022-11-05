const z = require('zod');
const ApiMessage = require('../../model/util/ApiMessage');

exports.validate = ( schema ) => {
    return ( req, res, next ) => {

        const { error, data } = schema.safeParse(req.body);
        
        if (!error) {
            req.body = data;
            return next();
        }

        // There is an error

        //TODO: throw an error for the error handler to catch
        res.status(400).json({
            issues: error.issues.map(issue => {

                // Possible codes: https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md#zodissuecode
                if (issue.code === "invalid_type") {
                    // also handles when not provided
                    return `Invalid type for ${issue.path.join('.')}, expected ${issue.expected} but got ${issue.received}`
                } else if (issue.code === "invalid_enum_value") {
                    // doesn't match given options
                    return `Invalid enum value for ${issue.path.join('.')}`
                } else if (issue.code === "invalid_string") {
                    // when the string is not matching a given format, url, email, uuid, etc.
                    return `Invalid string format for ${issue.path.join('.')}, does not match ${issue.validation}`
                } else if (issue.code === "invalid_date") {
                    // invalid date format
                    return `Invalid date for ${issue.path.join('.')}`
                } else if(issue.code === "too_small") {
                    return `Value for ${issue.path.join('.')} is too small, expected at least ${issue.minimum}`
                } else if(issue.code === "too_big") {
                    return `Value for ${issue.path.join('.')} is too big, expected at most ${issue.maximum}`
                } else {
                    return `Unhandled issue: ${JSON.stringify(issue)}`
                }
            })
        })

        
        
    }
}