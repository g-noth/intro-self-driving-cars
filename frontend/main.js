const canvas = document.getElementById("myCanvas");
canvas.width=200;

//setup menu
const laneCount = 3;
const laneIndex = 1;
//rayCount,raySpread,rayLength


const ctx = canvas.getContext("2d");
const road = new Road(canvas.width/2, canvas.width * 0.9, laneCount);
const car = new Car(road.getLaneCenter(laneIndex),100,30,50, "MAIN"); 
const traffic = [
    new Car(road.getLaneCenter(laneIndex),-100,30,50, "TRAFFIC", 2)
]

animate();

function animate(){
    traffic.forEach((car)=>{
        car.update(road.borders, [])
    });
    car.update(road.borders, traffic);

    canvas.height = window.innerHeight;

    // make street move
    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.7);
    // end make street move

    road.draw(ctx);
    traffic.forEach((car)=>{
        car.draw(ctx, "red")
    });
    car.draw(ctx, "blue");

    ctx.restore()
    requestAnimationFrame(animate);
}