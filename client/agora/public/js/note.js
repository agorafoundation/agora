/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// let noteEditor = null;
// if ( document.getElementById( "noteEditor" ) ) {
//     // eslint-disable-next-line no-undef
//     noteEditor = SUNEDITOR.create( "noteEditor", {
//         toolbarContainer: "#toolbar_container",
//         showPathLabel: false,
//         defaultTag: "p",
//         charCounter: true,
//         charCounterLabel: "Char Count",
//         width: "100%",
//         height: "auto",
//         minHeight: "1500px",
//         defaultStyle: "font-size:15px;",
//         buttonList: [
//             [ "undo", "redo", "font", "fontSize", "formatBlock" ],
//             [ "fontColor", "hiliteColor", "textStyle" ],
//             [
//                 "bold",
//                 "underline",
//                 "italic",
//                 "strike",
//                 "subscript",
//                 "superscript",
//                 "removeFormat",
//             ],
//             [ "outdent", "indent", "align", "horizontalRule", "list", "table" ],
//             [
//                 "-right",
//                 "link",
//                 "image",
//                 "video",
//                 "showBlocks",
//                 "codeView",
//                 "preview",
//                 "print",
//                 "save",
//                 "fullScreen",
//             ],
//         ],
//         mode: "classic",
//         // eslint-disable-next-line no-undef
//         lang: SUNEDITOR_LANG.en,
//         "lang(In nodejs)": "en",
//         callBackSave: function ( contents, isChanged ) {
//             alert( contents );
//             console.log( contents );
//         },
//     } );

//     /* Note Editor Events  ---------------------------------------------------*/
//     noteEditor.onChange = ( contents, core ) => {
//         noteEditor.save();
//     };

//     noteEditor.onKeyUp = ( e ) => {
//         if ( e.key == "/" ) {
//             noteEditor.insertHTML(
//                 '<div><button style=background:pink;>Hello</button></div>',
//                 true
//             );
//         }
//     };

//     noteEditor.onImageUpload = () => {
//     // Image upload default does not automatically place cursor after image, so...
//         noteEditor.appendContents( "" );
//     };
// }
// /* END Note Editor Events  ---------------------------------------------------*/