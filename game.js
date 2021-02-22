if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  
}else{
 pclap();
}
var Win = new Audio("Win.mp3");
var click = new Audio("click.mp3");
var devil = new Audio("Devil.wav");

Math.minmax = (value, limit) => {
 return Math.max(Math.min(value, limit), -limit);
};

const distance2D = (p1, p2) => {
 return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
};

// Angle between the two points
const getAngle = (p1, p2) => {
 let angle = Math.atan((p2.y - p1.y) / (p2.x - p1.x));
 if (p2.x - p1.x < 0) angle += Math.PI;
 return angle;
};

// The closest a ball and a wall cap can be
const closestItCanBe = (cap, ball) => {
 let angle = getAngle(cap, ball);

 const deltaX = Math.cos(angle) * (wallW / 2 + ballSize / 2);
 const deltaY = Math.sin(angle) * (wallW / 2 + ballSize / 2);

 return { x: cap.x + deltaX, y: cap.y + deltaY };
};

// Roll the ball around the wall cap
const rollAroundCap = (cap, ball) => {
 // The direction the ball can't move any further because the wall holds it back
 let impactAngle = getAngle(ball, cap);

 // The direction the ball wants to move based on it's velocity
 let heading = getAngle(
   { x: 0, y: 0 },
   { x: ball.velocityX, y: ball.velocityY }
 );

 // The angle between the impact direction and the ball's desired direction
 // The smaller this angle is, the bigger the impact
 // The closer it is to 90 degrees the smoother it gets (at 90 there would be no collision)
 let impactHeadingAngle = impactAngle - heading;

 // Velocity distance if not hit would have occurred
 const velocityMagnitude = distance2D(
   { x: 0, y: 0 },
   { x: ball.velocityX, y: ball.velocityY }
 );
 // Velocity component diagonal to the impact
 const velocityMagnitudeDiagonalToTheImpact =
   Math.sin(impactHeadingAngle) * velocityMagnitude;

 // How far should the ball be from the wall cap
 const closestDistance = wallW / 2 + ballSize / 2;

 const rotationAngle = Math.atan(
   velocityMagnitudeDiagonalToTheImpact / closestDistance
 );

 const deltaFromCap = {
   x: Math.cos(impactAngle + Math.PI - rotationAngle) * closestDistance,
   y: Math.sin(impactAngle + Math.PI - rotationAngle) * closestDistance
 };

 const x = ball.x;
 const y = ball.y;
 const velocityX = ball.x - (cap.x + deltaFromCap.x);
 const velocityY = ball.y - (cap.y + deltaFromCap.y);
 const nextX = x + velocityX;
 const nextY = y + velocityY;

 return { x, y, velocityX, velocityY, nextX, nextY };
};

// Decreases the absolute value of a number but keeps it's sign, doesn't go below abs 0
const slow = (number, difference) => {
 if (Math.abs(number) <= difference) return 0;
 if (number > difference) return number - difference;
 return number + difference;
};

const mazeElement = document.getElementById("maze");
const joystickHeadElement = document.getElementById("joystick-head");
const noteElement = document.getElementById("note"); // Note element for instructions and game won, game failed texts

let hardMode = false;
let previousTimestamp;
let gameInProgress;
let mouseStartX;
let mouseStartY;
let accelerationX;
let accelerationY;
let frictionX;
let frictionY;

const pathW = 25; // Path width
const wallW = 10; // Wall width
const ballSize = 10; // Width and height of the ball
const holeSize = 18;

const debugMode = false;

let balls = [];
let ballElements = [];
let holeElements = [];

resetGame();

// Draw balls for the first time
balls.forEach(({ x, y }) => {
 const ball = document.createElement("div");
 ball.setAttribute("class", "ball");
 ball.style.cssText = `left: ${x}px; top: ${y}px; `;

 mazeElement.appendChild(ball);
 ballElements.push(ball);
});

