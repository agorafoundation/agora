// ************************ Drag and drop ***************** //
/**
 * Modified version of : https://codepen.io/dcode-software/pen/xxwpLQo
 *
 */
if (document.querySelectorAll(".drop-zone")) {
  document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => {
      inputElement.click();
    });

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

    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
      dropZoneElement.querySelector(".drop-zone__prompt").remove();
    }

    // First time - there is no thumbnail element, so lets create it
    if (!thumbnailElement) {
      thumbnailElement = document.createElement("div");
      thumbnailElement.classList.add("drop-zone__thumb");
      dropZoneElement.appendChild(thumbnailElement);
    }

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
  }
}

// ************************ END Drag and drop ***************** //

/**
 * Expand metadata area
 */
if (document.getElementById("expansionArrow")) {
  ["expansionArrow", "expansionArrowUp"].forEach((el) => {
    document.getElementById(el).addEventListener("click", () => {
      if (
        document.getElementById("additionalMetadata").style.display === "none"
      ) {
        document.getElementById("additionalMetadata").style.display = "block";
        document.getElementById("expansionArrow").style.display = "none";
        document.getElementById("expansionArrowUp").style.display = "block";
      } else {
        document.getElementById("additionalMetadata").style.display = "none";
        document.getElementById("expansionArrowUp").style.display = "none";
        document.getElementById("expansionArrow").style.display = "block";
      }
    });
  });
}

/**
 * When toggling resource types set the correct editor in the UI
 */
function toggleSunEditor() {
  console.log(
    "Type value is: " + document.getElementById("resourceType").value
  );
  if (document.getElementById("resourceType").value == "3") {
    document.getElementById("resourceEditor").style.display = "none";
    document.getElementById("suneditor_resourceEditor").style.display = "none";
    document.getElementById("embedded_submission_text_resource").style.display =
      "block";
  } else if (document.getElementById("resourceType").value == "2") {
    document.getElementById("resourceEditor").style.display = "none";
    document.getElementById("suneditor_resourceEditor").style.display = "none";
    document.getElementById("embedded_submission_text_resource").style.display =
      "none";
  } else {
    document.getElementById("resourceEditor").style.display = "none";
    document.getElementById("suneditor_resourceEditor").style.display = "block";
    document.getElementById("embedded_submission_text_resource").style.display =
      "none";
  }
}

// sun editor for resource
let resourceEditor = null;
if (document.getElementById("resourceEditor")) {
  console.log("initializing the sun editor");
  resourceEditor = SUNEDITOR.create("resourceEditor", {
    toolbarContainer: "#toolbar_container",
    showPathLabel: false,
    width: "auto",
    height: "auto",
    minHeight: "150px",
    maxHeight: "700px",
    buttonList: [
      ["undo", "redo", "font", "fontSize", "formatBlock"],
      [
        "bold",
        "underline",
        "italic",
        "strike",
        "subscript",
        "superscript",
        "removeFormat",
      ],
      [
        "fontColor",
        "hiliteColor",
        "outdent",
        "indent",
        "align",
        "horizontalRule",
        "list",
        "table",
      ],
      [
        "link",
        "image",
        "video",
        "fullScreen",
        "showBlocks",
        "codeView",
        "preview",
        "print",
        "save",
      ],
    ],
    callBackSave: function (contents, isChanged) {
      alert(contents);
      console.log(contents);
    },
  });

  resourceEditor.onChange = (contents, core) => {
    resourceEditor.save();
  };

  document.getElementById("resourceType").addEventListener("change", () => {
    toggleSunEditor();
  });

  function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = element.scrollHeight + "px";
  }
  toggleSunEditor();
}

if (
  document.getElementsByName("topicType") &&
  document.getElementsByName("topicType").length > 0
) {
  if (document.querySelector('input[name="topicType"]:checked').value == 1) {
    //console.log('1');
    document.getElementById("acivity-accordion-group").style.display = "block";
    document.getElementById("assessment-accordion-group").style.display =
      "block";
  } else {
    //console.log('2');
    document.getElementById("acivity-accordion-group").style.display = "none";
    document.getElementById("assessment-accordion-group").style.display =
      "none";
  }

  // attach the event to make them editible
  document.querySelectorAll('[name="topicType"]').forEach((topicTypeBox) => {
    topicTypeBox.addEventListener("click", () => {
      console.log(
        "clicked: " +
          document.querySelector('input[name="topicType"]:checked').value
      );
      if (
        document.querySelector('input[name="topicType"]:checked').value == 1
      ) {
        //console.log('1');
        document.getElementById("acivity-accordion-group").style.display =
          "block";
        document.getElementById("assessment-accordion-group").style.display =
          "block";
      } else {
        //console.log('2');
        // make sure option were not selected by cleaning them
        if (document.getElementById("topicHasAssessment").checked) {
          document.getElementById("assessment-accordion").click();
        }
        if (document.getElementById("topicHasActivity").checked) {
          document.getElementById("activity-accordion").click();
        }

        document.getElementById("acivity-accordion-group").style.display =
          "none";
        document.getElementById("assessment-accordion-group").style.display =
          "none";
      }
    });
  });
}

