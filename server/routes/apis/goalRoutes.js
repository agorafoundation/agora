/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

//dependencies 
 
// controllers
const goalController = require( '../../controller/apis/goalController' );


// should this just be an API call (not a page route) (or make one?? )
router.route( '/goal' )
    .get(async function (req, res) {
        goalController.getAllGoals( req, res );
    
    })    
    .post( ( req, res ) => { 
        goalController.saveGoal( req, res );
    }
)

module.exports = router;