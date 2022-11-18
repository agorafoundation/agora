/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const db = require( "../db/connection" );
const { ormSearchResult } = require( "../model/searchresult" );

exports.getSearchResults = async ( term, userId ) => {

    const [ users, resources, topics, goals ] = await Promise.all( [
        this.getUsersByTerm( term, userId ),
        this.getResourcesByTerm( term, userId ),
        this.getTopicsByTerm( term, userId ),
        this.getGoalsByTerm( term, userId )
    ] );

    console.log( users, resources, topics, goals );
    console.log( term );

    return {search: term} ;
};

exports.getUsersByTerm = async ( term, userId ) => {
    //db query
};

exports.getResourcesByTerm = async ( term, userId ) => {
    //db query(Kyle)
};

exports.getTopicsByTerm = async ( term, userId ) => {
    const text = `
        SELECT goal_name, goal_id, goal_description
        FROM topics 
        WHERE goal_name LIKE $1 OR CONTAINS(goal_description, $1)
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
        WHERE goal_name LIKE $1 OR CONTAINS(goal_description, $1)
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