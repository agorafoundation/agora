let noteEditor = null;
if(document.getElementById('noteEditor')) {
    noteEditor = SUNEDITOR.create('noteEditor', {
        toolbarContainer : '#toolbar_container',
        showPathLabel : false,
        width : '1200px',
        maxWidth: '1500px',
        minHeight : '800px',
        maxHeight : '700px',
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

document.getElementById("left-chevron").addEventListener("click", function() {
    document.getElementById("left-chevron").style.display = "none";
    document.querySelector(".show-tools").style.border = "none";

    document.querySelector(".right-chevron").style.display = "block";
    document.getElementById("tools-container").style.display = "flex";
    document.getElementById("tools").style.border = "thin solid black";
    document.querySelector(".hide-tools").style.border = "thin solid black";
});

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