/**
 * The following two functions show or hide the assessment and activity panels and check the hasAssessment / hasAcitvity
 * checkbox based on whether the user interacts with the accordion
 * These areas only show if the topicType = educational
 */
if (document.getElementById("assessment-accordion")) {
  document
    .getElementById("assessment-accordion")
    .addEventListener("click", () => {
      document.getElementById("topicHasAssessment").checked =
        !document.getElementById("topicHasAssessment").checked;
    });
}

if (document.getElementById("activity-accordion")) {
  document
    .getElementById("activity-accordion")
    .addEventListener("click", () => {
      document.getElementById("topicHasActivity").checked =
        !document.getElementById("topicHasActivity").checked;
    });
}

/**
 * When user selects an existing goal that they wish to edit this function will populate the DOM
 * using the passed goal so the form is ready for modification of the object.
 * @param {*} goal <- goal used to popluate the form
 * @param {*} goalImagePath <- base path for the image url
 */
function updateGoalModal(goal, goalImagePath) {
  if (document.getElementById("create-goal-modal") && goal) {
    document.getElementById("goalId").value = goal.id;

    console.log(goal.visibility);
    if (goal.visibility === 0) {
      document.getElementById("goalVisibilityPrivate").checked = true;
      document.getElementById("goalVisibilityShared").checked = false;
      document.getElementById("goalVisibilityPublic").checked = false;
    } else if (goal.visibility === 1) {
      document.getElementById("goalVisibilityPrivate").checked = false;
      document.getElementById("goalVisibilityShared").checked = true;
      document.getElementById("goalVisibilityPublic").checked = false;
    } else if (goal.visibility === 2) {
      document.getElementById("goalVisibilityPrivate").checked = false;
      document.getElementById("goalVisibilityShared").checked = false;
      document.getElementById("goalVisibilityPublic").checked = true;
    }

    document.getElementById("goalVersion").value = goal.goalVersion;
    document.getElementById("goalName").value = goal.goalName;
    document.getElementById("goalDescription").value = goal.goalDescription;

    if (goal.goalImage) {
      document.getElementById("goalImageEl").src =
        goalImagePath + goal.goalImage;
    } else {
      document.getElementById("goalImageEl").src = "data:,";
      document.getElementById("formFile").value = "";
    }

    if (goal.active) {
      document.getElementById("goalActive").checked = true;
    } else {
      document.getElementById("goalActive").checked = false;
    }

    if (goal.completable) {
      document.getElementById("goalCompletable").checked = true;
    } else {
      document.getElementById("goalCompletable").checked = false;
    }
  }
}

/**
 * When user selects an existing topic that they wish to edit this function will populate the DOM
 * using the passed topic so the form is ready for modification of the object.
 * @param {*} topic <- topic used to popluate the form
 * @param {*} topicImagePath <- base path for the image url
 */
function updateTopicModal(topic, topicImagePath) {
  if (document.getElementById("create-topic-modal") && topic) {
    document.getElementById("topicId").value = topic.id;

    console.log(topic.visibility);
    if (topic.visibility === 0) {
      document.getElementById("topicVisibilityPrivate").checked = true;
      document.getElementById("topicVisibilityShared").checked = false;
      document.getElementById("topicVisibilityPublic").checked = false;
    } else if (topic.visibility === 1) {
      document.getElementById("topicVisibilityPrivate").checked = false;
      document.getElementById("topicVisibilityShared").checked = true;
      document.getElementById("topicVisibilityPublic").checked = false;
    } else if (topic.visibility === 2) {
      document.getElementById("topicVisibilityPrivate").checked = false;
      document.getElementById("topicVisibilityShared").checked = false;
      document.getElementById("topicVisibilityPublic").checked = true;
    }

    document.getElementById("topicName").value = topic.topicName;
    document.getElementById("topicDescription").value = topic.topicDescription;

    if (topic.topicImage) {
      document.getElementById("topicImage").src =
        topicImagePath + topic.topicImage;
    } else {
      document.getElementById("topicImage").src = "data:,";
      document.getElementById("formFile").value = "";
    }

    if (topic.active) {
      document.getElementById("topicActive").checked = true;
    } else {
      document.getElementById("topicActive").checked = false;
    }

    if (topic.completable) {
      document.getElementById("topicCompletable").checked = true;
    } else {
      document.getElementById("topicCompletable").checked = false;
    }
  }
}

