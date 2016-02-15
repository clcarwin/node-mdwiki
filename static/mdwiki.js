function search_text()
{
  var searchtext = prompt("Please enter the search text!", "");
  if(!searchtext) return;
  searchtext = searchtext.trim();
  if(searchtext.length<3){ alert("The search text too short!"); return; }

  var formData = new FormData();
  formData.append("search",searchtext);
  formData.append("mdpath",mdpath);

  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
      if (request.readyState == XMLHttpRequest.DONE) {
        var html = request.responseText;
        $('#show').html(html);
      }
  }

  request.open("POST", "/search.jssp");
  request.send(formData);
}

function login()
{
    var html = '<div id="logindiv" style="position: fixed; top:0; left:0; width:100%; height:100%; z-index:100;'+
      'background:rgba(255,255, 255, 0.9);">' +
      '<div style="position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%); padding:.5em; background:white"><fieldset>' +
      '<legend>Login</legend>' +
      '<span>Username: </span><input type="text" style="float:right" value=""><br>' +
      '<span>Password: </span><input type="password"style="float:right"><br>' +
      '<button onclick="logincancel()">Cancel</button>  <button onclick="loginsubmit()">Login</button>' +
      '</fieldset></div></div>';
    var div = $(html);
    $('body').prepend(div);
    if(userdefault) { $('#logindiv input')[0].value=userdefault; $('#logindiv input')[1].focus(); }
    else $('#logindiv input')[0].focus();

    $($('#logindiv input')[1]).keypress(function(e){
      if(e.keyCode==13) loginsubmit();
    });
}
function logincancel()
{
    $('#logindiv').remove();
}
function loginsubmit()
{
    var name = $('#logindiv input')[0].value;
    if(!name) { $($('#logindiv input')[0]).css("background","red"); return; }

    var password = $('#logindiv input')[1].value;
    password = md5('_mdwiki_'+password+'_mdwiki_');

    $.get( "/user.jssp?op=login&name="+name+"&password="+password, function(data)
    {
        if('loginerror'==data)
        {
            $('#logindiv input').css("background","red");
            $('#logindiv legend').html('Username or Password Error')
        }else
        if('needsetpassword'==data)
        {
            password = prompt("The "+name+"'s password is empty, please enter the new password!","");
            if(!password) { logout('silent'); return; }
            password = md5('_mdwiki_'+password+'_mdwiki_');
            changepassword(name,password,function(data)
            {
                location.reload();
            });
        }else
        if('ok'==data) { location.reload() }
        else alert('Unknown Error: '+data);
    });
}
function logout(silent)
{
    if(!silent) var ret = confirm("Do you really want to logout?");
    if(!silent) if(!ret) return;
    $.get( "/user.jssp?op=logout", function(data)
    {
        location.reload();
    });
}
function changepassword(name,password,cb)
{
    $.get( "/user.jssp?op=add&name="+name+"&password="+password, function(data)
    {
        if(cb) cb(data);
    });
}

function admin()
{
    var html = '<div id="admindiv" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:100;'+
      'background:rgba(255,255,255,0.9);">' +
      '<div style="position:fixed; top:20%; left:50%; transform:translate(-50%,-50%); padding:.5em; background:white">' +
      'user: <span></span><br>' +
      'mode: <span>everyone, loginedit, loginview</span><br><br>' +
      '<button onclick="adduser()">Add User</button>  <button onclick="deluser()">Delete User</button>  ' +
      '<button onclick="wikimode()">Wiki Mode</button>  <button onclick="wikiname()">Wiki Name</button>  <br>' +
      '<button onclick="logout()">Logout</button>' +
      '</div></div>';
    var div = $(html);
    $('body').prepend(div);
    $.get( "/user.jssp?op=list", function(data){ $($('#admindiv span')[0]).html(data) });
}
function adduser()
{
    var name = prompt("Please enter the new username!","");
    if(!name) { location.reload(); return; }
    var reg = /^[a-zA-Z0-9]+$/;
    if(!name.match(reg)) { alert('Only a-z A-Z 0-9 can be used for name!'); location.reload(); return; }
    changepassword(name,'',function(data)
    {
        if('ok'==data) alert('Add user successful!');
        else alert('Add user error: '+data);
        location.reload();
    });
}
function deluser()
{
    var name = prompt("Please enter the username will be deleted!","");
    if(!name) { location.reload(); return; }
    $.get( "/user.jssp?op=delete&name="+name, function(data)
    {
        if('ok'==data) alert('Delete user successful!');
        else if('lastusererror'==data) alert('Last user can not be deleted!');
        else alert('Delete user error: '+data);
        location.reload();
    });
}
function wikimode()
{
    var mode = prompt("Please enter the new wikimode!","");
    if(!mode) { location.reload(); return; }
    $.get( "/user.jssp?op=setmode&mode="+mode, function(data)
    {
        if('ok'==data) alert('Set new mode successful!');
        else alert('Set new mode error: '+data);
        location.reload();
    });
}
function wikiname()
{
    var name = prompt("Please enter the new wiki's name!","");
    if(null==name) { location.reload(); return; }
    $.get( "/user.jssp?op=setwikiname&wikiname="+name, function(data)
    {
        if('ok'==data) alert("Set new wiki's name successful!");
        else alert('Set new name error: '+data);
        location.reload();
    });
}


