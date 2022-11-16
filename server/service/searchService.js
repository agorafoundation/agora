/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


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
    //db query (Chris)
};

exports.getGoalsByTerm = async ( term, userId ) => {
    //db query (Chris)
};