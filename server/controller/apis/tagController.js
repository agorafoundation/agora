/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// import services
const tagService = require( '../../service/tagService' );

// import models
const Tag = require( '../../model/tag' );
const Tagged = require( '../../model/tagged' );


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
 exports.getAllTags = async function ( req, res ) {
    // get all the active tags
    let tags = await tagService.getAllTags();
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all tags" );
    res.status( 200 ).json( tags );
}





exports.saveTag = async function( req, res, redirect ) {

    let tag = Tag.emptyTag();
    tag.id = req.body.tagId;

    // see if this is a modification of an existing tag
    let existingTag = await tagService.getTagById( tag.id );

    // if this is an update replace the tag with teh existing one as the starting point
    (existingTag) ? tag = existingTag : null;

    // add changes from the body if they are passed
    tag.tag = req.body.tag;
    tag.lastUsed = Date.now();
    
    (req.session && req.session.authUser) ? tag.ownedBy = req.session.authUser.id : tag.ownedBy = req.body.ownedBy; 

    // save the tag
    tag = await tagService.saveTag( tag );

    if( tag ) {
        req.session.messageType = "success";
        req.session.messageTitle = "Tag Saved";
        req.session.messageBody = "Tag " + tag.tagName + " saved successfully!";
    }
    else {
        req.session.messageType = "error";
        req.session.messageTitle = "Error saving Tag <br />";
        req.session.messageBody = "There was a problem saving the tag. <br />";
    }

    if( redirect ) {
        console.log( "tagController.saveTag() - END - Redirect ");
        return tag;
    }
    else {
        console.log( "tagController.saveTag() - END - Non-Redirect ");
        res.setHeader( 'Content-Type', 'application/json' );
        res.status(200).send(JSON.stringify(tag));
    }
    
}