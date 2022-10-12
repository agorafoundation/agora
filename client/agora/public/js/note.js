let noteEditor = null;
if (document.getElementById("noteEditor")) {
  noteEditor = SUNEDITOR.create("noteEditor", {
    toolbarContainer: "#toolbar_container",
    showPathLabel: false,
    defaultTag: "h1",
    charCounter: true,
    charCounterLabel: "Char Count",
    width: "100%",
    height: "auto",
    minHeight: "800px",
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
  noteEditor.onChange = (contents, core) => {
    noteEditor.save();
  };
  noteEditor.onKeyUp = (e) => {
    if (e.key == "Enter") {
      noteEditor.setDefaultStyle("font-size: 22px;", {
        defaultTag: "p",
      });
    } else if (e.key == "/") {
      console.log("test");
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
  // noteEditor.onBlur = () => {
  //   document.addEventListener("keyup", function(e) {
  //     if (e.key == "Enter" && document.getElementById("mySearch").value != null) {
  //       alert("hey")
  //     }
  //   })
  // }
}

// Change tabs
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function tagSearch() {
  let input, filter, ul, li, tag, i;
  input = document.getElementById("mySearch");
  filter = input.value.toUpperCase();
  ul = document.querySelector(".tag-list");
  li = ul.getElementsByTagName("li");

  if (filter == "") {
    ul.style.display = "none";
  } else {
    ul.style.display = "block";
    // Hide items that don't match search query
    for (i = 0; i < li.length; i++) {
      tag = li[i].innerHTML;
      if (tag.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "block";
      } else {
        li[i].style.display = "none";
      }
    }
  }
  // Always show new tag option
  document.querySelector("#new-tag-element").style.display = "block";
}

function newTag() {
  // Add the new tag to the search list
  const ul = document.querySelector(".tag-list");
  const li = document.createElement("li");
  const tagName = document.getElementById("mySearch").value;

  li.setAttribute("class", "tag-list-element");
  li.innerHTML = tagName;
  ul.appendChild(li);

  // create the tag and add to existing tags
  this.addTag(li);
}

// Add new tag by pressing enter key
let noteEditorDiv = document.getElementById("noteEditor");
ul = document.querySelector(".tag-list");
document.addEventListener("keyup", function(e) {
  if (e.key == "Enter" && ul.style.display == "block") {
    newTag();
  }
})

let currTagList = [];
function addTag(selectedTag) {
  // check that selected tag isn't already active
  let isActiveTag = false;
  for (let i = 0; i < currTagList.length; i++) {
    if (currTagList[i] === selectedTag.innerHTML) {
      isActiveTag = true;
    }
  }
  if (!isActiveTag) {
    const currTags = document.getElementById("curr-tags");
    const newTag = document.createElement("div");

    newTag.setAttribute("class", "styled-tags");
    newTag.innerHTML = selectedTag.innerHTML;
    currTags.appendChild(newTag);
    currTagList.push(newTag.innerHTML);
  }
}


// ************************ Drag and drop ***************** //
/**
 * Modified version of : https://codepen.io/dcode-software/pen/xxwpLQo
 *
 */
 if (document.querySelectorAll(".drop-zone")) {
  document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    inputElement.addEventListener("change", (e) => {
      if (inputElement.files.length) {
        updateThumbnail(dropZoneElement, inputElement.files[0]);
      }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
      dropZoneElement.addEventListener(type, (e) => {
        dropZoneElement.classList.remove("drop-zone--over");
      });
    });

    dropZoneElement.addEventListener("drop", (e) => {
      e.preventDefault();

      if (e.dataTransfer.files.length && e.dataTransfer.files[0]) {
        if (e.dataTransfer.files[0].size <= 1048576) {
          inputElement.files = e.dataTransfer.files;
          updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        } else {
          alert("Image size limit is 1MB!");
        }
      }

      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  /**
   * Updates the thumbnail on a drop zone element.
   *
   * @param {HTMLElement} dropZoneElement
   * @param {File} file
   */

  function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

        mydiv = document.createElement('div');
        mydiv.className = "drop-zone-show";
        inputfile = document.createElement('input');
        inputfile.type = "file"
        inputfile.name = "resourceImageField"
        inputfile.className = "drop-zone__input"
      
        // First time - there is no thumbnail element, so lets create it
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        mydiv.appendChild(thumbnailElement);
      
        thumbnailElement.dataset.label = file.name;
      
        // Show thumbnail for image files
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
        
            reader.readAsDataURL(file);
            reader.onload = () => {
                thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
            };
        
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
        mydiv.appendChild(inputfile)
        document.getElementById("resources-zone").appendChild(mydiv);
  }
}

// ************************ END Drag and drop ***************** //

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
