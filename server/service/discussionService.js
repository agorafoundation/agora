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

exports.editComment = async (id , userid , editedComment) => {

    try {
        const text = 'SELECT user.id from discussion_comments WHERE comment.id = '
        commentAuthorId = 3
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }

    //compare to see if the user created the comment they are trying to edit
    if  (commentAuthorId == id) {

        //query database to update comment text
        return {id , userid , editedComment}
    }
    else {
        return {error: "User not allowed to edit this comment"}
    }
}

exports.deleteComment = async (id , userid) => {

    //query database for the userid associated with the comment
    commentAuthorId = 3

    if  (commentAuthorId == id) {

        //query database to delete comment
        return {id , userid}
    }
    else {
        return {error: "User not allowed to delete this comment"}
    }
    
}