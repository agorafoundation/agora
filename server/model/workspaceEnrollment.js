/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function workspaceEnrollment() {
    this.workspaceEnrollmentId = -1;
    this.workspaceRid = -1;
    this.userId = -1;
    this.isCompleted = false;
    this.completedDate = null;
    this.active = true;
    this.createTime;

    // put the workspace object here for easy access to name, desc, img, etc
    this.workspace = null;
}

exports.emptyWorkspaceEnrollment = () => {
    return new workspaceEnrollment();
};

exports.ormWorkspaceEnrollment = function ( row ) {
    let workspaceEnrollment = exports.emptyWorkspaceEnrollment();
    workspaceEnrollment.workspaceEnrollmentId = row.workspace_enrollment_id;
    workspaceEnrollment.workspaceRid = row.workspace_rid;
    workspaceEnrollment.workspaceVersion = row.workspace_version;
    workspaceEnrollment.userId = row.user_id;
    workspaceEnrollment.isCompleted = row.is_completed;
    workspaceEnrollment.active = row.active;
    workspaceEnrollment.createTime = row.create_time;
    return workspaceEnrollment;
};