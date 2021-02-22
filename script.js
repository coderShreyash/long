var database=firebase.database();
function extraf(){
    document.getElementById("i1").setAttribute('src',"extra.html");
}
function blogf(){
    document.getElementById("i1").setAttribute('src',"blog.html");
}
function community(){
    var naamo = getCookie("username");
    window.open("chat.html?"+naamo);
  }
