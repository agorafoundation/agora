/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/*
 * Menu management for agora 
 */

let clientSettings = {};

/**
 * Triggered when the page is loaded.
 */
window.addEventListener( "load", () => {
    loadClientSettings();
} );

/**
 * Loads the client settings from local storage and sets the properties associated with them.
 */
function loadClientSettings() {
    if ( !localStorage.getItem( 'client-settings' ) ) {
        saveClientSettings();
    }
}

/**
 * Saves the client settings to local storage.
 */
function saveClientSettings() {
    localStorage.setItem( 'client-settings', JSON.stringify( clientSettings ) );
}
