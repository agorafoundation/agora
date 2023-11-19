
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

/**
 * taken from : https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/2117523#2117523
 * @returns uuidv4
 */
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace( /[018]/g, c =>
        ( c ^ crypto.getRandomValues( new Uint8Array( 1 ) )[0] & 15 >> c / 4 ).toString( 16 )
    );
}

export { getWorkspaceUuid, uuidv4 };