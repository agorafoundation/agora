// Workspace resizing
let activeHeightObj = {};
let activeHeightList = [];

// Creates a height object for each open topic
function createNewActiveHeight() {
  let tabElements = document.querySelectorAll('.tabcontent');
  activeHeightObj[tabElements[tabElements.length-1].id] = 0;
  activeHeightList.push(activeHeightObj[tabElements[tabElements.length-1].id]);
}


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
// Workspace empty state
let activeTab = document.getElementById("resources-zone0");


// Change tabs
function openTab(name) {
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

  // Show the current tab
  document.getElementById(name).style.display = "block";

  // Set tab button to active
  for (i=0; i<tablinks.length; i++) {
    if (tablinks[i].id.slice(-1) == name.slice(-1)) {
      tablinks[i].className += " active";
      tablinks[i].style.backgroundColor = "#ddd";
    }
  }
}

let currTopicID = 1;
function createTopic() {
  let tabContent = document.getElementsByClassName("tabcontent");
  let lastTab = tabContent[tabContent.length-1];
  let newTab = document.createElement("div");

  // Create the tab content and append to last tab
  newTab.id = "topic" + currTopicID;
  newTab.className = "tabcontent";

  // If no topics are open...
  if (lastTab == null) {
    let workspaceEmptyState = document.getElementById("workspace-empty-state")
    workspaceEmptyState.parentNode.insertBefore(newTab, workspaceEmptyState.nextSibling);
    workspaceEmptyState.style.display = "none";
  } else {
    lastTab.parentNode.insertBefore(newTab, lastTab.nextSibling);
  }

  // Create all elements within a topic
  let topicContent = document.createElement("div");
  topicContent.className = "topic-content";

  let resourcesZone = document.createElement("div");
  resourcesZone.id = "resources-zone" + currTopicID;
  resourcesZone.className = "resources-zone";

  let emptyState = document.createElement("div");
  emptyState.className = "empty-state";

  let label1 = document.createElement("label");
  label1.className = "empty-state-text";
  let header = document.createElement("h3");
  header.innerHTML = "Your Topic is Empty";
  label1.appendChild(header);

  let label2 = document.createElement("label");
  label2.className = "empty-state-text";
  label2.innerHTML = "Drop a file or tap the + above to get started!";

  // Create a new tab button
  let tabBtn = document.createElement("button");
  tabBtn.className = "tablinks";
  tabBtn.id = "tablinks" + currTopicID;
  tabBtn.innerHTML = "Topic " + currTopicID;

  // Create close tab button
  let closeTabBtn = document.createElement("span");
  closeTabBtn.className = "close-tab";
  closeTabBtn.id = "close-tab" + currTopicID;
  closeTabBtn.innerHTML = "&times;";
  tabBtn.appendChild(closeTabBtn);

  tabBtn.onclick = (e) => {
    if (e.target.className.includes("close-tab")) {
      closeTab(e.target.id);
    } else {
      openTab(newTab.id);
    }
  }

  let currTabs = document.querySelector(".tab");
  currTabs.appendChild(tabBtn);


  // Append all elements accordingly
  newTab.appendChild(topicContent);
  topicContent.appendChild(resourcesZone);
  resourcesZone.appendChild(emptyState);
  emptyState.appendChild(label1);
  emptyState.appendChild(label2);

  currTopicID++;
  createNewActiveHeight();
  openTab(newTab.id);
}

function closeTab(id) {
  let tabContent = document.getElementsByClassName("tabcontent");
  let tablinks = document.getElementsByClassName("tablinks");
  let isActiveTab = false;
  let tabLocation = -1;

  let i = 0;
  while (i<tabContent.length) {
    // Find the tab content to be deleted
    if (tabContent[i].id.slice(-1) == id.slice(-1)) {
      // Check if the target tab is the active tab
      if (id.slice(-1) == activeTab.id.slice(-1)) {
        isActiveTab = true;
      }
      tabLocation = i;
    }
    i++;
  }

  if (isActiveTab) {
    if (tabLocation+1 != tabContent.length) {                                               // Open the tab to the right if there is one
      openTab(tabContent[tabLocation+1].id)
    } else if (tabLocation-1 >= 0) {                                                        // Otherwise, open the tab to the left
        openTab(tabContent[tabLocation-1].id)
    } else if (tabLocation-1 < 0) {                                                         // Show the workspace empty state if closing only open tab
        document.getElementById("workspace-empty-state").style.display = "block";
    }
  }
  // Remove tab button and tab content
  // Closing non-active tabs doesn't change the active tab
  tablinks[tabLocation].remove();
  tabContent[tabLocation].remove();
}

function getTabLocation(id) {
  let tabContent = document.getElementsByClassName("tabcontent");
  let location = -1;
  for (let i=0; i<tabContent.length; i++) {
    if (tabContent[i].id.slice(-1) == id.slice(-1)) {
      location = i;
    }
  }
  return location;
}
/* END Tab Functions ------------------------------------------------------------------- */



/* Tag Functions ------------------------------------------------------------------- */
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
/* END Tag Functions ------------------------------------------------------------------- */




/* Suneditor Creation -----------------------------------------------------------*/
let numSunEditors = 0;
let doneIconList = [];
let editIconList = [];
let newTabIconList = [];
function createTextArea() {
  // Text area has to be created before suneditor initialization, 
  // so we have to return a promise indicating whether or not text area has been successfully created
  let promise =  new Promise((resolve) => {
      // workspace empty state
      if (activeTab.id == "resources-zone0") {
        createTopic();
      }
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
        let location = getTabLocation(tabName);
        // location+1 bc of workspace empty state at location 0
        document.querySelectorAll(".empty-state")[location+1].style.display = "none";
      }

      // Maintain a baseline height until 1200px is exceeded
      activeHeightObj[tabName] += 800;
      checkActiveHeight()
      resolve("TA created");
  });

  promise.then(
    (value) => {
      console.log(value);
      createSunEditor();
    }
  );
}

let sunEditor = {};
let sunEditorList = [];
const createSunEditor = async() => {
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
      if (activeTab.id == "resources-zone0") {
        createTopic()
      } 
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
          let location = getTabLocation(tabName);
          // location+1 bc of workspace empty state at location 0
          document.querySelectorAll(".empty-state")[location+1].style.display = "none";
        }

        // Maintain a baseline height until 1200px is exceeded
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
  if (e.target.id.includes("open-tab")) {
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
const openBtn = document.getElementById("new-element");
const closeBtn = document.getElementById("close");
const createDocBtn = document.getElementById("create-doc-div");
const createTopicBtn = document.getElementById("create-topic-div");

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
createDocBtn.onclick = () => {
  modal.style.display = "none";
  // createSunEditor();
  createTextArea();
}
createTopicBtn.onclick = () => {
  modal.style.display = "none";
  createTopic();
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