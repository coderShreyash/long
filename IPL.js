var database=firebase.database();
var year;
setInterval(function(){
year = document.getElementById("year").value;
database.ref("/"+year.slice(5,9)+"/").on("value",function(data){
    document.getElementById("res").innerHTML="<h1>🎊</h1><br>"+"🏆1. "+data.val()[1]+"<Br>🥈2. "+data.val()[2]+"<Br>🥉3. "+data.val()[3]+"<Br>4. "+data.val()[4]+"<Br>5. "+data.val()[5]+"<Br>6. "+data.val()[6]+"<Br>7. "+data.val()[7]+"<Br>8. "+data.val()[8];
})
},1000)
