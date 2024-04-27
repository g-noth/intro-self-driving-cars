import flask
from flask import request, jsonify
import numpy as np




app = flask.Flask(__name__)
app.config["DEBUG"] = True

# input data: readings from the sensors/rays (Post request from the frontend)

# The input_array comes from the sensor data by the Sensor class 
# which uses ray casting to detect obstacles around the car. For each ray, 
# it calculates the intersection with the road borders and traffic and 
# returns the distance to the closest intersection point. 
# it sends the offset value with the nearest distance
# e.g. given_inputs[0] = Distance to the closest obstacle detected by the first ray (leftmost)

# output data: controls for car (Get request from the frontend in car class)
# outputs[0] = forward
# outputs[1] = left
# outputs[2] = right
# outputs[3] = reverse


# expose the neural network model as an API endpoint to feed in the sensor data

@app.route('/api/postSensorData', methods=['POST'])
def postSensorData():
    given_inputs = request.json['input_array']
    given_inputs = np.array(given_inputs)
    outputs = py_nn.feed_forward(given_inputs)
    return jsonify(outputs.tolist())

# run flask
# http://localhost:5000/api/postSensorData
if __name__ == '__main__':
    app.run()


# feed forward with binary step activation function
class Level:
    def __init__(self,input_count, output_count):
        # initialize
        self.inputs = np.zeros(input_count)
        self.outputs = np.zeros(output_count)
        # randomize weights and biases but random.rand can only generate values between 0 and 1, so we multiply 
        # by 2 and subtract 1 to get values between -1 and 1
        self.weights = np.random.rand(input_count,output_count) * 2 - 1
        self.biases = np.random.rand(output_count) * 2 - 1
        
    def feed_forward(self, given_inputs):
        # multiply inputs by weights, add biases, and apply binary step activation function
        self.inputs = given_inputs
        sum = np.dot(self.inputs,self.weights) # inputs * weights
        self.outputs = np.where(sum > self.biases, 1, 0) # binary step activation function (TODO: change to sigmoid function)
        return self.outputs
    
    
    # def back_propagate(self, expected_outputs):
    #     error = expected_outputs - self.outputs
    #     self.weights += np.dot(self.inputs, error)
    #     self.biases += error
    
    
class PyNeuralNetwork:
    def __init__(self, input_count, hidden_count, output_count):
        # initialize with given number of neurons in each layer
        self.levels = [Level(input_count, hidden_count), Level(hidden_count, output_count)]
        
    def feed_forward(self, given_inputs):
        # Perform the feedforward operation for the entire network.
        outputs = self.levels[0].feed_forward(given_inputs)  # first layer
        for i in range(1, len(self.levels)):
            outputs = self.levels[i].feed_forward(outputs)  # remaining layers
        return outputs
    
    def lerp(self, start, end, amount):
        # helper function to linearly interpolate between two values
        return (1-amount)*start + amount*end
    
    def mutate(self, amount):
        for level in self.levels:
            level.biases = self.lerp(level.biases, np.random.rand(-1,1,level.biases.shape[0]), amount)
            for i in range(len(level.weights[i])):
                for j in range(len(level.weights[i])):
                    level.weights[i][j] = self.lerp(level.weights[i][j], np.random.rand(-1,1), amount)
                
                
# create a neural network model given input length
py_nn = PyNeuralNetwork(7,6,4)


