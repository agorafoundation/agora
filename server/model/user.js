/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function user(email, username, profileFilename, emailValidated, firstName, lastName, hashedPassword, roleId, subscriptionActive, beginningProgramming, intermediateProgramming, advancedProgramming, 
    mobileDevelopment, roboticsProgramming, webApplications, web3, iotProgramming, databaseDesign, relationalDatabase, noSqlDatabase, objectRelationalMapping, stripeId, availableAccessTokens) {
    this.id -1;
    this.email = email;
    this.username = username;
    this.profileFilename = profileFilename;
    this.emailValidated = emailValidated;
    this.firstName = firstName;
    this.lastName = lastName;
    this.hashedPassword = hashedPassword;
    this.roleId = roleId;
    this.subscriptionActive =subscriptionActive;
    this.beginningProgramming = beginningProgramming;
    this.intermediateProgramming = intermediateProgramming;
    this.advancedProgramming = advancedProgramming;
    this.mobileDevelopment = mobileDevelopment;
    this.roboticsProgramming = roboticsProgramming;
    this.webApplications = webApplications;
    this.web3 = web3;
    this.iotProgramming = iotProgramming;
    this.databaseDesign = databaseDesign;
    this.relationalDatabase = relationalDatabase;
    this.noSqlDatabase = noSqlDatabase;
    this.objectRelationalMapping = objectRelationalMapping;
    this.stripeId = stripeId;
    this.availableAccessTokens = availableAccessTokens;
    
    // populate with user_role
    this.roles = [];

    // populate with enrolled goal paths
    this.enrollments = [];

    // populate with enrolled Topics
    this.topicEnrollments = [];

    // 
  }
  
exports.emptyUser = () => {
    return new user();
}

exports.createUser = function(email, username, profileFilename, emailValidated, firstName, lastName, hashedPassword, roleId, subscriptionActive, beginningProgramming, intermediateProgramming, advancedProgramming, 
    mobileDevelopment, roboticsProgramming, webApplications, web3, iotProgramming, databaseDesign, relationalDatabase, noSqlDatabase, objectRelationalMapping, stripeId, availableAccessTokens) {
    let newUser = new user(email, username, profileFilename, emailValidated, firstName, lastName, hashedPassword, roleId, subscriptionActive, beginningProgramming, intermediateProgramming, advancedProgramming, 
        mobileDevelopment, roboticsProgramming, webApplications, web3, iotProgramming, databaseDesign, relationalDatabase, noSqlDatabase, objectRelationalMapping, stripeId, availableAccessTokens);
    newUser.id = -1;
    return newUser;
}


  

exports.ormUser = function(userRow) {
    let user = exports.emptyUser();
    user.id = userRow.id;
    user.email = userRow.email;
    user.username = userRow.username;
    user.profileFilename = userRow.profile_filename;
    user.emailValidated = userRow.email_validated;
    user.roleId = userRow.role_id;
    user.firstName = userRow.first_name;
    user.lastName = userRow.last_name;
    user.subscriptionActive = userRow.subscription_active;
    user.beginningProgramming = userRow.beginning_programming;
    user.intermediateProgramming = userRow.intermediate_programming;
    user.advancedProgramming = userRow.advanced_programming;
    user.mobileDevelopment = userRow.mobile_development;
    user.roboticsProgramming = userRow.robotics_programming;
    user.webApplications = userRow.web_applications;
    user.web3 = userRow.web3;
    user.iotProgramming = userRow.iot_programming;
    user.databaseDesign = userRow.database_design;
    user.relationalDatabase = userRow.relational_database;
    user.noSqlDatabase = userRow.nosql_database;
    user.objectRelationalMapping = userRow.object_relational_mapping;
    user.stripeId = userRow.stripe_id;
    user.availableAccessTokens = userRow.available_access_tokens;
    return user;
}