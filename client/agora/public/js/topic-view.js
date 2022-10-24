// Workspace resizing
let activeHeightObj = {};
let activeHeightList = [];

// Initializes a height variable for each open topic
// For now get intialized to 0, but in the future would be initialized according to saved height
function activeHeightInit() {
  for (let i=0; i<document.querySelectorAll('.tabcontent').length; i++) {
    activeHeightObj[document.querySelectorAll('.tabcontent')[i].id] = 0;
    activeHeightList.push(activeHeightObj[document.querySelectorAll('.tabcontent')[i].id]);
  }
}
activeHeightInit();


// Implemented to ensure resources fill a 1200px space first 
// And then page grows as needed
function checkActiveHeight() {
    if (activeHeightObj[tabName] < 1200) {
        let filler = document.createElement("div");
        filler.setAttribute("id", "filler-space");
        filler.style.height = (1200-activeHeightObj[tabName]) + "px";
        activeTab.appendChild(filler);
    }
}



/* Tab Functions ------------------------------------------------------------------- */
// First topic is default active tab for now
let activeTab = document.getElementById("resources-zone1");
let tabName = "topic1";


// Change tabs
function openTab(evt, name) {
  tabName = name;

  let i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
    tablinks[i].style.backgroundColor = "#f1f1f1";
  }

  activeTab = document.getElementById("resources-zone" + name.slice(-1));
  console.log(activeHeightObj[name]);

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(name).style.display = "block";
  evt.currentTarget.className += " active";

  evt.currentTarget.style.backgroundColor = "#ddd";
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
    document.querySelector(".tag-list").style.display = "none";
    document.querySelector("#new-tag-element").style.display = "none";
    document.querySelector("#mySearch").value = "";
  }
});

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
/* END Tab Functions ------------------------------------------------------------------- */




/* Suneditor Creation -----------------------------------------------------------*/
let numSunEditors = 0;
let doneIconList = [];
let editIconList = [];
let newTabIconList = [];
function createTextArea() {
    return new Promise((resolve, reject) => {
        numSunEditors++;

        // Check for filler space
        if (document.getElementById("filler-space")) {
            document.getElementById("filler-space").remove();
        }

        // Title element
        let title = document.createElement('input');
        title.type = "text";
        title.className = "drop-zone__title";
        title.placeholder = "Untitled";

        // Edit icon
        let editIcon = document.createElement('span');
        editIcon.setAttribute("class", "material-symbols-outlined");
        editIcon.setAttribute("id", "edit-icon" + numSunEditors);
        editIcon.innerHTML = "edit";
        editIcon.style.display = "none";

        // Done icon
        let doneIcon = document.createElement('span');
        doneIcon.setAttribute("class", "material-symbols-outlined");
        doneIcon.setAttribute("id", "done-icon" + numSunEditors);
        doneIcon.innerHTML = "done";

        // New Tab
        let newTabIcon = document.createElement('span');
        newTabIcon.setAttribute("class", "material-symbols-outlined");
        newTabIcon.setAttribute("id", "open-tab-icon" + numSunEditors);
        newTabIcon.innerHTML = "open_in_new";

        // Suneditor textarea
        let sunEditor = document.createElement("textarea");
        sunEditor.setAttribute("id", "sunEditor" + numSunEditors);

        activeTab.appendChild(title);
        activeTab.appendChild(newTabIcon);
        activeTab.appendChild(editIcon);
        activeTab.appendChild(doneIcon);
        activeTab.appendChild(sunEditor);

        doneIconList.push(doneIcon);
        editIconList.push(editIcon);
        newTabIconList.push(newTabIcon);

        // Remove empty state if necessary
        if (activeTab.childElementCount > 0) {
          document.querySelectorAll(".empty-state")[Number(tabName.slice(-1))-1].style.display = "none";
        }

        // Maintain a baseline height until 1200px is exceeded
        activeHeightObj[tabName] += 800;
        console.log(activeHeightObj[tabName]);
        checkActiveHeight()
        resolve();
    });
}

