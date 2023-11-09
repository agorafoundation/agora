/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router();


//import controllers
const notificationController = require ( '../../controller/notificationController');


router.route( '/getNotifications' )
    //get all notifications
    .get( async ( req, res ) => {
        notificationController.getNotifications( req, res );
    } ); 

router.route( '/deleteNotification' )
    //deletes notification
    .delete( async ( req, res ) => {
        notificationController.deleteNotification( req, res );
    } );

router.route( '/addNotification' )
    //get all notifications
    .post( async ( req, res ) => {
        notificationController.addNotification( req, res );
    } );
    
module.exports = router;