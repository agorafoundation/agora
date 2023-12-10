/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


function validateEmail( emailAddress ) {
    var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
    var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
    var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
    var sQuotedPair = '\\x5c[\\x00-\\x7f]';
    var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
    var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
    var sDomain_ref = sAtom;
    var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
    var sWord = '(' + sAtom + '|' + sQuotedString + ')';
    var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
    var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
    var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
    var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
  
    var reValidEmail = new RegExp( sValidEmail );
  
    return reValidEmail.test( emailAddress );
}

function validateUsername( username ) {
    /* 
      Usernames can only have: 
      - Lowercase Letters (a-z) 
      - Uppercase Letters (A-Z)
      - Numbers (0-9)
      - Dots (.)
      - Underscores (_)
      - 4 to 20 characters in length
    */
    const res = /^(?=.{4,20}$)[a-zA-Z0-9._]+$/.exec( username );
    const valid = !!res;
    return valid;
}

let userEmail = document.getElementById( 'userEmail' );
if( userEmail ) {
    userEmail.addEventListener( 'input', ( e ) => {
        validateCheckExistsMain( userEmail.value, userUsername.value );
    } );
}

let userUsername = document.getElementById( 'userUsername' );
if( userUsername ) {
    userUsername.addEventListener( 'input', ( e ) => {
        validateCheckExistsUsername( userUsername.value, userEmail.value );
        
    } );
}

// Re-enable disabled fields on manage form so that data is not lost
if( document.getElementById( 'userManageButton' ) ) {
    document.getElementById( 'userManageButton' ).addEventListener( 'click', () => {
    
        if( document.getElementById( 'userEmail' ) ) {
            let active = document.getElementById( 'subscriptionActive' ).checked;
            if( !active ) {
                document.getElementById( 'firstName' ).disabled = false;
                document.getElementById( 'lastName' ).disabled = false;
    
                // TODO:Tags code removed to enable previous interests, not sure if tags will need to be re-enabled when impletemented
            }
        }
    } );
}

let manageEmail = document.getElementById( 'manageEmail' );
if( manageEmail ) {
    // call to non-existant endpoint to check if email is unique
    // manageEmail.addEventListener( 'input', ( e ) => {
    //     validateCheckExistsManage( manageEmail.value );

    // } );
}

function validateCheckExistsMain( email, username, runOnce ) {
    if( validateEmail( email ) ) {
        fetch( '/api/v1/open/verifyEmail/' + email ).then( ( res ) => {
            //console.log("2: sending email: " + email);
            res.json().then( ( data ) => {
                //console.log("3: email returned: " + data);
                if( data ) {
                    //console.log("data returned: " + data);
                    document.getElementById( 'emailHelp' ).innerHTML = "<strong style='color:red'>Email is already in use";
                    document.getElementById( 'userButton' ).disabled = true;
                }
                else {
                    
                    document.getElementById( 'emailHelp' ).innerHTML = "Email is unique";
                    document.getElementById( 'userButton' ).disabled = false;

                    // recheck username before enabling
                    if( username && !runOnce ) {
                        validateCheckExistsUsername( username, email, true );
                    }
                    
                }
            } );
        } );
    }
    else {
        document.getElementById( 'emailHelp' ).innerHTML = "<strong style='color:red'>Please enter a valid email address!</strong>";
        document.getElementById( 'userButton' ).disabled = true;
    }
    
    
}

function validateCheckExistsUsername( username, email, runOnce ) {
    if( validateUsername( username ) ) {
        fetch( '/api/v1/open/verifyUsername/' + username ).then( ( res ) => {
            res.json().then( ( data ) => {
                if( data ) {
                    //console.log("data returned: " + data);
                    document.getElementById( 'usernameHelp' ).innerHTML = "<strong style='color:red'>Username is already in use</strong>";
                    document.getElementById( 'userButton' ).disabled = true;
                }
                else {
                    document.getElementById( 'usernameHelp' ).innerHTML = "Username is Valid";
                    document.getElementById( 'userButton' ).disabled = false;

                    // recheck email before enabling
                    if( email && !runOnce ) {
                        validateCheckExistsMain( email, username, true );
                    }
                    
                }
            } );
        } );
    }
    else {
        document.getElementById( 'usernameHelp' ).innerHTML = "<strong style='color:red'>Username must be between 4 and 20 characters in length and may contain letters, numbers, . and _</strong>";
        document.getElementById( 'userButton' ).disabled = true;
    }
}

