function discussion() {
    this.parent_id = -1;
    this.parent_type = "";
    this.discussion_text = "";
    this.comments = [];
}

exports.emptyDiscussion = () => {
    return new discussion();
};

exports.ormDiscussion = ( row ) => {
    let discussion = exports.emptyDiscussion();

    discussion.parent_id = row.parent_id;
    discussion.parent_type = row.parent_type;
    discussion.discussion_text = row.discussion_text;

    return discussion;
};
