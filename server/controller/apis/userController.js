/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// import services
const userService = require( '../../service/userService' );

// import models
const User = require( '../../model/user' );

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );


exports.getUserByEmail = async function( req, res ) {
    let user = await userService.getUserByEmail( req.params.email )
    if ( user ) {
        console.log(user);
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned user by email" );
        res.status( 200 ).json( user );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "User not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "User not found" );
        res.status( 404 ).json( message );
    }
};

exports.getUserByUsername = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html' );
    var username = req.params.username;

    userService.getUserByUsername( username ).then( ( user ) => {

        res.setHeader( 'Content-Type', 'application/json' );
        res.send( user );
    } );
};

exports.getActiveUserById = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html' );
    var userId = req.params.userId;

    userService.getActiveUserById( userId ).then( ( user ) => {

        res.setHeader( 'Content-Type', 'application/json' );
        res.send( user );
    } );
};

exports.verifyUsername = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html' );
    var username = req.params.username;
    userService.verifyUsername( username ).then( ( valid ) => {

        res.setHeader( 'Content-Type', 'application/json' );
        res.send( valid );
    } );
};

exports.verifyEmail = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html' );
    var email = req.params.email;
    userService.verifyEmail( email ).then( ( valid ) => {

        res.setHeader( 'Content-Type', 'application/json' );
        res.send( valid );
    } );
};
