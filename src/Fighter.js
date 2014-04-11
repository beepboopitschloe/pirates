function sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t));
}

function randomClamped() {
	return Math.random() - Math.random();
}

// NEURON CLASS
{

	function Neuron(numInputs) {
		this.inputs = [];
		this.numInputs = numInputs;
		this.weights = [];
		this.activation = 0;


		for (var i = 0; i < numInputs + 1; i++) {
			this.weights.push(randomClamped());
		}
	}

	Neuron.prototype.update = function() {
		for (var i = 0; i < inputs.length; i++) {
			activation += inputs[i] * weights[i];
		}

		// now add the opposite of the activation threshold
		activation -= inputs[inputs.length];

		console.log(activation);

		return (activation >= 0);
	}

}

// NEURON LAYER CLASS
{

	function NeuronLayer(numNeurons, inputsPerNeuron) {
		this.neurons = [];
		this.numNeurons = numNeurons;
		this.inputsPerNeuron = inputsPerNeuron;

		this.buildLayer();
	}

	NeuronLayer.prototype.buildLayer = function() {
		for (var i = 0; i < this.numNeurons; i++) {
			this.neurons.push(new Neuron(this.inputsPerNeuron));
		}
	}

}

// NEURAL NET CLASS
{

	// constructor
	function NeuralNet(o) {
		obj = o? o : {};

		this.numInputs = obj.numInputs? obj.numInputs : 3;
		this.numOutputs = obj.numOutputs? obj.numOutputs : 6;
		this.numHiddenLayers = 1;
		this.neuronsPerHiddenLayer = 6;

		this.hiddenLayers = [];

		this.buildNet();
	}

	// build the network
	NeuralNet.prototype.buildNet = function() {
		if (this.numHiddenLayers > 0) {
			// the first layer is special- connects to inputs, not neurons
			this.hiddenLayers.push(new NeuronLayer(this.neuronsPerHiddenLayer, this.numInputs));

			// middle hidden layers only connect to other neurons
			for (var i = 0; i < this.numHiddenLayers - 1; i++) {
				this.hiddenLayers.push(new NeuronLayer(this.neuronsPerHiddenLayer,
					this.neuronsPerHiddenLayer));
			}

			// output layer connects to neurons
			this.hiddenLayers.push(new NeuronLayer(this.numOutputs,
				this.neuronsPerHiddenLayer));
		} else {
			// create output layer
			this.hiddenLayers.push(new NeuronLayer(this.numOutputs,
				this.numInputs));
		}
	}

	// returns array of all weights in net
	NeuralNet.prototype.getWeights = function() {
		weights = [];

		// for each layer
		for (var i = 0; i < this.numHiddenLayers + 1; i++) {
			// for each neuron
			for (var j = 0; j < this.hiddenLayers[i].numNeurons; j++) {
				// for each weight
				for (var k = 0; k < this.hiddenLayers[i].neurons[j].numInputs; k++) {
					weights.push(this.hiddenLayers[i].neurons[j].weights[k]);
				}
			}
		}

		return weights;
	}

	// returns number of weights in net
	NeuralNet.prototype.numberOfWeights = function(inWeights) {
		var cWeight = 0;

		for (var i = 0; i < this.numHiddenLayers + 1; i++) {
			for (var j = 0; j < this.hiddenLayers[i].numNeurons; j++) {
				for (var k = 0; k < this.hiddenLayers[i].neurons[j].numInputs; k++) {
					this.hiddenLayers[i].neurons[j].weights[k] = weights[cWeight++];
				}
			}
		}
	}

	// replace weights with new ones
	NeuralNet.prototype.putWeights = function(newWeights) {

	}

	// calculates outputs from set of inputs
	NeuralNet.prototype.update = function(inputs) {
		outputs = [];
		var cWeight = 0;

		if (inputs.length != this.numInputs) {
			console.log('Inputs do not match');
			return outputs;
		}

		// for each layer:
		for (var i = 0; i < this.numHiddenLayers + 1; i++) {
			// in the first iteration, we want the raw input.
			// 	in the following iterations, we want the output which
			// 	we calculated in the previous iteration.
			if (i > 0) {
				inputs = outputs;
			}

			outputs = [];
			cWeight = 0;

			// for each neuron sum the (inputs * weights).
			for (var j = 0; j < this.hiddenLayers[i].numNeurons; j++) {
				var netInput = 0;

				var numInputs = this.hiddenLayers[i].neurons[j].numInputs;

				// for each weight
				for (var k = 0; k < numInputs-1; k++) {
					// sum weights * inputs
					netInput += this.hiddenLayers[i].neurons[j].weights[k] *
						inputs[cWeight++];
				}

				// add in bias
				netInput += this.hiddenLayers[i].neurons[j].weights[numInputs-1] *
					-1;

				outputs.push(this.sigmoid(netInput, 1));
				cWeight = 0;
			}
		}

		return outputs;
	}
	
	NeuralNet.prototype.sigmoid = function(netInput, response) {
		return (sigmoid(-netInput/response));
	}
}

Crafty.c('Fighter', {
	init: function() {
		this.requires('2D, Canvas, Keyboard, Color')
			.color('rgb(200, 100, 100')
			.bind('KeyDown', this.update);

		this.actions = [
			'strikeHigh',
			'strikeMid',
			'strikeLow',
			'parryHigh',
			'parryMid',
			'parryLow'
		];

		this.inputs = [0, 0, 0];

		this.brain = new NeuralNet();

		this.outText = Crafty.e('2D, DOM, Text')
			.text('Fighter output')
			.css('text-align', 'center')
			.textFont({size: '20px'})
			.attr({ x:0, y:Game.height()/2 - 24, w: Game.width() });
	},

	update: function() {
		var outStr = 'Inputs: ';

		for (var i=0; i<3; i++) {
			this.inputs[i] = Math.floor(Math.random() * 6);
			outStr += this.inputs[i] + ', ';
		}

		outStr += '  Outputs: '

		var outputs = this.brain.update(this.inputs);

		for (var i=0; i<outputs.length; i++) {
			outStr += outputs[i].toFixed(2) + ', ';
		}

		this.outText.text(outStr);
	}
});