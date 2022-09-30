function discussion() {
    this.type = ""
    this.id = -1
    this.text = ""
    this.comments = []
}

exports.emptyDiscussion = () => {
    return new discussion()
}

exports.ormDiscussion = (row) => {
    let discussion = exports.emptyDiscussion()

    discussion.type = row.type
    discussion.id = row.id
    discussion.text = row.text

    return discussion;
}