window.addEventListener( 'load', () => {
    /**
     * Password
     */
    if( document.getElementById( "psw" ) ) {
        var myInput = document.getElementById( "psw" );
        var letter = document.getElementById( "letter" );
        var capital = document.getElementById( "capital" );
        var number = document.getElementById( "number" );
        var length = document.getElementById( "length" );
        var special = document.getElementById( "special" );

        // When the user clicks on the password field, show the message box
        myInput.onfocus = function() {
            if( pwValidator() ) {
                document.getElementById( "passwordRequirementsMessage" ).style.display = "none";
            }
            else {
                document.getElementById( "passwordRequirementsMessage" ).style.display = "block";
            }
        };

        // When the user clicks outside of the password field, hide the message box
        myInput.onblur = function() {
            if( pwValidator() ) {
                document.getElementById( "passwordRequirementsMessage" ).style.display = "none";
            }
            else {
                document.getElementById( "passwordRequirementsMessage" ).style.display = "block";
            }
        };

        // When the user starts to type something inside the password field
        myInput.onkeyup = function() {
            //remove popup 
            if( pwValidator() ) {
                document.getElementById( "passwordRequirementsMessage" ).style.display = "none";
            }
            else {
                document.getElementById( "passwordRequirementsMessage" ).style.display = "block";
            }
        };
    }

} );

function pwValidator() {
    var myInput = document.getElementById( "psw" );
    var letter = document.getElementById( "letter" );
    var capital = document.getElementById( "capital" );
    var number = document.getElementById( "number" );
    var length = document.getElementById( "length" );
    var special = document.getElementById( "special" );

    // Validate lowercase letters
    var lowerCaseLetters = /[a-z]/g;
    let checkOne = myInput.value.match( lowerCaseLetters );
    if( checkOne ) {
        letter.classList.remove( "invalid" );
        letter.classList.add( "valid" );
    }
    else {
        letter.classList.remove( "valid" );
        letter.classList.add( "invalid" );
    }

    // Validate capital letters
    var upperCaseLetters = /[A-Z]/g;
    let checkTwo = myInput.value.match( upperCaseLetters );
    if( checkTwo ) {
        capital.classList.remove( "invalid" );
        capital.classList.add( "valid" );
    }
    else {
        capital.classList.remove( "valid" );
        capital.classList.add( "invalid" );
    }

    // Validate numbers
    var numbers = /[0-9]/g;
    let checkThree = myInput.value.match( numbers );
    if( checkThree ) {
        number.classList.remove( "invalid" );
        number.classList.add( "valid" );
    }
    else {
        number.classList.remove( "valid" );
        number.classList.add( "invalid" );
    }

    // Validate length
    let checkFour = myInput.value.length >= 8;
    if( checkFour ) {
        length.classList.remove( "invalid" );
        length.classList.add( "valid" );
    }
    else {
        length.classList.remove( "valid" );
        length.classList.add( "invalid" );
    }

    // Validate special character
    var specials = /[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?]/g;
    let checkFive = myInput.value.match( specials );
    if( checkFive ) {
        special.classList.remove( "invalid" );
        special.classList.add( "valid" );
    }
    else {
        special.classList.remove( "valid" );
        special.classList.add( "invalid" );
    }
    
    if( checkOne && checkTwo && checkThree && checkFour && checkFive ) {
        return true;
    }
    else {
        return false;
    }
    
}

function pwMask( el ) {
    var x = document.getElementById( el );
    if ( x.type === "password" ) {
        x.type = "text";
    }
    else {
        x.type = "password";
    }
}

if( document.getElementById( 'passwordToggle' ) ) {
    document.getElementById( 'passwordToggle' ).addEventListener( 'click', () => {
        pwMask( 'psw' );
    } );
}
  
const acceptRequestButton = document.getElementById( 'btn-accept-request' );