// Wall metadata
const walls = [
 // Border
 { column: 0, row: 0, horizontal: true, length: 10 },
 { column: 0, row: 0, horizontal: false, length: 9 },
 { column: 0, row: 9, horizontal: true, length: 10 },
 { column: 10, row: 0, horizontal: false, length: 9 },

 { column: 1, row: 1, horizontal: true, length: 1},
 { column: 4, row: 1, horizontal: true, length: 5},
 { column: 9, row: 3, horizontal: false, length: 5},
 { column: 4, row: 8, horizontal: true, length: 5},

 { column: 1, row: 8, horizontal: true, length: 2},
 { column: 1, row: 1, horizontal: false, length: 3},
 { column: 4, row: 8, horizontal: false, length: 1},
 { column: 2, row: 1, horizontal: false, length: 6},

 { column: 2, row: 7, horizontal: true, length: 1},
 { column: 1, row: 6, horizontal: true, length: 1},
 { column: 1, row: 6, horizontal: false, length: 2},
 { column: 9, row: 1, horizontal: false, length: 1},

 { column: 9, row: 2, horizontal: true, length: 1},
 { column: 5, row: 1, horizontal: false, length: 1},
 { column: 5, row: 2, horizontal: true, length: 3},
 { column: 8, row: 2, horizontal: false, length: 5},

 { column: 9, row: 1, horizontal: false, length: 1},
 { column: 4, row: 7, horizontal: true, length: 4},
 { column: 4, row: 6, horizontal: false, length: 1},
 { column: 7, row: 3, horizontal: false, length: 3},

 { column: 3, row: 5, horizontal: false, length: 1},
 { column: 5, row: 5, horizontal: false, length: 1},
 { column: 3, row: 6, horizontal: true, length: 2},
 { column: 3, row: 3, horizontal: true, length: 4},

 { column: 2, row: 2, horizontal: true, length: 2},
 { column: 4, row: 3, horizontal: false, length: 1},



].map((wall) => ({
 x: wall.column * (pathW + wallW),
 y: wall.row * (pathW + wallW),
 horizontal: wall.horizontal,
 length: wall.length * (pathW + wallW)
}));

// Draw walls
walls.forEach(({ x, y, horizontal, length }) => {
 const wall = document.createElement("div");
 wall.setAttribute("class", "wall");
 wall.style.cssText = `
     left: ${x}px;
     top: ${y}px;
     width: ${wallW}px;
     height: ${length}px;
     transform: rotate(${horizontal ? -90 : 0}deg);
   `;

 mazeElement.appendChild(wall);
});

const holes = [
 { column: 0, row: 5 },
 { column: 2, row: 1 },
 { column: 3, row: 3 },
 { column: 6, row: 3 },
 { column: 1, row: 7 },
 { column: 6, row: 8 },
 { column: 9, row: 1 },
 { column: 7, row: 5 }
].map((hole) => ({
 x: hole.column * (wallW + pathW) + (wallW / 2 + pathW / 2),
 y: hole.row * (wallW + pathW) + (wallW / 2 + pathW / 2)
}));

joystickHeadElement.addEventListener("mousedown", function (event) {
 if (!gameInProgress) {
   mouseStartX = event.clientX;
   mouseStartY = event.clientY;
   gameInProgress = true;
   window.requestAnimationFrame(main);
   noteElement.style.opacity = 0;
   joystickHeadElement.style.cssText = `
       animation: none;
       cursor: grabbing;
     `;
 }
 
});

document.getElementById("hareas").addEventListener("mousedown",function (){
 if(hardMode===false){
   hardMode=true;
   resetGame();
   return;
}
if(hardMode===true){
  hardMode=false;
  resetGame();
  return;
}
});
document.getElementById("reset").addEventListener("mousedown",function (){
 resetGame();
 return;
});
var sens = 0.05,
     dec = 2,
     ag = null,
     x=null,
     y=null,
     z=null;


 var mouseListener = function(event) {   
      if(gameInProgress){
   if(null !== event.accelerationIncludingGravity) {
     ag = event.accelerationIncludingGravity;
     var y=(ag.x * sens).toFixed(dec);
     var x=(ag.y * sens).toFixed(dec);
     const rotationY = y*80;
     const rotationX = x*80;
     joystickHeadElement.style.cssText = `
       left: ${rotationY/1.2}px;
       top: ${rotationX/1.2}px;
       animation: none;
       cursor: grabbing;
     `;
     mazeElement.style.cssText = `
     transform: rotateY(${-rotationY}deg) rotateX(${rotationX}deg)
   `;
   const gravity = 2;
   const friction = 0.01; // Coefficients of friction

   accelerationX = gravity * Math.sin((-rotationY / 180) * Math.PI);
   accelerationY = gravity * Math.sin((rotationX / 180) * Math.PI);
   frictionX = gravity * Math.cos((rotationY / 180) * Math.PI) * friction;
   frictionY = gravity * Math.cos((rotationX / 180) * Math.PI) * friction;
   }
 }
 };
 
 window.addEventListener("devicemotion", mouseListener, false);

