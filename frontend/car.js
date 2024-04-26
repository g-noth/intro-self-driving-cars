class Car {
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed=0;
        this.acceleration=0.2;
        this.maxSpeed=3;
        this.friction=0.05;
        this.angle=0;

        this.sensor = new Sensor(this);
        this.controls = new Controls();
    }

    update(roadBorders){
        this.#drive();
        this.sensor.update(roadBorders);
    }

    #drive() {
        // forward driving
        if(this.controls.forward){
            this.speed += this.acceleration;
        }
        //backward driving
        if(this.controls.reverse){
            this.speed -= this.acceleration;
        }
        if (this.speed != 0){
            const flip = this.speed > 0 ? 1 : -1 ;
            //turn right
            if(this.controls.right){
                this.angle -= 0.03 * flip;
            }
            //turn left
            if(this.controls.left){
                this.angle += 0.03 * flip;
            }
        }
        //max speed
        if (this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        }
        // max back speed
        if (this.speed < -this.maxSpeed/2){
            this.speed = -this.maxSpeed/2;
        }
        // breaking distance 
        if (this.speed > 0){
            this.speed -= this.friction;
        }
        // braking distance backward
        if (this.speed < 0){
            this.speed += this.friction;
        }
        // avoid corner case of small firction speed
        if (Math.abs(this.speed) < this.friction){
            this.speed = 0;
        }

        // update speed
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    };

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);

        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.fill();

        ctx.restore();

        this.sensor.draw(ctx);
    }
}