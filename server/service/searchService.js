/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const db = require( "../db/connection" );
const resource = require( "../model/resource" );
const user = require( "../model/user" );
const goal = require( "../model/goal" );
const topic = require( "../model/topic" );
const { ormSearchResult } = require( "../model/searchresult" );

exports.getSearchResults = async ( term, userId ) => {

    // probably do some checks here so only certain queries are run

    const [ users, resources, topics, goals ] = await Promise.all( [
        this.getUsersByTerm( term, userId ),
        this.getResourcesByTerm( term, userId ),
        this.getTopicsByTerm( term, userId ),
        this.getWorkspaceByTerm( term, userId )
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
    //Wanted to add some comments here so that for the next people working on this, 
    // if they aren't familiar this will hopefully help
    
    // This query gets all the topics by searching for the term(which is $1), and the two percents are wildcard operators
    //Essentially, in both the name and description it will look for a term that matches
    //In the future, this will need to be replaced. It's going to run slow if Agora becomes large,
    //And it may be more viable to move over to a pre-made federated search option with a built-in algorithim.
    const text = `
        SELECT *
        FROM topics 
        WHERE topic_name ILIKE '%' || $1 || '%' 
        OR topic_description ILIKE '%' || $1 || '%'
        AND owned_by = $2
    `;

    // Just gets the userId and term to place into the query
    const values = [ term, userId ];

    //Try catch, the error at the end will just return false. Might need to be updated to a proper error later.
    try {
        
        // Res is the database response, which will come back as an QueryResultArray
        let res = await db.query( text, values );

        // Just checks to see if there were any matching results. May need to change
        if( res.rows.length === 0 ) {
            return false;
        }

        //Creates an array of the topics using the topic model in ../model/topics.js
        const topics = res.rows.map( topic.ormTopic );

        // Returns the array
        return topics;

    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};


exports.getWorkspaceByTerm = async ( term, userId ) => {
    const text = `
        SELECT *
        FROM goals 
        WHERE goal_name ILIKE '%' || $1 || '%' 
        OR goal_description ILIKE '%' || $1 || '%'
        AND owned_by = $2
    `;
    const values = [ term, userId ];

    try {
        
        let res = await db.query( text, values );

        if( res.rows.length === 0 ) {
            return false;
        }

        const workspaces = res.rows.map( goal.ormGoal );

        return workspaces;

    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};