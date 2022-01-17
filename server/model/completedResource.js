function completedResource() {
    this.id = -1;
    this.resourceId = -1;
    this.userId = -1;
    this.submissionText = "";
    this.active;
    this.createTime;
    this.updateTime;

    // Resource 
    this.resource = null;
}

exports.emptyCompletedResource = () => {
    return new completedResource();
}

exports.ormCompletedResource = function (row) {
    let completedResource = exports.emptyCompletedResource();
    completedResource.id = row.id;
    completedResource.resourceId = row.resource_id;
    completedResource.userId = row.user_id;
    completedResource.submissionText = row.submission_text;
    completedResource.active = row.active;
    completedResource.createTime = row.create_time;
    completedResource.updateTime = row.update_time;
    return completedResource;
}