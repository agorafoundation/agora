/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function userRole() {
    this.id = -1;
    this.userId = "";
    this.roleId = "";
    this.active = true;
    this.createTime;
    this.endTime;           // end time of 0 is eternal (null or -1 is a problem)
}

exports.emptyUserRole = () => {
    return new userRole();
};

exports.ormUserRole = function ( row ) {
    let userRole = exports.emptyUserRole();
    userRole.id = row.user_role_id;
    userRole.userId = row.user_id;
    userRole.roleId = row.role_id;
    userRole.active = row.active;
    userRole.createTime = row.create_time;
    userRole.endTime = row.end_time;
    return userRole;
};
