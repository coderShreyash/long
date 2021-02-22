  var database = firebase.database();
  function launch_toast() {
  var x = document.getElementById("toast")
  x.innerHTML="<div id='img'>Icon</div><div id='desc'>A notificatcion message..</div>"
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

function doIt(){
    var udata=null;
    database.ref("/"+getCookie("usernaam")+"/Tasks").on("value",function(data){
      udata=data.val();
      if(udata===null||udata===undefined){
        database.ref("/"+getCookie("usernaam")+"/").set({
        Tasks:0
        })
    }
    })  
}
setTimeout(function(){
    doIt()
},500);  


function addTask(){
  if(document.getElementById("task").value.trim()!==''){
   var name = getCookie("usernaam");
   var taks;
   database.ref("/"+getCookie("usernaam")+"/Tasks").on("value",function(data){
    taks=data.val();
   })
   taks++;
   var task = document.getElementById("task");
   database.ref("/"+name+"?Task/Task"+taks).set({
    
    Task:task.value.replace(" ","-"),
    date:Date().slice(0,24)
   })
   database.ref("/"+name).set({
       Tasks:taks
   })
   task.value="";
  }
  else{
   var task = document.getElementById("task");
    alert("Write Some Task Please !");
   task.value="";
  }
}
setInterval(function(){
    var num;
    var myTask;
    var myDate;
    database.ref("/"+getCookie("usernaam")+"/Tasks").on("value",function(data){
        num=data.val();
    })
        document.getElementById("allTasks").innerHTML="";
        for(var i=0;i<=num;i++){
            database.ref("/"+getCookie("usernaam")+"?Task/Task"+i+"/Task").on("value",function(data){
                myTask=data.val();
            })
            database.ref("/"+getCookie("usernaam")+"?Task/Task"+i+"/date").on("value",function(data){
                myDate=data.val();
            })
            if(myTask!==null){
             document.getElementById("allTasks").innerHTML+="<div class='tres' onclick=launchToast('"+myTask.replace(" ","-")+"')><h1>"+i+". "+myTask+"</h1><br><label>"+myDate+"</label><button onclick=rem("+i+")>Done</button></div>";
            }
    }
    
},1000)

document.getElementById('task').addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    addTask()
  }
});
function launchToast(mess) {
  var x = document.getElementById("toast")
  x.innerHTML="<div id='img'>Task</div><div id='desc'>"+mess+"</div>"
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
}
function rem(numb){
database.ref(getCookie("usernaam")+"?Task/Task"+numb).remove();
}