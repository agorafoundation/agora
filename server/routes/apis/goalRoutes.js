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
const { get } = require('./tagRoutes');


// goals /api/v1/auth/goals
router.route( '/' )
    // get all visible goals
    .get( async ( req, res ) => {
        goalController.getAllVisibleGoals( req, res );
    })    
    // save a new goal
    .post( async ( req, res ) => { 
        goalController.saveGoal( req, res );
    }
)

// goals /api/v1/auth/goals
router.route( '/:id' )
    // get a visible goal by id
    .get( async (req, res) => {
        goalController.getGoalById( req, res );
    
    })
    // update a visible goal by id
    .patch( async ( req, res ) => {

    })
    // delete a visible goal by id
    .delete( async (req, res ) => {

    }
);

// enrollment management
router.route( '/enroll/:userId/:goalId' )
    // enroll an eligible user in a visibile goal
    .post( async ( req, res ) => {

    })
    // remove a users en
    .delete( async ( req, res ) => {

    }
);



module.exports = router;