if( acceptRequestButton ) {
    acceptRequestButton.addEventListener( 'click', () => {
        // Get the friend_id from the data-id attribute of the button
        const friendshipId = acceptRequestButton.getAttribute( 'data-id' );
    
        fetch( '/api/v1/auth/friends/requestResponse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                friendship_id: friendshipId, // Pass the friend_id as a parameter
            } ),
        } )
            .then( ( response ) => {
                if ( response.status === 201 ) {
                    // Successfully accepted friend request
                    const message = 'Friend request accepted successfully.';
                    console.log( message );
                    alert( message ); // Display a pop-up with the message
                    location.reload(); // Refresh the page
                }
                else {
                    const errorMessage = 'Failed to accept friend request.';
                    console.error( errorMessage );
                    alert( errorMessage ); // Display a pop-up with the error message
                }
            } )
            .catch( ( error ) => {
                console.error( 'Error making accept request:', error );
                alert( 'Error making accept request: ' + error ); // Display a pop-up with the error message
            } );
    } );
}


const denyRequestButton = document.getElementById( 'btn-deny-request' );

if ( denyRequestButton ) {
    denyRequestButton.addEventListener( 'click', () => {
        // Get the friend_id from the data-id attribute of the button
        const friendshipId = denyRequestButton.getAttribute( 'data-id' );
        
        fetch( '/api/v1/auth/friends/requestResponse', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                friendship_id: friendshipId, // Pass the friend_id as a parameter
            } ),
        } )
            .then( ( response ) => {
                if ( response.status === 201 ) {
                    // Successfully denied friend request
                    const message = 'Friend request denied successfully.';
                    console.log( message );
                    alert( message ); // Display a pop-up with the message
                    location.reload(); // Refresh the page
                }
                else {
                    const errorMessage = 'Failed to deny friend request.';
                    console.error( errorMessage );
                    alert( errorMessage ); // Display a pop-up with the error message
                }
            } )
            .catch( ( error ) => {
                console.error( 'Error making deny request:', error );
                alert( 'Error making deny request: ' + error ); // Display a pop-up with the error message
            } );
    } );
}

const generateAvatarButton = document.getElementById( 'btn-generate-avatar' );
if( generateAvatarButton ) {
    const bio = document.getElementById( 'bio' );

    document.addEventListener( 'DOMContentLoaded', () => {
        if( bio && bio.value.length > 20 ) {
            generateAvatarButton.disabled = false;
        }
    } );

    bio.addEventListener( 'keyup', ( e ) => {
        console.log( "testing --- " );
        if( e.target.value.length > 20 ) {
            generateAvatarButton.disabled = false;
        }
        else {
            generateAvatarButton.disabled = true;
        }
    } );

    generateAvatarButton.addEventListener( 'click', () => {
        // get the users profile bio
        const bio = document.getElementById( 'bio' ).value;
        console.log( 'bio retrieved : ' + bio );
        generateAvatarButton.disabled = true;
    
        const spinner1 = document.querySelector( '.avatar-spinner-1' );
        const spinner2 = document.querySelector( '.avatar-spinner-2' );
        spinner1.style.display = 'block';
        spinner2.style.display = 'block';
    
        fetch( '/api/v1/auth/ai/generateAvatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify( {
                prompt: bio, // Pass the friend_id as a parameter
            } ),
        } )
    
            .then( ( response ) => {
                response.json().then( ( data ) => {
                    console.log( 'response: ' + JSON.stringify( response ) );
                    if( response.status === 200 ) {
                        // Successfully generated avatar
                        const message = 'Avatar generated successfully.';
                        console.log( message );
                        generateAvatarButton.disabled = false;
                        spinner1.style.display = 'none';
                        spinner2.style.display = 'none';

                        location.reload(); // Refresh the page
                    }
                    else if( response.status === 429 ) {
                        const errorMessage = 'Too many requests, you must wait at least 1 minutes before trying again!';
                    
                        generateAvatarButton.disabled = false;
                        spinner1.style.display = 'none';
                        spinner2.style.display = 'none';
                        alert( errorMessage ); // Display a pop-up with the error message
                        console.error( errorMessage );
                    }
                    else {
                        console.log( "other: " + JSON.stringify( response ) );
                        const errorMessage = 'Failed to generate avatar.';
                        generateAvatarButton.disabled = false;
                        spinner1.style.display = 'none';
                        spinner2.style.display = 'none';
    
                        console.error( errorMessage );
                    }
                } );
            
            } ).catch( ( error ) => {
                console.error( 'Error generating avatar:', error );
            } );
    
        console.log( 'avatar generated' );
           
    } );
    
}
