
class Car {
    constructor(x, y, width, height, carType, maxSpeed = 3, usePythonNN = false){
        this.x = x; //center of the car x
        this.y = y; //center of the car y
        this.width = width;
        this.height = height;
        this.carType = carType;

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
                    [this.sensor.rayCount,8,4]
                );
            }

            this.img = new Image();
            this.img.src = "car.png"
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

            // get sensor readings 
            // low values for far away objects, high values for close objects
            const offsets = this.processSensorReadings(this.sensor.readings);
            // console.log(offsets);

            // connect sensor data to NN
            // post sensor data to flask server and get NN output (controls)
            let outputs;
            if(this.usePythonNN){
                outputs = await this.getPythonNNOutputs(offsets);
                if(this.carType != 'TRAFFIC'){
                    this.controls.forward = outputs[0];
                    this.controls.left = outputs[1];
                    this.controls.right = outputs[2];
                    this.controls.reverse = outputs[3];
                    console.log("Controls",this.controls);
                 }
                setTimeout(() =>this.update(roadBorders, traffic), 1000/10);
            } else {
                outputs = this.getJSNNOutputs(offsets);
                // log outputs
                // console.log(outputs);
                // connect NN to controls
                if(this.carType != 'TRAFFIC'){
                    this.controls.forward = outputs[0];
                    this.controls.left = outputs[1];
                    this.controls.right = outputs[2];
                    this.controls.reverse = outputs[3];
                }
            }
        }
    }
    // helper function to process sensor readings in either case
    processSensorReadings(readings){
        return readings.map(
            sensor_reading => sensor_reading == null?0:1-sensor_reading.offset
        );
    }
    async getPythonNNOutputs(offsets){
        const response = await axios.post('http://localhost:5001/api/postSensorData',{
            input_array: offsets
        });
        return response.data;
    }
    getJSNNOutputs(offsets){
        return NeuralNetwork.feedForward(offsets, this.nn);
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

        if(this.carType == 'TRAFFIC'){
            // draw traffic car
            ctx.beginPath();
            ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
            for(let i=1; i<this.polygon.length; i++){
                ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
            }
            ctx.fill();
        } else {
            //draw car
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(-this.angle);
            ctx.drawImage(
                this.img, 
                -this.width/2, 
                -this.height/2,
                this.width,
                this.height
                );
            ctx.restore();
        }

        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }
    }
}