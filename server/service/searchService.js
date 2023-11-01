/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const db = require( "../db/connection" );
const resource = require( "../model/resource" );
const user = require( "../model/user" );
const workspace = require( "../model/workspace" );
const topic = require( "../model/topic" );
const searchResult = require( "../model/searchresult" );

exports.getSearchResults = async ( term, userId, type = "all" ) => {

    // probably do some checks here so only certain queries are run
    const beforeTime = Date.now();

    const searchSpace = [
        type === "all" || type === "users" ? exports.getUsersByTerm( term, userId ) : null,
        type === "all" || type === "resources" ? exports.getResourcesByTerm( term, userId ) : null,
        type === "all" || type === "topics" ? exports.getTopicsByTerm( term, userId ) : null,
        type === "all" || type === "workspaces" ? exports.getWorkspaceByTerm( term, userId ) : null
    ];

    const [ users, resources, topics, workspaces ] = await Promise.all( searchSpace );
    // at this point the results only show if they are in the type filter

    const searchResults = [];



    // transform results from users, resources, topics, workspaces into searchResult objects
    users?.forEach( element => {
        let result = searchResult.ormSearchResult( "user", element );
        searchResults.push( result ); 
    } );
    resources?.forEach( element => {
        let result = searchResult.ormSearchResult( "resource", element  );
        searchResults.push( result ); 
    } );
    workspaces?.forEach( element => {
        let result = searchResult.ormSearchResult( "workspace", element );
        searchResults.push( result );

    } );
    topics?.forEach( element => {
        let result = searchResult.ormSearchResult( "topic", element  );
        searchResults.push( result );
    } );



    
    // do some stuff with the results
    // transform to search object

    return {
        search: term, 
        timeElapsed: Date.now() - beforeTime,
        results: searchResults
        // results: [
        //     {
        //         type: "user",
        //         id: 1,
        //         main: "username",
        //         secondary: "first_name last_name",
        //     },
        //     {
        //         type: "resource",
        //         id: 1,
        //         main: "resource_name",
        //         secondary: "resource_description",
        //     },
        //     {
        //         type: "workspace",
        //         id: 1,
        //         main: "workspace_name",
        //         secondary: "workspace_description",
        //     },
        //     {
        //         type: "topic",
        //         id: 1,
        //         main: "topic_name",
        //         secondary: "topic_description",
        //     },
        // ]
    };
};

exports.getUsersByTerm = async ( term, userId ) => {
    //db query
    const text = `
        SELECT user_id,username,first_name,last_name 
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

        //Creates an array of the topics using the topic model in ../model/topics.js
        const topics = res.rows.map( topic.ormTopic );

        // Returns the array
        return topics;

    }
    catch( e ) {
        console.log( e.stack );
        return null;
    }
};


exports.getWorkspaceByTerm = async ( term, userId ) => {
    const text = `
        SELECT *
        FROM workspaces 
        WHERE workspace_name ILIKE '%' || $1 || '%' 
        OR workspace_description ILIKE '%' || $1 || '%'
        AND owned_by = $2
    `;
    const values = [ term, userId ];

    try {
        
        let res = await db.query( text, values );

        const workspaces = res.rows.map( workspace.ormWorkspace );

        return workspaces;

    }
    catch( e ) {
        console.log( e.stack );
        return null;
    }
};