//define canvas element
const canvas = document.getElementById('myCanvas');
canvas.width = 200;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 400;
networkCanvas.height = window.innerHeight;
const networkCtx = networkCanvas.getContext('2d');


function setup(e){
  e.preventDefault();

  // get form input values
  const laneCount = document.getElementById('lanes').value;
  const trafficCount = document.getElementById('traffic').value;
  const raysData = [
    document.getElementById('rays').value,
    document.getElementById('angle').value,
    document.getElementById('length-rays').value
  ];
  const driveMode = document.getElementById('driver_moder').value;


  let isStopped = false;
  let animationFrame;

  

  
  const road = new Road(canvas.width / 2, canvas.width * 0.9, laneCount);

  // generate AI cars (either useJSNN or usePythonNN)
  const DRIVE_MODE = driveMode.toUpperCase(); // 'MAIN' = Keyboard, 'AI' = Neural Network
  let USE_PYTHON_NN = false;  // true = use Python NN, false = use JS NN
  const N = 200; // number of AI cars

  const cars = generateCars(N);  

  // initialize best car as first car of cohort
  let bestCar = cars[0];

  // save best car to mutuate it later on (kind of learning) -- only for JSNN
  if(localStorage.getItem("bestCarBrain")){
    for(let i=0;i<cars.length;i++){
      cars[i].nn = JSON.parse(localStorage.getItem("bestCarBrain"));
      if(i!=0){
        NeuralNetwork.mutate(cars[i].nn,0.10); // adjust similarity to best car
      }
    }
  }

  const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, 'TRAFFIC',2),
    new Car(road.getLaneCenter(2), -400, 30, 100, 'TRAFFIC',2),
    new Car(road.getLaneCenter(0), -400, 30, 50, 'TRAFFIC',2),
    new Car(road.getLaneCenter(1), -600, 30, 100, 'TRAFFIC',2),
    new Car(road.getLaneCenter(2), -600, 30, 100, 'TRAFFIC',2),
    new Car(road.getLaneCenter(0), -800, 30, 50, 'TRAFFIC',2),
    new Car(road.getLaneCenter(2), -800, 30, 50, 'TRAFFIC',2),
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
    isStopped = !isStopped;
    const button = document.getElementById("stopButton")
    button.innerHTML = isStopped ? "⏯️" : "⏹️" ;

    if (isStopped){
      window.cancelAnimationFrame(animationFrame);
    }else{
      animate();
    }
  }

  function reload(){
    console.log("hello")
    window.location.reload();
  }

  document.getElementById('saveButton').addEventListener('click', save);
  document.getElementById('discardButton').addEventListener('click', discard);
  document.getElementById('stopButton').addEventListener('click', stop);
  document.getElementById('reloadButton').addEventListener('click', reload);

  function generateCars(N){
    const cars = [];
    for(let i=1;i<N;i++){
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, DRIVE_MODE,3, USE_PYTHON_NN, raysData));
    }
    return cars;
  }

  // visualize AI cars and traffic
  function animate(time) {
    if(isStopped){
      return;
    }

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

    const heightTabs = document.querySelector(".tab").clientHeight;
    canvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight - heightTabs;

    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * 0.7);

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

    // print neural network of best cars AI / brain
    if (bestCar.nn && typeof bestCar.nn === 'object' && !USE_PYTHON_NN && DRIVE_MODE != 'MAIN'){
      networkCtx.lineDashOffset=-time/30;
      Visualizer.drawNetwork(networkCtx, bestCar.nn);
    }
    requestAnimationFrame(animate);
  }
}
