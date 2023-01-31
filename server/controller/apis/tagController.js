/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
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
};

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
};

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
};


/**
 * Manages saving new Tags while ensuring that the tag itself is unique. Tag names will be 
 * checked against existing data and if match is found the tag will just have the lastUsed
 * time updated. If owner is provided it will be saved / updaded otherwise the authenticated
 * user is saveded as the owner.
 * @param {HTTP request} req 
 * @param {HTTP response} res 
 * @param {boolean} redirect - false / null responds direct to client, true to calling function
 * @returns 
 */
exports.saveTag = async function( req, res, redirect ) {
    let tag = Tag.emptyTag();

    // check to see if there is an existing tag with the same name since we do not want dups
    let existingTagName = await tagService.getTagByTagName( req.body.tag );
    tag = ( existingTagName ) ? existingTagName : tag;
    
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
        tag.ownedBy = req.user.userId;
    }
    else if ( req && req.session && req.session.authUser ) {
        tag.ownedBy = req.session.authUser.userId;
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
        if ( existingTagName ) {
            res.setHeader( 'Content-Type', 'application/json' );
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Updated existing Tag by Tag name" );
            res.status( 200 ).send( JSON.stringify( tag ) );
        }
        else {
            res.setHeader( 'Content-Type', 'application/json' );
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Created new tag" );
            res.status( 201 ).send( JSON.stringify( tag ) );
        }
    }
};


exports.getTaggedEntity = async function( req, res ) {
    let tags = [];

    if( req.params.entityType && req.params.entityId ) {
        tags = await tagService.getTaggedEntity( req.params.entityType, req.params.entityId );
    }

    if( tags.length > 0 ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all tags associated with requested entity" );
        res.status( 200 ).json( tags );
    }
    else {
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "No tags were found meeting the query criteria" );
        res.status( 404 ).send( "No Tags Found" );
    }
};


/**
 * Save or update a tag association with a entity and user.
 * @param {HTTP Request} req 
 * @param {HTTP Response} res 
 * @param {boolean} redirect 
 * @returns Tagged object
 */
exports.tagged = async ( req, res, redirect ) => {
    let tagged = Tagged.emptyTagged();

    // check to see if there is an existing tag with the same name since we do not want dups
    let existingTag = await tagService.getTagByTagName( req.body.tag );

    // parse the tag from the tagged object property
    let tag = Tag.emptyTag();

    // check to see if there is an existing tag with the same name since we do not want dups
    let existingTagName = await tagService.getTagByTagName( req.body.tag.tag );
    tag = ( existingTagName ) ? existingTagName : tag;
    
    // get the tag name
    tag.tag = req.body.tag.tag;

    tag.lastUsed = Date.now();
    
    // get the owner used the passed data if present otherwise check for the API user or 
    // the user session
    if( req.body.tag.ownedBy ) {
        tag.ownedBy = req.body.tag.ownedBy;
    }
    else if( req && req.user ) {
        tag.ownedBy = req.user.userId;
    }
    else if ( req && req.session && req.session.authUser ) {
        tag.ownedBy = req.session.authUser.userId;
    }

    // save the tag
    if( existingTagName ) {
        tag = await tagService.saveTag( tag, true );
    }
    else {
        tag = await tagService.saveTag( tag );
    }
    
    // verify we have all required data (enitity type / id, user id)
    if( req.body.entityType && req.body.entityId ) {
        // create the tag association from the submitted data
        tagged.tag = tag;
        tagged.entityType = req.body.entityType;
        tagged.entityId = req.body.entityId;
        if( req.body.userId ) {
            tagged.userId = req.body.userId;
        }
        else if( req && req.user ) {
            tagged.userId = req.user.userId;
        }
        else if ( req && req.session && req.session.authUser ) {
            tagged.userId = req.session.authUser.userId;
        }
        tagged.active = req.body.active;

        // save the tag association 
        tagged = await tagService.saveTagged( tagged );
    } 

    if( tagged ) {
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
        if ( existingTag ) {
            res.setHeader( 'Content-Type', 'application/json' );
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Updated existing Tag by Tag name" );
            res.status( 200 ).send( JSON.stringify( tag ) );
        }
        else {
            res.setHeader( 'Content-Type', 'application/json' );
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Created new tag" );
            res.status( 201 ).send( JSON.stringify( tag ) );
        }
    }
};

exports.deleteTagged = async function( req, res ) {
    let success = false;
    if( req.params.tagName && req.params.entityType && req.params.entityId ) {
        let tag = await tagService.getTagByTagName( req.params.tagName );
        let userId = -1;
        if( req && req.user ) {
            userId = req.user.userId;
        }
        else if ( req && req.session && req.session.authUser ) {
            userId = req.session.authUser.userId;
        }
        success = await tagService.deleteTagged( tag.tagId, req.params.entityType, req.params.entityId, userId );

    }

    if( success ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Tag association deleted" );
        res.status( 200 ).send( "Tag association deleted" );
    }
    else {
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "No tags were found meeting the query criteria" );
        res.status( 404 ).send( "No Tags Found" );
    }
};
