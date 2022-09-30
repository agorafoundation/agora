const discussion = require('../model/discussion')
const db = require('../db/connection')

/**
 * Retrieves all active goals with the highest version number that are either
 * public, owned by the requestor, or shared with the requesting user.
 * Retrvievs all goals
 * TODO: sharing is not implemented yet so currently this function will return 
 * all user goals and other public ones.
 * @returns List<Goal>
 */
 exports.getDiscussion = async ( type, id, userId ) => {
    // make sure to include whether the user can see in the query
    const text = "SELECT * FROM discussion WHERE 1=1;";
    const values = [ type, id, userId, true ];
    let disc = discussion.emptyDiscussion()
    
    try {
        
        let res = await db.query(text, values);

        discussion.ormDiscussion(res.rows[0]);

        // TODO: use the comment service to populate the comments
        // disc.comments = commentService.getCommentsForDiscussion()
        
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }

}

exports.updateDiscussion = async (type , id , userId, updatedDiscussion) => {

    try {
        
        let existingDiscussion = this.getDiscussion(type, id, userId)

        // properties on existing will be overridden by the ones specified on updated (only text right now)
        const updated = {
            ...existingDiscussion, 
            text: updatedDiscussion.text
        }

        // TODO: UPDATE THE DISCUSSION, include auth verification in this, userId must match the goal or topic owner
        
        return updated;
        
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }

    

}