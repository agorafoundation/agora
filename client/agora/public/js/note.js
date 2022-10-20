let noteEditor = null;
if (document.getElementById("noteEditor")) {
  noteEditor = SUNEDITOR.create("noteEditor", {
    toolbarContainer: "#toolbar_container",
    showPathLabel: false,
    defaultTag: "p",
    charCounter: true,
    charCounterLabel: "Char Count",
    width: "100%",
    height: "auto",
    minHeight: "1500px",
    defaultStyle: "font-size:22px;",
    buttonList: [
      ["undo", "redo", "font", "fontSize", "formatBlock"],
      ["fontColor", "hiliteColor", "textStyle"],
      [
        "bold",
        "underline",
        "italic",
        "strike",
        "subscript",
        "superscript",
        "removeFormat",
      ],
      ["outdent", "indent", "align", "horizontalRule", "list", "table"],
      [
        "-right",
        "link",
        "image",
        "video",
        "showBlocks",
        "codeView",
        "preview",
        "print",
        "save",
        "fullScreen",
      ],
    ],
    mode: "classic",
    lang: SUNEDITOR_LANG.en,
    "lang(In nodejs)": "en",
    callBackSave: function (contents, isChanged) {
      alert(contents);
      console.log(contents);
    },
  });

  /* Note Editor Events  ---------------------------------------------------*/
  noteEditor.onChange = (contents, core) => {
    noteEditor.save();
  };

  noteEditor.onKeyUp = (e) => {
    if (e.key == "/") {
        noteEditor.insertHTML(
        '<div><button style=background:pink;>Hello</button></div>',
        true
      );
    }
  };

  // Close tags list
  noteEditor.onFocus = () => {
    document.querySelector(".tag-list").style.display = "none";
    document.querySelector("#new-tag-element").style.display = "none";
    document.querySelector("#mySearch").value = "";
  };

  noteEditor.onImageUpload = () => {
    // Image upload default does not automatically place cursor after image, so...
    noteEditor.appendContents("");
  };

  // Since suneditor only supports image upload...
  let numImages = 0;
  let numFileDrops = 0;
  // This function determines whether a file dropped in the editor is an image or a different file type
  noteEditor.onDrop = (e) => {
    // We don't know if it's an image at this point
    numFileDrops++;

    let file = e.dataTransfer.files[0];
    let fileName = file.name;
    if (file == undefined) {
      // Plain text, returning true ensures text will still be rendered after drop
      return true;
    } else if (file.type.startsWith("image/")) {
      numImages++;
      // Continue with image upload
      return true;
    }

    if (numImages != numFileDrops) {
      // for temporary testing
      noteEditor.insertHTML(
        '<div class="testing" id="myFile" contenteditable="false">' + fileName + '</div><br/>',
        true);
      let newResource = document.createElement("div");
      console.log(newResource)
      newResource.setAttribute("id", "myResource");
      newResource.innerHTML = fileName;
      newResource.style.display = "none";
      document.getElementById("note-div").appendChild(newResource);
    }
  }





let isMoving = false;

  function onMouseMove (e) {
    let resource = document.getElementById('myResource');
    resource.style.left = e.pageX + 30 + 'px';
    resource.style.top = e.pageY + 30 + 'px';
  }

  noteEditor.onFocus = () => {
    noteEditor.core.focus();
    console.log(noteEditor.core)

    let element = document.querySelector(".testing");
    let resource = document.getElementById('myResource');

    if (resource && element) {

        document.addEventListener("mousedown", function(e) {
          if (e.target == element) {
            e.preventDefault();
            console.log('dragging');
            isMoving = true;
            resource.style.display = "block";
            element.style.display = "none";
          }
        });

        document.addEventListener("mouseup", function(e) {
          if (isMoving) {
            console.log('dropped');
            resource.style.display = "none";
            isMoving = false;
            element.remove();
            core.blur();
            noteEditor.insertHTML(
              '<div class="testing" id="myFile" contenteditable="false">' + resource.innerHTML + '</div><br/>',
              true);
          }
        });
      
      document.addEventListener('mousemove', onMouseMove);

    }
  }

  // noteEditor.onClick = () => {
  //   var startPos = noteEditor.selectionStart;
  //       var endPos = noteEditor.selectionEnd;
  //       console.log(startPos + ", " + endPos);
  // }
}
  /* END Note Editor Events  ---------------------------------------------------*/






/* File Dropdown ----------------------------------------- */

// // Toggles the rendering of more options menu
// const toggleMoreOptions = () => {
//     if (document.getElementById('dropdown-content').getAttribute('style')) {
//         document.getElementById('dropdown-content').setAttribute('style','');
//     } else {
//         document.getElementById('dropdown-content').setAttribute('style',"display: block; right: 2%; top: 4%");
//     }
// }

// // If file modal is on, it turns off and vice versa
// const toggleFileModal = () => {
//     if (document.getElementById('file-display').getAttribute('class') === 'hidden') {
//     document.getElementById('file-display').setAttribute('class','file-display-shown');
//     } else {
//     document.getElementById('file-display').setAttribute('class','hidden');
//     }
// }

// // Checks if someone is clicking off modal and then closes it
// $('body').click(function (ev) {
//     if (document.getElementById('file-display').getAttribute('class') !== 'hidden') {
//         if (ev.target.id !== 'file-display-content' && ev.target.id !== 'show-files' && ev.target.id !== "file-display-name" && ev.target.id !== "file-display-icon" && ev.target.id !== "show-files" && ev.target.id !== 'new-file-icon' && ev.target.id !== 'new-file-coloring') {
//         document.getElementById('file-display').setAttribute('class','hidden');
//         }

//     }
// if (ev.target.id !== 'ellipsis')
//     document.getElementById('dropdown-content').setAttribute('style','');
// });

// const onClickTesting = () => {
//     console.log("clicked");
// }

// const returnFiles = () => {
//     return [{name: "file 1", onClick: onClickTesting()},{name: "file 2", onClick: onClickTesting()}];
// }

/* END File Dropdown ----------------------------------------- */