/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const express = require( 'express' );
const router = express.Router( );
   
// import controllers
const sharedController = require( '../../controller/apis/sharedEntityController' );

router.route( '/' ) 
    .post( ( req, res ) => { 
        sharedController.saveSharedEntity( req, res );
    }
    );

router.route( '/copy' ) 
    .post( ( req, res ) => { 
        sharedController.saveCopiedEntity( req, res );
    }
    );

router.route( '/shareworkspace' )
    .post( ( req, res ) => {
        sharedController.sharedWorkspace ( req, res );
    } 
    );

router.route( '/shared-entity/:entityId' )
    .get( ( req, res ) => {
        sharedController.getAllSharedUsersByWorkspaceId( req, res );    
    }   
    );

router.route( '/getPermission/:entityId' )
    .get( ( req, res ) => {
        sharedController.getPermission( req, res );
    } );
 
router.route( '/updatePermission' )
    .post( ( req, res ) => {
        sharedController.updatePermission ( req, res );
    } );

router.route( '/removeShare' )
    .delete( ( req, res ) => {
        sharedController.removeSharedUserById( req, res );
    } );

module.exports = router;
