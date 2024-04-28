// setup canvas
const canvas = document.getElementById('myCanvas');
canvas.width = 200;
const ctx = canvas.getContext('2d');

const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 400;
const networkCtx = networkCanvas.getContext('2d');

// global variables
let isStopped = false;
let animationFrame;
let road;

const laneIndex = 1;

initializeRoad();

const N = 50;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem('bestBrain')) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].nn = JSON.parse(localStorage.getItem('bestBrain'));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].nn, 0.15); // adjust similarity to best car
    }
  }
}

const traffic = [
  new Car(road.getLaneCenter(1), -400, 30, 50, 'TRAFFIC', 2),
  new Car(road.getLaneCenter(2), -600, 30, 50, 'TRAFFIC', 2),
  new Car(road.getLaneCenter(0), -150, 30, 50, 'TRAFFIC', 2),
  new Car(road.getLaneCenter(1), -100, 30, 50, 'TRAFFIC', 2),
  new Car(road.getLaneCenter(0), -900, 30, 50, 'TRAFFIC', 2),
];

animate();

function initializeRoad() {
  road = new Road(canvas.width / 2, canvas.width * 0.9);
}

function setup() {
  const lanes = document.getElementById('lanes').value;
  initializeRoad(parseInt(lanes));
  animate();
}

// serialize best car in local storage
function save() {
  localStorage.setItem(
    'bestCarBrain',
    JSON.stringify(bestCar.nn),
  );
}

function discard() {
  localStorage.removeItem('bestCarBrain');
}

function stop() {
  isStopped = !isStopped;
  const button = document.getElementById('stopButton');
  button.innerHTML = isStopped ? '⏯️' : '⏹️';

  if (isStopped) {
    window.cancelAnimationFrame(animationFrame);
  } else {
    animate();
  }
}

function reload() {
  window.location.reload();
}

function generateCars(N) {
  const cars = [];
  for (let i = 1; i < N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI'));
  }
  return cars;
}

function animate(time) {
  if (isStopped) {
    return;
  }

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  // track best car (fitness function: highest up on screen (lowest y value))
  // only works for straight roads
  bestCar = cars.find(
    (c) => c.y == Math.min(
      ...cars.map((c) => c.y),
    ),
  );

  const heightTabs = document.querySelector('.tab').clientHeight;
  canvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight - heightTabs;

  ctx.save();
  ctx.translate(0, -bestCar.y + canvas.height * 0.7);

  road.draw(ctx);

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(ctx, 'red');
  }

  ctx.globalAlpha = 0.2;

  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(ctx, 'blue');
  }

  ctx.globalAlpha = 1;
  // focus on main car with sensor
  bestCar.draw(ctx, 'blue', true);

  ctx.restore();
  networkCtx.lineDashOffset = -time / 30;
  Visualizer.drawNetwork(networkCtx, bestCar.nn);
  animationFrame = requestAnimationFrame(animate);
}
