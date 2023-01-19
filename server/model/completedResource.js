/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function completedResource() {
    this.completedResourceId = -1;
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
};

exports.ormCompletedResource = function ( row ) {
    let completedResource = exports.emptyCompletedResource();
    completedResource.completedResourceId = row._completed_resource_id;
    completedResource.resourceId = row.resource_id;
    completedResource.userId = row.user_id;
    completedResource.submissionText = row.submission_text;
    completedResource.active = row.active;
    completedResource.createTime = row.create_time;
    completedResource.updateTime = row.update_time;
    return completedResource;
};