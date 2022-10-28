/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function workspace() {
    this.rid = -1;
    this.id = -1;
    this.workspaceVersion = 1;
    this.workspaceName = "";
    this.workspaceDescription = "";
    this.workspaceImage = "";
    this.active = true;
    this.completable = false;
    this.createTime;
    this.visibility = 2;
    this.ownedBy = -1;

    this.topics = [];
}

exports.emptyWorkspace = () => {
    return new workspace();
}

exports.ormWorkspace = function (row) {
    let workspace = exports.emptyWorkspace();
    workspace.rid = row.rid;
    workspace.id = row.id;
    workspace.version = row.workspace_version;
    workspace.workspaceName = row.workspace_name;
    workspace.workspaceDescription = row.workspace_description;
    workspace.workspaceImage = row.workspace_image;
    workspace.active = row.active;
    workspace.completable = row.completable;
    workspace.createTime = row.create_time;
    workspace.visibility = row.visibility;
    workspace.ownedBy = row.owned_by;
    return workspace;
}