window.addEventListener("keydown", function (event) {
 // If not an arrow key or space or H was pressed then return
 if (![" ", "H", "h", "E", "e"].includes(event.key)) return;
 click.play();
 // If an arrow key was pressed then first prevent default
 event.preventDefault();

 // Set Hard mode
 if (event.key == "H" || event.key == "h") {
   hardMode = true;
   resetGame();
   return;
 }

 // Set Easy mode
 if (event.key == "E" || event.key == "e") {
   hardMode = false;
   resetGame();
   return;
 }
});

function resetGame() {
 click.play();
 previousTimestamp = undefined;
 gameInProgress = false;
 mouseStartX = undefined;
 mouseStartY = undefined;
 accelerationX = undefined;
 accelerationY = undefined;
 frictionX = undefined;
 frictionY = undefined;

 mazeElement.style.cssText = `
     transform: rotateY(0deg) rotateX(0deg)
   `;

 joystickHeadElement.style.cssText = `
     left: 0;
     top: 0;
     animation: glow;
     cursor: grab;
   `;

 if (hardMode) {
   noteElement.innerHTML = `Click the joystick to start!
       <h2>Hard Mode: ON</h2><bR><p>Hard mode, Avoid The Evil Devils. Back to easy mode? Press the Switch Button</p>`;
 } else {
   noteElement.innerHTML = `Click the joystick to start!
       <h2>Easy Mode: On</h2><bR><p>Move every ball to the center. Ready for hard mode? Press the Switch Button</p>`;
 }
 noteElement.style.opacity = 1;

 balls = [
   { column: 0, row: 0 },
   { column: 9, row: 0 },
   { column: 0, row: 8 },
   { column: 9, row: 8 }
 ].map((ball) => ({
   x: ball.column * (wallW + pathW) + (wallW / 2 + pathW / 2),
   y: ball.row * (wallW + pathW) + (wallW / 2 + pathW / 2),
   velocityX: 0,
   velocityY: 0
 }));

 if (ballElements.length) {
   balls.forEach(({ x, y }, index) => {
     ballElements[index].style.cssText = `left: ${x}px; top: ${y}px; `;
   });
 }

 // Remove previous hole elements
 holeElements.forEach((holeElement) => {
   mazeElement.removeChild(holeElement);
 });
 holeElements = [];

 // Reset hole elements if hard mode
 if (hardMode) {
   holes.forEach(({ x, y }) => {
     const ball = document.createElement("div");
     ball.setAttribute("class", "black-hole");
     ball.style.cssText = `left: ${x}px; top: ${y}px; `;

     mazeElement.appendChild(ball);
     holeElements.push(ball);
   });
 }
}

