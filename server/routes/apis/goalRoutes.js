/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

//dependencies 
 
// controllers
const goalController = require( '../../controller/apis/goalController' );


// goals /api/v1/auth/goals
router.route( '/' )
    .get(async function (req, res) {
        goalController.getAllActiveGoals( req, res );
    })    
    .post( ( req, res ) => { 
        goalController.saveGoal( req, res );
    }
)

// goals /api/v1/auth/goals
router.route( '/:id' )
    .get(async function (req, res) {
        goalController.getGoalById( req, res );
    
    }
);

// goals associated with the authorized (logged in) user /api/v1/auth/goals/authUser
// router.route( '/authUser' )
//     .get(async function (req, res) {
//         goalController.getAllGoalsForAuthUser( req, res );
    
//     }
// );

module.exports = router;