//edit

function postfile()
{
  var mdtext = editor.session.getValue();
  var mdhtml = mdc.render(mdtext);
  var mdpath = $('#textdata').attr('data-path');
  var lovinview = $('#loginviewcheck')[0].checked;

  var formData = new FormData();
  formData.append("mdtext",mdtext);
  formData.append("mdhtml",mdhtml);
  formData.append("mdpath",mdpath);
  if(lovinview) formData.append("loginview","true");

  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
      if (request.readyState == XMLHttpRequest.DONE) {
          if('ok'!=request.responseText) alert('Save Error: '+request.responseText);
          window.location.href = mdpath;
      }
  }

  request.open("POST", "/postmd.jssp");
  request.send(formData);
}

function cancelfile()
{
  var mdpath = $('#textdata').attr('data-path');
  window.location.href = mdpath;
}


function handleFiles(files,method)
{
  var mdpath = $('#textdata').attr('data-path');
  var formData = new FormData();
  formData.append("upload",files[0],files[0].name);
  formData.append("mdpath",mdpath);
  var request = new XMLHttpRequest();
  request.upload.addEventListener("progress", postprogress);
  request.onreadystatechange = function() {
      if (request.readyState == XMLHttpRequest.DONE) {
        var html = request.responseText;
        $('.filelist').html(html);
        fileElem.value = '';  //clear file input
        $('#fileSelect').html('Upload');

        //auto insert when paste and drop
        if((method=='paste')||(method=='drop')) ii(undefined,mdpath,files[0].name);
      }
  }

  request.open("POST", "/upload.jssp");
  request.send(formData);
}
function postprogress(event)
{
  if (event.lengthComputable)
  {
    var percentComplete = event.loaded / event.total;
    $('#fileSelect').html(' ' + Math.floor(percentComplete*100)+'%');
  }
}

function ii(obj,mdpath,filename)
{
  var ext = filename.slice(-4);
  ext = ext.toLowerCase();
  var pre = "";

  if(['.png','.jpg','.bmp','.gif','jpeg'].indexOf(ext)>=0) pre="!";
  editor.insert("\n"+pre+"["+filename+"](/a"+mdpath+"/"+filename+")\n");
}
function ii2(obj,mdpath,filename)
{
  var html = '\n<img src="/a'+mdpath+'/'+filename+'" width="500">\n';
  editor.insert(html);
}
function pp(obj,mdpath,filename)
{
  var formData = new FormData();
  formData.append("filename",filename);
  formData.append("mdpath",mdpath);

  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
      if (request.readyState == XMLHttpRequest.DONE) {
        var html = request.responseText;
        $('.filelist').html(html);
      }
  }

  request.open("POST", "/delete.jssp");
  request.send(formData);
}

function pasteimageupload(event) {
  // use event.originalEvent.clipboard for newer chrome versions
  var items = (event.clipboardData  || event.originalEvent.clipboardData).items;
  var blob = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") === 0) {
      blob = items[i].getAsFile();
    }
  }
  if(!blob) return;

  // load image if there is a pasted image
  var reader = new FileReader();
  reader.onload = function(event) {
    var dataurl = event.target.result;
    //console.log(event.target.result); // data url!
    uploadpasteimage(dataurl,blob);
  };
  reader.readAsDataURL(blob);
}
function uploadpasteimage(dataurl,blob)
{
  var img = document.createElement('img');
  img.src= dataurl;
  img = $(img);
  img.addClass('pasteimagepreview');
  img.css('position','absolute');
  img.css('z-index','100');
  img.css('width','50%');
  img.css('background','#fff');
  $('body').prepend(img);

  setTimeout(function()
  {
    var w = img.get(0).naturalWidth;
    var h = img.get(0).naturalHeight;
    var imagename = prompt("Please enter the image's name! "+w+"x"+h, "");
    img.remove();
    if(!imagename) return;
    if(imagename.indexOf('.')<0) imagename = imagename + '.png';
    blob.name = imagename;
    handleFiles([blob],'paste');
  },0);
}





