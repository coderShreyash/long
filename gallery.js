var numItemsToGenerate = 10; //how many gallery items you want on the screen
var numImagesAvailable = 242; //how many total images are in the collection you are pulling from
var imageWidth = 480; //your desired image width in pixels
var imageHeight = 480; //desired image height in pixels
var collectionID = 1163637; //the collection ID from the original url
var galleryContainer = document.getElementById('gallery-container');
var tophe = document.body.clientHeight-160;
var lefte = document.body.offsetWidth/2-50;
document.getElementById("bottom").style.marginTop=tophe;
document.getElementById("tope").style.marginTop=tophe;
document.getElementById("tope").style.left="0px";
document.getElementById("bottom").style.right="0px";
document.getElementById("tope").style.position="fixed";
document.getElementById("bottom").style.position="fixed";




function bot(){
tophe = document.body.clientHeight-160;
lefte = document.body.offsetWidth/2-70;
document.getElementById("bottom").style.marginTop=tophe;
document.getElementById("tope").style.marginTop=tophe;
document.getElementById("tope").style.marginRight=lefte;
document.getElementById("bottom").style.marginLeft=lefte;
document.getElementById("tope").style.position="fixed";
document.getElementById("bottom").style.position="fixed";

}
var mybutton = document.getElementById("tope");

function renderGalleryItem(randomNumber){
  fetch(`https://source.unsplash.com/collection/${collectionID}/${imageWidth}x${imageHeight}/?sig=${randomNumber}`) 
    .then((response)=> {    
      let galleryItem;
      galleryItem = `
      <a href="${response.url+".jpg"} class='gallery-item' " download>
        <img class="gallery-image" src="${response.url}">
        </a>
      `
     

      galleryContainer.innerHTML+=galleryItem
    })
}

  for(let i=0;i<numItemsToGenerate;i++){
  let randomImageIndex = Math.floor(Math.random() * numImagesAvailable);
  renderGalleryItem(randomImageIndex);
}


function image(){ 
    galleryContainer.innerHTML="";
numItemsToGenerate=parseInt(document.getElementById("images").value);
for(let i=0;i<numItemsToGenerate;i++){
    let randomImageIndex = Math.floor(Math.random() * numImagesAvailable);
    renderGalleryItem(randomImageIndex);
  }
}
function bottom(){
    document.body.scrollTop+=1e+30;
}
function tope(){
    document.body.scrollTop=0;
}
