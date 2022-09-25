let noteEditor = null;
if(document.getElementById('noteEditor')) {
    noteEditor = SUNEDITOR.create('noteEditor', {
        toolbarContainer : '#toolbar_container',
        showPathLabel : false,
        width : '900px',
        maxWidth: '1000px',
        minHeight : '500px',
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
