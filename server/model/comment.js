function comment() {
    this.id = -1
    this.parent_id = -1
    this.parent_type = ""
    this.comment_text = ""
    this.user_id = -1
    this.likes = 0;
    this.dislikes = 0;
}

exports.emptyComment = () => {
    return new comment()
}

exports.ormComment = (row) => {
    let comment = exports.emptyComment()

    comment.id = row.comment_id
    comment.parent_id = row.parent_id
    comment.parent_type = row.parent_type
    comment.comment_text = row.comment_text
    comment.user_id = row.user_id
    comment.likes = parseInt(row.likes)
    comment.dislikes = parseInt(row.dislikes)

    return comment;
}