function newResourceModel() {
  document.getElementById("resourceModified").value = false;
  document.getElementById("resourceId").value = -1;

  document.getElementById("resourceType").value = 1;
  document.getElementById("resourceVisibility").value = 2;

  document.getElementById("resourceActive").checked = true;
  document.getElementById("isRequired").checked = false;

  document.getElementById("resourceName").value = "";
  document.getElementById("resourceDescription").value = "";

  document.getElementById("resourceLink").value = "";

  // clear the contents of the wysiwyg editor
  resourceEditor.setContents("");

  if (document.querySelector(".drop-zone__thumb")) {
    document.querySelector(".drop-zone__thumb").remove();

    // add the prompt back in
    let prompt = document.createElement("span");
    prompt.className = "drop-zone__prompt";
    prompt.innerHTML = "Drop file here or click to upload";
    document.querySelector(".drop-zone").appendChild(prompt);
  }
}

/**
 * When user selects an existing resource that they wish to edit this function will populate the DOM
 * using the passed resource so the form is ready for modification of the object.
 * @param {*} resource <- resource used to popluate the form
 * @param {*} resourceImagePath <- base path for the image url
 */
function updateResourceModal(resourceId, resourceImagePath) {
  if (document.getElementById("create-resource-modal") && resourceId) {
    // fetch the resource
    fetch("/api/v1/auth/resources/" + resourceId).then((res) => {
      //console.log(JSON.stringify(res));
      res.json().then((data) => {
        const resource = data[0];
        console.log("Client side resource check: " + JSON.stringify(resource));
        document.getElementById("resourceId").value = resource.id;

        if (resource.resourceImage) {
          // set the modification flag
          document.getElementById("resourceModified").value = true;

          if (document.querySelectorAll(".drop-zone__input")) {
            const inputElement =
              document.querySelectorAll(".drop-zone__input")[0];
            const dropZoneElement = inputElement.closest(".drop-zone");
            let thumbnailElement =
              dropZoneElement.querySelector(".drop-zone__thumb");

            // First time - remove the prompt
            if (dropZoneElement.querySelector(".drop-zone__prompt")) {
              dropZoneElement.querySelector(".drop-zone__prompt").remove();
            }

            // First time - there is no thumbnail element, so lets create it
            if (!thumbnailElement) {
              thumbnailElement = document.createElement("div");
              thumbnailElement.classList.add("drop-zone__thumb");
              dropZoneElement.appendChild(thumbnailElement);
            }

            thumbnailElement.dataset.label = resource.resourceImage;
            thumbnailElement.style.backgroundImage = `url('${
              resourceImagePath + resource.resourceImage
            }')`;
          }
        } else {
          // clear
          if (document.querySelector(".drop-zone__thumb")) {
            document.querySelector(".drop-zone__thumb").remove();

            // add the prompt back in
            let prompt = document.createElement("span");
            prompt.className = "drop-zone__prompt";
            prompt.innerHTML = "Drop file here or click to upload";
            document.querySelector(".drop-zone").appendChild(prompt);
          }
        }

        document.getElementById("resourceType").value = resource.resourceType;
        document.getElementById("resourceVisibility").value =
          resource.visibility;

        if (resource.active) {
          document.getElementById("resourceActive").checked = true;
        } else {
          document.getElementById("resourceActive").checked = false;
        }

        if (resource.isRequired) {
          document.getElementById("isRequired").checked = true;
        } else {
          document.getElementById("isRequired").checked = false;
        }

        document.getElementById("resourceName").value = resource.resourceName;
        document.getElementById("resourceDescription").value =
          resource.resourceDescription;

        // add the html text to the wysiwyg editor
        resourceEditor.setContents(resource.resourceContentHtml);
        document.getElementById("resourceLink").value = resource.resourceLink;

        toggleSunEditor();
      });
    });
  }
}

/**
 *
 */
