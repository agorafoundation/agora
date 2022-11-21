/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const db = require( "../db/connection" );
const resource = require( "../model/resource" );
const user = require( "../model/user" );
const { ormSearchResult } = require( "../model/searchresult" );

exports.getSearchResults = async ( term, userId ) => {

    // probably do some checks here so only certain queries are run

    const [ users, resources, topics, goals ] = await Promise.all( [
        this.getUsersByTerm( term, userId ),
        this.getResourcesByTerm( term, userId ),
        // this.getTopicsByTerm( term, userId ),
        // this.getWorkspaceByTerm( term, userId )
    ] );

    console.log( users, resources, topics, goals );
    console.log( term );

    // do some stuff with the results
    // transform to search object
    // maybe provide a search latency stat
    // maybe order the searches by some type of relevance

    return {search: term, users, resources};
};

exports.getUsersByTerm = async ( term, userId ) => {
    //db query
    const text = `
        SELECT id,username,first_name,last_name 
        FROM users
        WHERE username ILIKE '%' || $1 || '%'
        OR first_name ILIKE '%' || $1 || '%'
        OR last_name ILIKE '%' || $1 || '%'
        ORDER BY username ASC
    `;

    const values = [ term ];

    try {
            
        let res = await db.query( text, values );

        const users = res.rows.map( user.ormUser );

        return users;

    }
    catch ( e ) {
        console.log( e );
        return null;
    }
};

exports.getResourcesByTerm = async ( term, userId ) => {
    const text = `
        SELECT *
        FROM resources
        WHERE resource_name ILIKE '%' || $1 || '%'
        OR resource_description ILIKE '%' || $1 || '%'
        OR resource_content_html ILIKE '%' || $1 || '%'
        AND owned_by = $2
    `;

    const values = [ term, userId ];

    try {
            
        let res = await db.query( text, values );

        const resources = res.rows.map( resource.ormResource );

        return resources;

    }
    catch ( e ) {
        console.log( e );
        return null;
    }
};

exports.getTopicsByTerm = async ( term, userId ) => {
    const text = `
        SELECT topic_name, topic_id, topic_description
        FROM topics 
        WHERE topic_name ILIKE '%' || $1 || '%' 
        OR topic_description ILIKE '%' || $1 || '%'
        AND owned_by = $2
    `;
    const values = [ userId ];

    try {
        
        let res = await db.query( text, values );

        if( res.rows.length === 0 ) {
            return false;
        }

        let results = [];

        res.forEach( element => {
            element = ormSearchResult( res.rows[0] );
            results.push( element );
        } );
        

        return results;

    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};


exports.getWorkspaceByTerm = async ( term, userId ) => {
    const text = `
        SELECT goal_name, goal_id, goal_description 
        FROM goals 
        WHERE goal_name ILIKE '%' || $1 || '%' 
        OR goal_description ILIKE '%' || $1 || '%'
        AND owned_by = $2
    `;
    const values = [ userId ];

    try {
        
        let res = await db.query( text, values );

        if( res.rows.length === 0 ) {
            return false;
        }

        let results = [];

        res.forEach( element => {
            element = ormSearchResult( res.rows[0] );
            results.push( element );
        } );
        

        return results;

    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};