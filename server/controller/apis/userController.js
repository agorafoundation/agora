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


exports.getUserByEmail = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html' );
    var email = req.params.email;

    userService.getUserByEmail( email ).then( ( user ) => {

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
