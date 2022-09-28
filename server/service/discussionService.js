/**
 * Retrieves all active goals with the highest version number that are either
 * public, owned by the requestor, or shared with the requesting user.
 * Retrvievs all goals
 * TODO: sharing is not implemented yet so currently this function will return 
 * all user goals and other public ones.
 * @returns List<Goal>
 */
 exports.getDiscussion = async ( type, id ) => {

    if( type === "goal" || type === "topic" ) {
        return {type, id}
    }

    const text = "";
    const values = [ ownerId, true ];
}

exports.updateDiscussion = async (type , id , updatedDiscussion) => {

    return {type , id , updatedDiscussion}
}