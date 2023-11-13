
// uuid pattern for regex
//const idPattern = /-([0-9]+)/;
const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;

/**
 * returns the uuid of the workspace from the url
 * @returns uuid
 */
const getWorkspaceUuid = () => {

    const url = window.location.href;
    let urlId = null;
    let tempUuid =  ( uuidPattern.exec( url ) );
    if( tempUuid ) {
        urlId = tempUuid[0];
    }

    return [ urlId ];
};

export { getWorkspaceUuid };