function main(timestamp) {
 // It is possible to reset the game mid-game. This case the look should stop
 if (!gameInProgress) return;

 if (previousTimestamp === undefined) {
   previousTimestamp = timestamp;
   window.requestAnimationFrame(main);
   return;
 }

 const maxVelocity = 1.5;

 // Time passed since last cycle divided by 16
 // This function gets called every 16 ms on average so dividing by 16 will result in 1
 const timeElapsed = (timestamp - previousTimestamp) / 16;

 try {
   // If mouse didn't move yet don't do anything
   if (accelerationX != undefined && accelerationY != undefined) {
     const velocityChangeX = accelerationX * timeElapsed;
     const velocityChangeY = accelerationY * timeElapsed;
     const frictionDeltaX = frictionX * timeElapsed;
     const frictionDeltaY = frictionY * timeElapsed;

     balls.forEach((ball) => {
       if (velocityChangeX == 0) {
         // On flat surface friction can only slow down, but not reverse movement
         ball.velocityX = slow(ball.velocityX, frictionDeltaX);
       } else {
         ball.velocityX = ball.velocityX + velocityChangeX;
         ball.velocityX = Math.max(Math.min(ball.velocityX, 1.5), -1.5);
         ball.velocityX =
           ball.velocityX - Math.sign(velocityChangeX) * frictionDeltaX;
         ball.velocityX = Math.minmax(ball.velocityX, maxVelocity);
       }

       if (velocityChangeY == 0) {
         // No rotation, the plane is flat
         // On flat surface friction can only slow down, but not reverse movement
         ball.velocityY = slow(ball.velocityY, frictionDeltaY);
       } else {
         ball.velocityY = ball.velocityY + velocityChangeY;
         ball.velocityY =
           ball.velocityY - Math.sign(velocityChangeY) * frictionDeltaY;
         ball.velocityY = Math.minmax(ball.velocityY, maxVelocity);
       }

       // Preliminary next ball position, only becomes true if no hit occurs
       // Used only for hit testing, does not mean that the ball will reach this position
       ball.nextX = ball.x + ball.velocityX;
       ball.nextY = ball.y + ball.velocityY;

       if (debugMode) console.log("tick", ball);

       walls.forEach((wall, wi) => {
         if (wall.horizontal) {
           // Horizontal wall

           if (
             ball.nextY + ballSize / 2 >= wall.y - wallW / 2 &&
             ball.nextY - ballSize / 2 <= wall.y + wallW / 2
           ) {
             // Ball got within the strip of the wall
             // (not necessarily hit it, could be before or after)

             const wallStart = {
               x: wall.x,
               y: wall.y
             };
             const wallEnd = {
               x: wall.x + wall.length,
               y: wall.y
             };

             if (
               ball.nextX + ballSize / 2 >= wallStart.x - wallW / 2 &&
               ball.nextX < wallStart.x
             ) {
               // Ball might hit the left cap of a horizontal wall
               const distance = distance2D(wallStart, {
                 x: ball.nextX,
                 y: ball.nextY
               });
               if (distance < ballSize / 2 + wallW / 2) {
                 if (debugMode && wi > 4)
                   console.warn("too close h head", distance, ball);

                 // Ball hits the left cap of a horizontal wall
                 const closest = closestItCanBe(wallStart, {
                   x: ball.nextX,
                   y: ball.nextY
                 });
                 const rolled = rollAroundCap(wallStart, {
                   x: closest.x,
                   y: closest.y,
                   velocityX: ball.velocityX,
                   velocityY: ball.velocityY
                 });

                 Object.assign(ball, rolled);
               }
             }

             if (
               ball.nextX - ballSize / 2 <= wallEnd.x + wallW / 2 &&
               ball.nextX > wallEnd.x
             ) {
               // Ball might hit the right cap of a horizontal wall
               const distance = distance2D(wallEnd, {
                 x: ball.nextX,
                 y: ball.nextY
               });
               if (distance < ballSize / 2 + wallW / 2) {
                 if (debugMode && wi > 4)
                   console.warn("too close h tail", distance, ball);

                 // Ball hits the right cap of a horizontal wall
                 const closest = closestItCanBe(wallEnd, {
                   x: ball.nextX,
                   y: ball.nextY
                 });
                 const rolled = rollAroundCap(wallEnd, {
                   x: closest.x,
                   y: closest.y,
                   velocityX: ball.velocityX,
                   velocityY: ball.velocityY
                 });

                 Object.assign(ball, rolled);
               }
             }

             if (ball.nextX >= wallStart.x && ball.nextX <= wallEnd.x) {
               // The ball got inside the main body of the wall
               if (ball.nextY < wall.y) {
                 // Hit horizontal wall from top
                 ball.nextY = wall.y - wallW / 2 - ballSize / 2;
               } else {
                 // Hit horizontal wall from bottom
                 ball.nextY = wall.y + wallW / 2 + ballSize / 2;
               }
               ball.y = ball.nextY;
               ball.velocityY = -ball.velocityY / 3;

               if (debugMode && wi > 4)
                 console.error("crossing h line, HIT", ball);
             }
           }
         } else {
           // Vertical wall

           if (
             ball.nextX + ballSize / 2 >= wall.x - wallW / 2 &&
             ball.nextX - ballSize / 2 <= wall.x + wallW / 2
           ) {
             // Ball got within the strip of the wall
             // (not necessarily hit it, could be before or after)

             const wallStart = {
               x: wall.x,
               y: wall.y
             };
             const wallEnd = {
               x: wall.x,
               y: wall.y + wall.length
             };

             if (
               ball.nextY + ballSize / 2 >= wallStart.y - wallW / 2 &&
               ball.nextY < wallStart.y
             ) {
               // Ball might hit the top cap of a horizontal wall
               const distance = distance2D(wallStart, {
                 x: ball.nextX,
                 y: ball.nextY
               });
               if (distance < ballSize / 2 + wallW / 2) {
                 if (debugMode && wi > 4)
                   console.warn("too close v head", distance, ball);

                 // Ball hits the left cap of a horizontal wall
                 const closest = closestItCanBe(wallStart, {
                   x: ball.nextX,
                   y: ball.nextY
                 });
                 const rolled = rollAroundCap(wallStart, {
                   x: closest.x,
                   y: closest.y,
                   velocityX: ball.velocityX,
                   velocityY: ball.velocityY
                 });

                 Object.assign(ball, rolled);
               }
             }

             if (
               ball.nextY - ballSize / 2 <= wallEnd.y + wallW / 2 &&
               ball.nextY > wallEnd.y
             ) {
               // Ball might hit the bottom cap of a horizontal wall
               const distance = distance2D(wallEnd, {
                 x: ball.nextX,
                 y: ball.nextY
               });
               if (distance < ballSize / 2 + wallW / 2) {
                 if (debugMode && wi > 4)
                   console.warn("too close v tail", distance, ball);

                 // Ball hits the right cap of a horizontal wall
                 const closest = closestItCanBe(wallEnd, {
                   x: ball.nextX,
                   y: ball.nextY
                 });
                 const rolled = rollAroundCap(wallEnd, {
                   x: closest.x,
                   y: closest.y,
                   velocityX: ball.velocityX,
                   velocityY: ball.velocityY
                 });

                 Object.assign(ball, rolled);
               }
             }

             if (ball.nextY >= wallStart.y && ball.nextY <= wallEnd.y) {
               // The ball got inside the main body of the wall
               if (ball.nextX < wall.x) {
                 // Hit vertical wall from left
                 ball.nextX = wall.x - wallW / 2 - ballSize / 2;
               } else {
                 // Hit vertical wall from right
                 ball.nextX = wall.x + wallW / 2 + ballSize / 2;
               }
               ball.x = ball.nextX;
               ball.velocityX = -ball.velocityX / 3;

               if (debugMode && wi > 4)
                 console.error("crossing v line, HIT", ball);
             }
           }
         }
       });

       // Detect is a ball fell into a hole
       if (hardMode) {
         holes.forEach((hole, hi) => {
           const distance = distance2D(hole, {
             x: ball.nextX,
             y: ball.nextY
           });

           if (distance <= holeSize / 2) {
             // The ball fell into a hole
             holeElements[hi].style.animation = "glow 1.5s linear infinite";
             devil.play();
             throw Error("The ball fell into a hole");
           }
         });
       }

       // Adjust ball metadata
       ball.x = ball.x + ball.velocityX;
       ball.y = ball.y + ball.velocityY;
     });

     // Move balls to their new position on the UI
     balls.forEach(({ x, y }, index) => {
       ballElements[index].style.cssText = `left: ${x}px; top: ${y}px; `;
     });
   }

   // Win detection
   if (
     balls.every(
       (ball) => distance2D(ball, { x: 350 / 2, y: 315 / 2 }) < 65 / 2
     )
   ) {
     Win.play();
     noteElement.innerHTML = `Congrats, you did it!
       ${!hardMode && "<p>Press Switch Button For Hard Mode</p>"}
       <p>
       
       </p>`;
     noteElement.style.opacity = 1;
     gameInProgress = false;
   } else {
     previousTimestamp = timestamp;
     window.requestAnimationFrame(main);
   }
 } catch (error) {
   if (error.message == "The ball fell into a hole") {
     noteElement.innerHTML = `A ball fell into the devils mouth ! Press Reset to restart the game.
       <p>
         Back to easy? Press Switch Button !
       </p>`;
     noteElement.style.opacity = 1;
     gameInProgress = false;
   } else throw error;
 }
}
function pclap(){
 
window.addEventListener("mousemove", function (event) {
 if (gameInProgress) {
   const mouseDeltaX = -Math.minmax(mouseStartX - event.clientX, 15);
   const mouseDeltaY = -Math.minmax(mouseStartY - event.clientY, 15);

   joystickHeadElement.style.cssText = `
       left: ${mouseDeltaX}px;
       top: ${mouseDeltaY}px;
       animation: none;
       cursor: grabbing;
     `;

   const rotationY = mouseDeltaX * 0.8; // Max rotation = 12
   const rotationX = mouseDeltaY * 0.8;

   mazeElement.style.cssText = `
       transform: rotateY(${rotationY}deg) rotateX(${-rotationX}deg)
     `;

   const gravity = 2;
   const friction = 0.01; // Coefficients of friction

   accelerationX = gravity * Math.sin((rotationY / 180) * Math.PI);
   accelerationY = gravity * Math.sin((rotationX / 180) * Math.PI);
   frictionX = gravity * Math.cos((rotationY / 180) * Math.PI) * friction;
   frictionY = gravity * Math.cos((rotationX / 180) * Math.PI) * friction;
 }
});

}

