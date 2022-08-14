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
 * Retrieves all available tags
 * @param {HTTP request} req 
 * @param {HTTP respons} res 
 */
 exports.getAllTags = async function ( req, res ) {
    // get all the active tags

    let tags = await tagService.getAllTags( req.query.limit, req.query.offset );

    if( tags.length > 0 ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all tags" );
        res.status( 200 ).json( tags );
    }
    else {
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "No tags were found meeting the query criteria" );
        res.status( 404 ).send( "No Tags Found" );
    }
}

exports.getTagById = async function( req, res ) {
    let tag = await tagService.getTagById( req.params.id );

    if( tag ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned tag" );
        res.status( 200 ).json( tag );
    }
    else {
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "No tags were found meeting the query criteria" );
        res.status( 404 ).send( "No Tags Found" );
    }
}

exports.deleteTagById = async ( req, res ) => {
    let success = await tagService.deleteTagById( req.params.id );

    if( success ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned tag" );
        res.status( 200 ).json( "Success" );
    }
    else {
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "No tags were found meeting the query criteria" );
        res.status( 404 ).send( "No Tags Found" );
    }
}



exports.saveTag = async function( req, res, redirect ) {
    let tag = Tag.emptyTag();
    tag.id = req.body.tagId;

    // see if this is a modification of an existing tag
    let existingTag = await tagService.getTagById( tag.id );
    let exsitingTagName;

    // if this is an update replace the tag with teh existing one as the starting point
    if (existingTag) {
        tag = existingTag;
    }
    else {
        // check to see if there is an existing tag with the same name since we do not want dups
        existingTagName = await tagService.getTagByTagName( req.body.tag );
        tag = (existingTagName) ? existingTagName : tag;
    }

    // add changes from the body if they are passed
    tag.tag = req.body.tag;

    tag.lastUsed = Date.now();

    // get the tag name
    tag.tag = req.body.tag;
    
    // get the owner used the passed data if present otherwise check for the API user or 
    // the user session
    if( req.body.ownedBy ) {
        tag.ownedBy = req.body.ownedBy;
    }
    else if( req && req.user ) {
        tag.ownedBy = req.user.id;
    }
    else if ( req && req.session && req.session.authUser) {
        tag.ownedBy = req.session.authUser.id;
    }

    // save the tag
    if( existingTagName ) {
        tag = await tagService.saveTag( tag, true );
    }
    else {
        tag = await tagService.saveTag( tag );
    }

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
        return tag;
    }
    else {
        if( existingTag ) {
            res.setHeader( 'Content-Type', 'application/json' );
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Updated Tag for Id provided" );
            res.status(200).send(JSON.stringify(tag));
        }
        else if ( existingTagName ) {
            res.setHeader( 'Content-Type', 'application/json' );
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Updated existing Tag by Tag name" );
            res.status(200).send(JSON.stringify(tag));
        }
        else {
            res.setHeader( 'Content-Type', 'application/json' );
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Created new tag" );
            res.status(201).send(JSON.stringify(tag));
        }
    }
}