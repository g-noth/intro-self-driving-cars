
class Car {
    constructor(x, y, width, height, carType, maxSpeed = 3, usePythonNN = false){
        this.x = x; //center of the car x
        this.y = y; //center of the car y
        this.width = width;
        this.height = height;

        this.speed=0;
        this.acceleration=0.2;
        this.maxSpeed = maxSpeed;
        this.friction=0.05;
        this.angle=0;
        this.damaged=false;

        this.usePythonNN = usePythonNN;

        this.useJSNN = carType == 'AI' && !usePythonNN;

        if(this.carType != 'TRAFFIC'){
            this.sensor = new Sensor(this);
            // connect NN to car
            if(this.useJSNN){
                this.nn = new NeuralNetwork(
                    [this.sensor.rayCount,6,4]
                );
            }
        }

        this.controls = new Controls(carType);
    }

    async update(roadBorders, traffic){
        if(!this.damaged){
            this.#drive();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders, traffic);
            // console.log(this.sensor.readings);
            // low values for far away objects, high values for close objects
            const offsets = this.sensor.readings.map(
                sensor_reading => sensor_reading == null?0:1-sensor_reading.offset
            );
            console.log(offsets);
            // connect sensor data to NN
            // post sensor data to flask server and get NN output (controls)
            let outputs;

            if(this.usePythonNN){
                const response = await axios.post('http://localhost:5001/api/postSensorData',{
                    input_array: offsets    // e.g. [0.1, 0.2, 0.3, 0.4, 0.5]
                });
                outputs = response.data;
                // log outputs
                console.log(outputs);
            } else {
                // use JS NN
                outputs = NeuralNetwork.feedForward(offsets, this.nn);
            }

            // connect NN to controls
            if(this.carType != 'TRAFFIC'){
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic){
        for(let i=0; i<roadBorders.length; i++){
            if(polysIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }

        for(let i=0; i<traffic.length; i++){
            if(polysIntersect(this.polygon, traffic[i].polygon)){
                return true;
            }
        }

        return false;
    }

    // collision detection
    #createPolygon(){
        const points = [];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);

        // top right point
        points.push({
            x: this.x - Math.sin(this.angle-alpha) * rad,
            y: this.y - Math.cos(this.angle-alpha) * rad
        })

        // top left point
        points.push({
            x: this.x - Math.sin(this.angle+alpha) * rad,
            y: this.y - Math.cos(this.angle+alpha) * rad
        })

        // bottom left point
        points.push({
            x: this.x - Math.sin(Math.PI+this.angle-alpha) * rad,
            y: this.y - Math.cos(Math.PI+this.angle-alpha) * rad
        })

        // bottom right point
        points.push({
            x: this.x - Math.sin(Math.PI+this.angle+alpha) * rad,
            y: this.y - Math.cos(Math.PI+this.angle+alpha) * rad
        })

        return points;
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

    draw(ctx, color, drawSensor=false) {
        //color code car while driving
        if(this.damaged){
            ctx.fillStyle="gray";
        }else{
            ctx.fillStyle=color;
        }

        // draw car
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
        for(let i=1; i<this.polygon.length; i++){
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill();

        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }
    }
}