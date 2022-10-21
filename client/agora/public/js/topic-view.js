/* Tab Functions ------------------------------------------------------------------- */

// First topic is active tab for now
let activeTab = document.getElementById("resources-zone1");

// Change tabs
function openTab(evt, tabName) {
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

  activeTab = document.getElementById("resources-zone" + tabName.slice(-1));

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
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


// Workspace resizing only works for topic1 right now
let activeHeight = 0;

// Implemented to ensure resources fill a 1200px space first 
// And then page grows as needed
function checkActiveHeight() {
    if (activeHeight < 1200) {
        let filler = document.createElement("div");
        filler.setAttribute("id", "filler-space");
        filler.style.height = (1200-activeHeight) + "px";
        activeTab.appendChild(filler);
    }
}


let numSunEditors = 0;
let doneIconList = [];
let editIconList = [];
function createTextArea() {
    return new Promise((resolve, reject) => {
        numSunEditors++;

        // Check for filler space
        if (document.getElementById("filler-space")) {
            console.log("true")
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
        doneIcon.setAttribute("id", "done-icon" +numSunEditors);
        doneIcon.innerHTML = "done";

        let sunEditor = document.createElement("textarea");
        sunEditor.setAttribute("id", "sunEditor" + numSunEditors);

        activeTab.appendChild(title);
        activeTab.appendChild(editIcon);
        activeTab.appendChild(doneIcon);
        activeTab.appendChild(sunEditor);

        doneIconList.push(doneIcon);
        editIconList.push(editIcon);

        // Hide the empty state
        document.querySelector(".empty-state").style.display = "none"; 

        // Maintain a baseline height until 1200px is exceeded
        activeHeight += 800;
        console.log(activeHeight);
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
            console.log("true");
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
                thumbnailElement.style.backgroundSize = "1000px";
                thumbnailElement.style.backgroundRepeat = "no-repeat";

            };
          
          } else {
              thumbnailElement.style.backgroundImage = null;
          }

          mydiv.appendChild(inputfile);
          activeTab.appendChild(inputTitle);
          activeTab.appendChild(previewIcon);
          activeTab.appendChild(mydiv);

          // Remove empty state if there are resources
          if (mydiv.childElementCount > 0) {
            document.querySelector(".empty-state").style.display = "none";
          }

          // Maintain a baseline height until 1200px is exceeded
          activeHeight += 500;
          console.log(activeHeight)
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