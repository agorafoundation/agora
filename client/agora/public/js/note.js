// Example note editor
let noteEditor = null;
if(document.getElementById('noteEditor')) {
    noteEditor = SUNEDITOR.create('noteEditor', {
        toolbarContainer : '#toolbar_container',
        showPathLabel : false,
        width : '1200px',
        maxWidth: '1500px',
        minHeight : '800px',
        maxHeight : '700px',
        defaultStyle: "font-size:22px;",
        buttonList : [
            ['undo', 'redo', 'font', 'fontSize', 'formatBlock'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'removeFormat'],
            ['fontColor', 'hiliteColor', 'outdent', 'indent', 'align', 'horizontalRule', 'list', 'table'],
            ['link', 'image', 'video', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save']
        ],
        callBackSave : function (contents, isChanged) {
            alert(contents);
            console.log(contents);
        }
    });

    noteEditor.onChange = (contents, core) => {
        noteEditor.save();
    };

    function auto_grow(element) {
        element.style.height = "5px";
        element.style.height = (element.scrollHeight)+"px";
    }
} 

const onClickTesting = () => {
    console.log("clicked");
}

const returnFiles = () => {
    return [{name: "file 1", onClick: onClickTesting()},{name: "file 2", onClick: onClickTesting()}];
}



// Show topic tools
document.getElementById("left-chevron").addEventListener("click", function() {
    document.getElementById("left-chevron").style.display = "none";
    document.querySelector(".show-tools").style.border = "none";

    document.querySelector(".right-chevron").style.display = "block";
    document.getElementById("tools-container").style.display = "flex";
    document.getElementById("tools").style.border = "thin solid black";
    document.querySelector(".hide-tools").style.border = "thin solid black";
});



// Hide topic tools
document.querySelector(".right-chevron").addEventListener("click", function() {
    document.querySelector(".right-chevron").style.display = "none";
    document.querySelector(".hide-tools").style.border = "none";

    document.getElementById("left-chevron").style.display = "block";
    document.getElementById("tools-container").style.display = "none";
    document.getElementById("tools").style.border = "none";
    document.querySelector(".show-tools").style.border = "thin solid black";
});

const fileName = document.querySelector(".file-display-name")
document.addEventListener("onload", function() {
    if (fileName.style.width > "1px") {
        alert("true");
    }
});



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



// Toggles the rendering of more options menu
const toggleMoreOptions = () => {
    if (document.getElementById('dropdown-content').getAttribute('style')) {
        document.getElementById('dropdown-content').setAttribute('style','');
    } else {
        document.getElementById('dropdown-content').setAttribute('style',"display: block; right: 2%; top: 4%");
    }
}



// If file modal is on, it turns off and vice versa
const toggleFileModal = () => {
    if (document.getElementById('file-display').getAttribute('class') === 'hidden') {
    document.getElementById('file-display').setAttribute('class','file-display-shown');
    } else {
    document.getElementById('file-display').setAttribute('class','hidden');
    } 
}



// Checks if someone is clicking off modal and then closes it
$('body').click(function (ev) {
    if (document.getElementById('file-display').getAttribute('class') !== 'hidden') {
        if (ev.target.id !== 'file-display-content' && ev.target.id !== 'show-files' && ev.target.id !== "file-display-name" && ev.target.id !== "file-display-icon" && ev.target.id !== "show-files" && ev.target.id !== 'new-file-icon' && ev.target.id !== 'new-file-coloring') {
        document.getElementById('file-display').setAttribute('class','hidden');
        }
    
    }
if (ev.target.id !== 'ellipsis')
    document.getElementById('dropdown-content').setAttribute('style','');
});

function myFunction() {
    let input, filter, ul, li, a, i;
    input = document.getElementById("mySearch");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myTags");
    li = ul.getElementsByTagName("li");

    if (filter == "") {
        ul.style.display = "none";
    } else {
        ul.style.display = "block";
        // Hide items that don't match search query
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("a")[0];
            if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "block";
            } else {
            li[i].style.display = "none";
            }
        }
        }
  }