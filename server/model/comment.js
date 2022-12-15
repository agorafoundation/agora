function comment() {
    this.commentId = -1;
    this.parent_id = -1;
    this.parent_type = "";
    this.comment_text = "";
    this.user_id = -1;
    this.created_at = new Date();
    this.updated_at = new Date();
    this.likes = 0;
    this.dislikes = 0;
    this.user_rating = 0; // -1 dislike, 0 neutral, 1 like
}

exports.emptyComment = () => {
    return new comment();
};

exports.ormComment = ( row ) => {
    let comment = exports.emptyComment();

    comment.commentId = row.discussion_comment_id;
    comment.parent_id = row.parent_id;
    comment.parent_type = row.parent_type;
    comment.comment_text = row.comment_text;
    comment.user_id = row.user_id;
    comment.likes = parseInt( row.likes );
    comment.dislikes = parseInt( row.dislikes );
    comment.created_at = row.creation_date;
    comment.updated_at = row.updated_date;
    comment.user_rating = parseInt( row.user_rating );

    return comment;
};
