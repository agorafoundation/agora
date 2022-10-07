const discussion = require("../model/discussion")
const comment = require("../model/comment")
const db = require("../db/connection")

// Essentially acts as enabling a discussion
exports.createDiscussion = async (type, id, discussion_text, userId) => {

    const text = `
        INSERT INTO discussions (
            parent_id,
            parent_type,
            discussion_text
        )
        SELECT parent.id, $1, $3
        FROM ${type + "s"} parent
        WHERE parent.id = $2 AND parent.owned_by = $4;
    `
    const values = [ type, id, userId, discussion_text ];
    
    try {
        
        let res = await db.query(text, values);

        if(res.rows.length === 0) {
            return "No discussion found"
        }

        return discussion.ormDiscussion(res.rows[0]);
        
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }
}

exports.getDiscussion = async ( type, id, userId ) => {
    // make sure to include whether the user can see in the query
    const text = "SELECT * FROM discussions WHERE parent_type = $1 AND parent_id = $2 AND $3=$3;";
    const values = [ type, id, userId ];
    let disc = discussion.emptyDiscussion()
    
    const text2 = `
        SELECT * 
        FROM discussions disc 
        INNER JOIN discussion_comments comms 
            ON disc.parent_id = comms.parent_id 
            AND disc.parent_type = comms.parent_type 
        INNER JOIN discussion_comment_ratings ratings 
            ON comms.comment_id = ratings.comment_id;
    `

    try {
        
        let res = await db.query(text, values);

        if(res.rows.length === 0) {
            return false
        }

        return discussion.ormDiscussion(res.rows[0]);

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
        
        let existingDiscussion = await this.getDiscussion(type, id, userId)

        if(!existingDiscussion) {
            return "Discussion not found"
        }

        // properties on existing will be overridden by the ones specified on updated (only text right now)
        const updated = {
            ...existingDiscussion, 
            discussion_text: updatedDiscussion.discussion_text
        }

        // TODO: include auth verification in this, userId must match the goal or topic owner
        const text = `
            UPDATE discussions
            SET discussion_text = $3
            WHERE parent_type = $1
            AND parent_id = $2
        `
        const values = [type, id, updated.discussion_text]

        await db.query(text, values)

        return updated;
        
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }
}

exports.setCommentRating = async (commentId, rating, userId) =>  {
    try {
        const text  = `
            INSERT INTO discussion_comment_ratings(
                comment_id,
                user_id,
                rating
            ) 
            VALUES ($1, $2, $3)
            ON CONFLICT (rating)
            DO
                UPDATE SET rating = $3
        `

        const values = [commentId, rating, userId]
    } catch (e) {
        console.error(e.stack)
    }
}

exports.removeCommentRating = async (commentId, userId) => {
    try {
        const text  = `
            DELETE FROM discussion_comment_ratings
            WHERE comment_id = $1
            AND user_id = $2
        `

        const values = [commentId, rating, userId]

        await db.query(text, values)

    } catch (e) {
        console.error(e.stack)
    }
}

exports.editComment = async (commentId , userId , editedComment) => {

    let defaultComment = comment.emptyComment()

    const updated = {
        ...defaultComment,
        comment_text: editedComment.comment_text
    } 

    try {
        const text = `UPDATE discussion_comments SET comment_text = $3 WHERE comment_id = $1 AND user_id = $2`
        const values = [commentId, userId, updated.comment_text]

        let res = await db.query(text , values)
        return comment.ormComment(res.rows[0]) // give back the edited comment
    } catch(e) {
        console.log(e.stack);
        return false;
    }
}

exports.deleteComment = async (commentId , userId) => {

    try {
        const text = `DELETE FROM discussion_comments WHERE comment_id = $1 AND user_id = $2`
        const values = [commentId, userId]

        let res = await db.query(text , values)
        return res.rowCount === 1
    } catch(e) {
        console.log(e.stack);
        return false;
    }
    
}