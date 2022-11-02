/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function role() {
    this.id = -1;
    this.roleName = "";
    this.roleDescription = "";
    this.active = true;
    this.createTime;
}

exports.emptyRole = () => {
    return new role();
};


exports.ormRole = function ( row ) {
    let role = exports.emptyRole();
    role.id = row.id;
    role.roleName = row.role_name;
    role.roleDescription = row.role_description;
    role.active = row.active;
    role.createTime = row.create_time;
    return role;
};
