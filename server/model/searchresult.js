/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function searchResult() {
    this.type = "";
    this.id = -1;
    this.main = "";
    this.secondary = "";
}

exports.emptySearchResult = () => {
    return new searchResult();
};

exports.ormSearchResult = ( type, element ) => {
    let result = new searchResult();

    switch( type ) {
    case "user":
        result.type = "user";
        result.id = element.id;
        result.main = element.username;
        result.secondary = element.firstName + " " + element.lastName;
        break;
    case "resource":
        result.type = "resource";
        result.id = element.resourceId;
        result.main = element.resourceName;
        result.secondary = element.resourceDescription;
        break;
    case "workspace":
        result.type = "workspace";
        result.id = element.workspaceId;
        result.main = element.workspaceName;
        result.secondary = element.workspaceDescription;
        break;
    case "topic":
        result.type = "topic";
        result.id = element.topicId;
        result.main = element.topicName;
        result.secondary = element.topicDescription;
        break;
    default:
        result = exports.emptySearchResult();
        break;
    }
    
    return result;
};