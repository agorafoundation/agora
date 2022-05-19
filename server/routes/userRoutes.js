/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const express = require( 'express' );
const router = express.Router( );


// const bodyParser = require('body-parser');
// router.use(bodyParser.urlencoded({
//     extended: true
//   }));
// router.use(bodyParser.json());

// controllers
const userController = require( '../controller/userController');


router.route( '/' )
    .patch( async function( req, res ) {
        userController.updateUser( req, res );
    })

    .post( async function( req, res ) {
        userController.createUser( req, res );
        
    }
);

// verify email existence
router.route( '/revalidate/:email' )
    .get(async function(req, res) {
        userController.reValidateEmail( req, res );
    }
);

router.route( '/uploadProfilePicture' )
    .post( ( req, res ) => {
        userController.uploadProfileImage( req, res );
    }
)



module.exports = router;