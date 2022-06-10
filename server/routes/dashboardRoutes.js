/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());


// import multer (file upload) and setup


// set up file paths for user profile images
let UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../client' );
let FRONT_END = process.env.FRONT_END_NAME;
let GOAL_PATH = process.env.GOAL_IMAGE_PATH;

const goalUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + GOAL_PATH;
//

// set the max image size for avatars and resource, topic and goal icons
let maxSize = 1 * 1024 * 1024;

// bring in busboy for multipart/form-data routes
//const busboy = require('busboy');

const fileUpload = require("express-fileupload");
router.use(
    fileUpload()
);


// // Start multer
// let multer = require( 'multer' );
// const { toUnicode } = require('punycode');

// const fileFilter = ( req, file, cb ) => {
//     if( file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' ) {
//         cb( null, true );
//     }
//     else {
//         cb( null, false );
//     }
// }

// let storage = multer.diskStorage({
//     destination: function ( req, file, cb ) {
//       cb( null, UPLOAD_PATH_BASE + "/" + FRONT_END + IMAGE_PATH )
//     },
//     filename: function ( req, file, cb ) {
//         let filename = Date.now( ) + file.originalname;
        
//         req.session.savedGoalFileName = filename;
//         console.log("the filename is ----  " + req.session.savedGoalFileName);

//         cb( null, filename );
//     }
// })
// // used multipart as the name for multer decode because it is being used for enctype="multipart/form-data" both for the form body and the uploaded image.
// // this is because body-parser does not handle multipart/form-data.
// let multipart = multer( { storage: storage, fileFilter:fileFilter, limits: { fileSize: maxSize } } ).any( 'goalImage' );
// router.use(multipart);

// // end multer





//dependencies 
 
// controllers
const dashboardController = require( '../controller/dashboardController' );
const goalController = require( '../controller/apis/goalController' );
const { redirect } = require('express/lib/response');

// pre route
// check that the user is logged in!
router.use(function ( req, res, next ) {
    if( !req.session.authUser ) {
        if( req.query.redirect ) {
             res.locals.redirect = req.query.redirect;
        }
        res.render( 'user-signup' );
    }
    else {
        next( );
    }
     
})

/**
 * Show user profile
 */
router.route( '/' )
    .get( ( req, res ) => {
        dashboardController.getDashboard( req, res );
    }
);

/** 
 * Form enctype="multipart/form-data" route using express-fileupload for file upload
 * 
 */
router.route( '/goal' )
    .post( async ( req, res ) => {

        // save the goal
        let rGoal = await goalController.saveGoal( req, res, true );

        // reset the upload message if there is one
        if( req.session.uploadMessage ) {
            req.session.uploadMessage = undefined;
        }

        if ( !req.files || Object.keys( req.files ).length === 0 ) {
            // no files uploaded
            goalController.saveGoalImage( req, res, rGoal.rid, 'goal-default.png' );
            
        }
        else {
            // files included
            const file = req.files.goalImage;
            const timeStamp = Date.now();

            if( rGoal ) {
                file.mv(goalUploadPath + timeStamp + file.name, (err) => {
                    if (err) {
                        console.log(4);
                        console.log( "Error uploading profile picture : " + err );
                        req.session.uploadMessage = "File size was larger the 1MB, please use a smaller file."
                        res.redirect( 303, '/dashboard' );
                        return;
                    }
                    else {
                        goalController.saveGoalImage( req, res, rGoal.rid, timeStamp + file.name );
                    }
                });
            }
        }

        res.redirect(303, '/dashboard');
    }
);



// router.route( '/goal' )
//     .post( async ( req, res ) => {
//         console.log( "arrived at the /dashboard/goal post route" );
//         console.log("Start -------------------------------------------------------------------- ");
//         console.log(req.body);

//         let rGoal = await goalController.saveGoal( req, res, true);

        
//         console.log( "retuned goal: " + JSON.stringify( rGoal ) );
//         console.log("save goal complete ------------- ");
//         console.log(req.body);

//         // save the image
//         goalController.saveGoalImage( req, res, rGoal.rid );

//         console.log("save image complete ------------- ");
//         console.log(req.body);

//         console.log("END -------------------------------------------------------------------- ");

//         // reload dashboard?
//         res.redirect(303, '/dashboard');
        
        
//     }
// );

// router.route( '/goal' )
//     .post( async ( req, res ) => {
//         console.log("hele?");
//         const bb = busboy({ headers: req.headers });
//         bb.on('file', (name, file, info) => {
//         const { filename, encoding, mimeType } = info;
//         console.log(
//             `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
//             filename,
//             encoding,
//             mimeType
//         );
//         file.on('data', (data) => {
//             console.log(`File [${name}] got ${data.length} bytes`);
//         }).on('close', () => {
//             console.log(`File [${name}] done`);
//         });
//         });
//         bb.on('field', (name, val, info) => {
//         console.log(`Field [${name}]: value: %j`, val);
//         });
//         bb.on('close', () => {
//         console.log('Done parsing form!');
//         res.writeHead(303, { Connection: 'close', Location: '/' });
//         res.end();
//         });
//     }
// );





module.exports = router;