let sunEditor = {};
let sunEditorList = [];
const createSunEditor = async() => {
    await createTextArea();
    sunEditor["sunEditor"+numSunEditors] = SUNEDITOR.create("sunEditor" + numSunEditors, {
        toolbarContainer: "#toolbar_container",
        showPathLabel: false,
        defaultTag: "p",
        charCounter: true,
        charCounterLabel: "Char Count",
        width: "100%",
        height: "auto",
        minHeight: "800px",
        defaultStyle: "font-size:15px;",
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

      sunEditorList.push(sunEditor["sunEditor"+numSunEditors]);
}
/* END Suneditor Creation -----------------------------------------------------------*/

/* Drag and Drop ------------------------------------------------------------------------- */
/**
 * Modified version of : https://codepen.io/dcode-software/pen/xxwpLQo
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

        // Div that holds the thumbnail
        let mydiv = document.createElement('div');
        mydiv.className = "drop-zone-show";

        // Thumbnail element
        let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");

        // File input element
        let inputfile = document.createElement('input');
        inputfile.type = "file";
        inputfile.name = "resourceImageField";
        inputfile.className = "drop-zone__input";

        // File title element
        let inputTitle = document.createElement('input');
        inputTitle.type = "text";
        inputTitle.className = "drop-zone__title";

        // Preview Icon
        let previewIcon = document.createElement('span');
        previewIcon.setAttribute("class", "material-symbols-outlined");
        previewIcon.setAttribute("id", "preview-icon");
        previewIcon.innerHTML = "preview";

        // Check for filler space
        if (document.getElementById("filler-space")) {
            document.getElementById("filler-space").remove();
        }
        
        // Append the thumbnail to parent div
        // Set the title to the file name
        mydiv.appendChild(thumbnailElement);
        thumbnailElement.dataset.label = file.name;
        inputTitle.value = file.name;
        
        // Show thumbnail for image files
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
          
            reader.readAsDataURL(file);
            reader.onload = () => {
                thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
            };
            mydiv.style.height = "500px";
            activeHeightObj[tabName] += 500;
          } else {
              thumbnailElement.style.backgroundImage = 'url(assets/uploads/resource/file.png)';
              thumbnailElement.style.backgroundSize = "200px";
              mydiv.style.height = "200px";
              activeHeightObj[tabName] += 200;
          }

          mydiv.appendChild(inputfile);
          activeTab.appendChild(inputTitle);
          activeTab.appendChild(previewIcon);
          activeTab.appendChild(mydiv);

          // Remove empty state if necessary
          if (mydiv.childElementCount > 0) {
            document.querySelectorAll(".empty-state")[Number(tabName.slice(-1))-1].style.display = "none";
          }

          // Maintain a baseline height until 1200px is exceeded
          console.log(activeHeightObj[tabName])
          checkActiveHeight();
    }
  }
/* END Drag and Drop ------------------------------------------------------------------------- */



/* Suneditor Events ------------------------------------------------------*/
document.addEventListener("mousemove", function() {
    for (let i=0; i<sunEditorList.length; i++) {
        sunEditorList[i].onFocus = () => {
            document.getElementById(doneIconList[i].id).style.display = "block";
            document.getElementById(editIconList[i].id).style.display = "none";
            sunEditor["sunEditor"+(i+1)].readOnly(false);
        }
        sunEditorList[i].onChange = (contents, core) => {
            noteEditor.save();
          };
        sunEditorList[i].onKeyUp = (e) => {
            if (e.key == "/") {
                noteEditor.insertHTML(
                '<div><button style=background:pink;>Hello</button></div>',
                true
              );
            }
          };
        sunEditorList[i].onImageUpload = () => {
            // Image upload default does not automatically place cursor after image, so...
            noteEditor.appendContents("");
          };
    }
});
/* END Suneditor Events ------------------------------------------------------*/




document.addEventListener("click", function(e) {
  // toggle edit and done icons
  if ((e.target.id).includes("done")) {
      for (let i=0; i<doneIconList.length; i++) {
          if (doneIconList[i] === e.target) {
              document.getElementById(editIconList[i].id).style.display = "block";
              document.getElementById(doneIconList[i].id).style.display = "none";
              sunEditor["sunEditor"+(i+1)].readOnly(true);
          }
      }
  }
  if ((e.target.id).includes("edit")) {
      for (let i=0; i<editIconList.length; i++) {
          if (editIconList[i] === e.target) {
              document.getElementById(doneIconList[i].id).style.display = "block";
              document.getElementById(editIconList[i].id).style.display = "none";
              sunEditor["sunEditor"+(i+1)].readOnly(false);
          }
      }
  }

  // open suneditor in new tab
  if (e.target.id.includes("tab")) {
    window.open("http://localhost:4200/note", "_blank");
  }

  // close tag list elements
  if (document.querySelector(".tag-list") && document.querySelector(".tag-list").style.display == "block") {
      document.querySelector(".tag-list").style.display = "none";
      document.querySelector("#new-tag-element").style.display = "none";
      document.querySelector("#mySearch").value = "";
  }
  if (document.querySelector("#new-tag-element") && document.querySelector("#new-tag-element").style.display == "block") {
      document.querySelector(".tag-list").style.display = "none";
      document.querySelector("#new-tag-element").style.display = "none";
      document.querySelector("#mySearch").value = "";
  }
});



/* Workspace Manager Modal ----------------------------------------------- */
const modal = document.getElementById("resource-modal-div");
const openBtn = document.getElementById("new-resource");
const closeBtn = document.getElementById("close");
const createDoc = document.getElementById("create-doc-div");

// open the modal
openBtn.onclick = () => {
  modal.style.display = "block";
}

//close the modal
closeBtn.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// option hover events
document.addEventListener("mousemove", function(e) {
  for (let i=0; i<document.getElementsByClassName("modal-icon").length; i++) {
    if (e.target === document.getElementsByClassName("modal-icon")[i] ||
        e.target === document.getElementsByClassName("option")[i]) {
      document.getElementsByClassName("modal-icon")[i].style.color = "black";
      document.getElementsByClassName("option")[i].style.color = "black";
      document.getElementsByClassName("option")[i].style.textDecoration = "underline";
    } else {
      document.getElementsByClassName("modal-icon")[i].style.color = "rgb(100, 98, 98)";
      document.getElementsByClassName("option")[i].style.color = "rgb(100, 98, 98)";
      document.getElementsByClassName("option")[i].style.textDecoration = "none";
    }
  }
});

// option events
createDoc.onclick = () => {
  modal.style.display = "none";
  createSunEditor();
}
/* END Workspace Manager Modal ----------------------------------------------- */













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

const toggleProfileList = () => {
  let arrow = document.getElementById("profiles-toggle");

  if (arrow.classList.contains("down-arrow")) {
      document.getElementById("profiles-list").style.display = "none";
      arrow.setAttribute('class','arrow up-arrow');
  } else {
    document.getElementById("profiles-list").style.display = "block";
      arrow.setAttribute('class','arrow down-arrow');
  }
}

function toggleProfile (e) {
  let target = e.target;
  let box;

  target.classList.contains("permission-li") ? 
  box = target.childNodes[3] : 
  box = target.parentElement.childNodes[3];

  box.checked ?
  box.checked = false :
  box.checked = true;
}


document.getElementById("profiles-toggle").addEventListener("click", toggleProfileList);

var perms = document.getElementsByClassName("permission-li");

for (let i = 0; i < perms.length; i++) {
  perms[i].addEventListener("click", toggleProfile);
}

  