function deleteGoal() {
  // double check the user is sure!!
  console.log("stub to delete goal ");
}

/**
 *
 */
function addFilter() {
  console.log("this will add a filter");
}

/* note-gallery edit modal */
function viewModal(id, name, desc) {
  let nameId = "card-title-" + id;
  let descId = "card-desc-" + id;
  document.getElementById("viewModalLabel").textContent =
    document.getElementById(nameId).textContent;
  document.getElementById("note-modal-description").textContent =
    document.getElementById(descId).textContent;
}

    /*more options toggle*/
    function toggleMoreOptionsOn(id) {
        let dropId = "option-" + id;
        document.getElementById(dropId).setAttribute('style','visibility: visible');
    }

    function toggleMoreOptionsOff(id) {
        let dropId = "option-" + id;
        document.getElementById(dropId).setAttribute('style','visibility: hidden');
    }

    /*page view toggle*/
    var toggleGoalView = () => {
    const input = document.querySelector(".form-control");
        const cards = document.getElementsByClassName("col");
        for (let i = 0; i < cards.length; i++) {
            let title = cards[i].querySelector(".card-body");
            if(title.id === "add" ){
                cards[i].classList.remove("d-none");
            } else if (title.id === 'goal' ) {
                cards[i].classList.remove("d-none")
            } else {
                cards[i].classList.add("d-none")
            }
        }
    } 

    var toggleTopicView = () => {
        const input = document.querySelector(".form-control");
        const cards = document.getElementsByClassName("col");
        let filter = input.value;
        for (let i = 1; i < cards.length; i++) {
            let title = cards[i].querySelector(".card-body");
            if(title.id === "add" ){
                cards[i].classList.remove("d-none");
            } else if (title.id === 'topic' ) {
                cards[i].classList.remove("d-none")
            } else {
            cards[i].classList.add("d-none")
            }
        }
    }

    var toggleAllView = () => {
        const input = document.querySelector(".form-control");
        const cards = document.getElementsByClassName("col");
        let filter = input.value;
        for (let i = 0; i < cards.length; i++) {
            let title = cards[i].querySelector(".card-body");
            cards[i].classList.remove("d-none");
        }
    }

    
    /*$('.dropdown-content').on('click', function (ev) {
      ev.stopPropagation();
    });

    $('.dropbtn').on('click', function (ev) {
        ev.stopPropagation();
    });*/


    /*Updating the rename modal*/

    //changing the properties of the save button of the rename-modal depending on the selected card
    var updateSaveButton = (nameId, descId) => {
        let tempName = document.getElementById('note-modal-name').value;
        if (tempName) {
            document.getElementById(nameId).innerText = tempName;
            document.getElementById(descId).innerText = document.getElementById('note-modal-description').value;
            document.getElementById("rename-modal").style.display = 'none';
            document.getElementsByClassName("modal-backdrop")[0].style.display = 'none';
        } else {
            window.alert("All goals/topics must have a name");
        }
    }

    //updating the input DOM of the rename-modal depending on the selected card
    const fillNameandDescription = async (e) => { 
        let parent = e.target.parentElement.parentElement.parentElement.id;
        let parentId = parent.charAt(parent.length - 1);
        let parentNameId = "card-title-" + parentId;
        let parentDescId = "card-desc-" + parentId;
        
        let parentName = document.getElementById(parentNameId).innerText;
        let parentDesc = document.getElementById(parentDescId).innerText;
        console.log(parentDesc)

        document.getElementById('save-name').setAttribute("onclick",`updateSaveButton(${JSON.stringify(parentNameId)},${JSON.stringify(parentDescId)})`);
    
        if (parentName) {
            document.getElementById('note-modal-name').value = parentName;
        }
        if (parentDesc) {
            document.getElementById('note-modal-description').value = parentDesc;
        } else {
            document.getElementById('note-modal-description').value = "";
        }
    }
  
    //A collection of all the rename buttons
    var cards = document.querySelectorAll('#rename-card').forEach((card)=> {
        card.addEventListener("click", fillNameandDescription);
    })

    //Triggers when the "x" on the rename-modal is clicked
    const removeText = (type) => {
        document.getElementById('remove-name').style = "outline: none; border: none";
        document.getElementById('remove-desc').style = "outline: none; border: none";
        if (type === "name") {
          document.getElementById('note-modal-name').value = "";
        } else if (type === "desc") {
          document.getElementById('note-modal-description').value = "";
        }
      }

    
 
