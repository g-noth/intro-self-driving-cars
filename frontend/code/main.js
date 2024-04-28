const canvas = document.getElementById('myCanvas');
canvas.width = 200;

const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 400;

// setup menu
const laneCount = 3;
const laneIndex = 1;
// rayCount,raySpread,rayLength

const ctx = canvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(canvas.width / 2, canvas.width * 0.9, laneCount);

// generate AI cars (either useJSNN or usePythonNN)
const N = 2;
const cars = generateCars(N);  

// initialize best car as first car of cohort
let bestCar = cars[0];

// save best car to mutuate it later on (kind of learning) -- only for JSNN
if(localStorage.getItem("bestBrain")){
  for(let i=0;i<cars.length;i++){
    cars[i].nn = JSON.parse(localStorage.getItem("bestBrain"));
    if(i!=0){
      NeuralNetwork.mutate(cars[i].nn,0.15); // adjust similarity to best car
    }
  }
}

const traffic = [
  new Car(road.getLaneCenter(1), -400, 30, 50, 'TRAFFIC',2),
  new Car(road.getLaneCenter(2), -600, 30, 50, 'TRAFFIC',2),
  new Car(road.getLaneCenter(0), -150, 30, 50, 'TRAFFIC',2),
  new Car(road.getLaneCenter(1), -100, 30, 50, 'TRAFFIC',2),
  new Car(road.getLaneCenter(0), -900, 30, 50, 'TRAFFIC',2),
];

animate();

// serialize best car in local storage
function save(){
  localStorage.setItem("bestCarBrain",
    JSON.stringify(bestCar.nn));
}

function discard(){
  localStorage.removeItem("bestCarBrain");
}

function stop(){
  window.cancelAnimationFrame(animationFrameId);
}


// generate cohort of AI cars with randomized weights and biases

function generateCars(N){
   const cars = [];
   for(let i=1;i<N;i++){
      cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI',3, usePythonNN = true)); // set to true for python 
   }
   return cars;
}

// visualize AI cars and traffic

function animate(time) {
  // animate traffic
  for(let i=0;i<traffic.length;i++){
    traffic[i].update(road.borders, []);
  }
  // animate AI cars
  for(let i=0;i<cars.length;i++){
    cars[i].update(road.borders, traffic);
  }

  // track best car (fitness function: highest up on screen (lowest y value))
  // only works for straight roads
  bestCar = cars.find(
    c=>c.y==Math.min(
      ...cars.map(c=>c.y)
    ));

  canvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  // make street move and follow best car 
  ctx.save();
  ctx.translate(0, -bestCar.y + canvas.height * 0.7);
  // end make street move

  road.draw(ctx);

  // bot cars (traffic)
  for(let i=0;i<traffic.length;i++){
    traffic[i].draw(ctx, 'red');
  }

  // all AI cars semi-transparent
  ctx.globalAlpha = 0.2;

  for(let i=0;i<cars.length;i++){
    cars[i].draw(ctx, 'blue');
  }
  
  // best car fully blue
  ctx.globalAlpha = 1;
  // focus on main car with sensor (true = draw sensor)
  bestCar.draw(ctx,"blue",true);

  ctx.restore();
  networkCtx.lineDashOffset=-time/30;

  // print neural network of best cars AI / brain
  Visualizer.drawNetwork(networkCtx, bestCar.nn);
  requestAnimationFrame(animate);
}
