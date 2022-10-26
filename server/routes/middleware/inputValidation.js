const z = require('zod');

exports.validate = ( schema ) => {
    return ( req, res, next ) => {
        console.log(req.body)

        const { error, data } = schema.safeParse(req.body);
        if (error) {
            res.status(400).json({ error: error });
        } else {
            req.body = data;
            next();
        }
    }
}


