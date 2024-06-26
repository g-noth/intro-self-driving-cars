class Sensor{
    constructor(car, raysData){
        this.car=car;
        this.rayCount=parseInt(raysData[0]);
        this.raySpread=raysData[1] * (Math.PI / 180);
        this.rayLength=raysData[2];
        
        this.rays=[];
        this.readings=[];
    }

    update(roadBorders, traffic){
        this.#castRays();
        this.readings= [];  // consists of x,y,offset

        for (let i=0; i <this.rays.length; i++){
            this.readings.push(
                this.#getReading(
                    this.rays[i], 
                    roadBorders,
                    traffic
                    )
            );
        }
    }

    #getReading(ray, roadBorders, traffic){
        // get minimal offset intersection as reading
        let touches = [];

        for(let i=0; i < roadBorders.length; i++){
            const touchBoarder = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1],
            );
            if(touchBoarder){
                touches.push(touchBoarder);
            }
        }

        for(let i=0; i < traffic.length; i++){
            const poly = traffic[i].polygon
            for(let j=0; j < poly.length; j++){
                const touchTraffic = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length],
                );
                if(touchTraffic){
                    touches.push(touchTraffic);
                }
            }
        }

        if(touches.length == 0){
            return null;
        }else{
            // offset is distance to intersection
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset === minOffset);
        }
    }

    #castRays(){
        this.rays=[];
        for(let i=0;i<this.rayCount;i++){
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount == 1 ? 0.5 : i/(this.rayCount-1)
            ) + this.car.angle;

            const start={
                x: this.car.x, 
                y: this.car.y
            };
            const end={
                x: this.car.x - Math.sin(rayAngle)*this.rayLength,
                y: this.car.y - Math.cos(rayAngle)*this.rayLength,
            };
            this.rays.push([start, end]);
        }
    }

    draw(ctx){
        this.rays.forEach((ray, i)=>{
            let rayEnd = ray[1];
            if (this.readings[i]){
                rayEnd = this.readings[i]
            }

            // line touching border
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(ray[0].x, ray[0].y)
            ctx.lineTo(rayEnd.x, rayEnd.y)
            ctx.stroke();

            // actual line 
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="black";
            ctx.moveTo(ray[1].x, ray[1].y)
            ctx.lineTo(rayEnd.x, rayEnd.y)
            ctx.stroke();
        })
    }
}