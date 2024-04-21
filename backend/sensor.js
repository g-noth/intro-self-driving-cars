
// Ray casting 
class Sensor{
    constructor(car){
        this.car=car;
        this.rayCount=5;
        this.rayLength=150;
        // 45 degrees
        this.raySpread=Math.PI/2;
        this.rays=[];
        // each ray has a reading about the distance to the nearest obstacle (borders, traffic)
        this.readings=[];
    }
    // overall sensor update with private methods getReading and castRays
    update(roadBorders,traffic){
        this.#castRays();
        this.readings=[];
        for(let i=0;i<this.rays.length;i++){
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic
                )
            );
        }
    }

    // get intersection of two lines (two borders on each side of the road)
    // closest intersection point to the car
    // ray: start and end point of the ray
    #getReading(ray,roadBorders,traffic){
        let touches=[];

        for(let i=0;i<roadBorders.length;i++){
            const touch=getIntersection(
                ray[0], // start point of the ray
                ray[1], // end point of the ray
                roadBorders[i][0],
                roadBorders[i][1]
            );
            // if there is a touch, add it to the touches array
            if(touch){
                touches.push(touch);
            }
        }
        // 
        for(let i=0;i<traffic.length;i++){
            const poly=traffic[i].polygon;
            for(let j=0;j<poly.length;j++){
                const value=getIntersection( // x,y,offset
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if(value){
                    touches.push(value);
                }
            }
        }
        // if there is no touch, return null
        if(touches.length==0){
            return null;
        }else{
            // get the closest touch to the car (intersection function returns point gives x,y,offset (offset is center of car))
            // for each touch, get the offset and find the minimum offset 
            const offsets=touches.map(e=>e.offset);
            const minOffset=Math.min(...offsets);
            return touches.find(e=>e.offset==minOffset);
        }
    }


    #castRays(){
        this.rays=[];
        for(let i=0;i<this.rayCount;i++){
            const rayAngle=lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount==1?0.5:i/(this.rayCount-1)
            )+this.car.angle;

            const start={x:this.car.x, y:this.car.y};
            const end={
                x:this.car.x-
                    Math.sin(rayAngle)*this.rayLength,
                y:this.car.y-
                    Math.cos(rayAngle)*this.rayLength
            };
            this.rays.push([start,end]);
        }
    }

    draw(ctx){
        for(let i=0;i<this.rayCount;i++){
            let end=this.rays[i][1];
            if(this.readings[i]){
                end=this.readings[i];
            }

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="black";
            ctx.moveTo(
                this.rays[i][1].x, 
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }        
}