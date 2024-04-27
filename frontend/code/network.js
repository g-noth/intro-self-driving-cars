// sensor as input (5 sensors)


// define NN (more layers) from levels class 
class NeuralNetwork{ 
    // number of neurons in each layer
    constructor(neuronCounts){
        this.levels=[];
        for(let i=0;i<neuronCounts.length-1;i++){
            this.levels.push(new Level(
                neuronCounts[i],neuronCounts[i+1]
            ));
        }
    }
    // feed forward through all levels
    // givenInputs: sensor inputs
    // putting in output of previous level as input to next level
    static feedForward(givenInputs,network){
        // feed forward through first level
        let outputs=Level.feedForward(
            givenInputs,network.levels[0]);
        // loop through all levels
        for(let i=1;i<network.levels.length;i++){
            outputs=Level.feedForward(
                outputs,network.levels[i]);
        }
        // which action is taken (Left, Right, ...)
        return outputs;
    }
    // make a (similar or dissimilar) copy of the network
    static mutate(network,amount=1){
        network.levels.forEach(level => {
            for(let i=0;i<level.biases.length;i++){
                level.biases[i]=lerp( // linear interpolation (from current value to random value of bias)
                    level.biases[i],
                    Math.random()*2-1, // -1 to 1
                    amount
                )
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }
}


// define NN structure and bias
class Level{
    constructor(inputCount,outputCount){
        this.inputs=new Array(inputCount);
        this.outputs=new Array(outputCount);
        this.biases=new Array(outputCount);
        // fully connected NN weights (every node connected to every other node)
        this.weights=[];
        for(let i=0;i<inputCount;i++){
            this.weights[i]=new Array(outputCount);
        }
        // initialize weights and biases
        Level.#randomize(this);
    }
    static #randomize(level){
        // weights
        for(let i=0;i<level.inputs.length;i++){
            for(let j=0;j<level.outputs.length;j++){
                // random value between -1 (dont turn right) and 1
                level.weights[i][j]=Math.random()*2-1;
            }
        }
        // biases
        for(let i=0;i<level.biases.length;i++){
            level.biases[i]=Math.random()*2-1;
        }
    }
    // compute output of a level through all level inputs
    static feedForward(givenInputs,level){
        for(let i=0;i<level.inputs.length;i++){
            level.inputs[i]=givenInputs[i];
        }
        // loop through every output node
        // J to loop through every input node
        // sum of all inputs*weights
        for(let i=0;i<level.outputs.length;i++){
            let sum=0
            for(let j=0;j<level.inputs.length;j++){
                sum+=level.inputs[j]*level.weights[j][i];
            }
            // if sum is greater than bias, output is 1 (fire)
            if(sum>level.biases[i]){
                level.outputs[i]=1;
            }else{
                level.outputs[i]=0;
            } 
        }

        return level.outputs;
    }
}