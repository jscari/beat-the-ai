/* 
A multiclass perceptron
We create 10 perceptrons with on decision unit
The class is given by the decision unit with the higher value
During the training, if the prediction is incorrect,
we will modify the wrongly prediction perceptron and the targeted one


*/
var Perceptron = (function () {

/** [weights] . [1,x] (we have one additional weight the bias)*/
	var dot_product = function(weights,x){
		var p = weights[0];
		for(var i = 0 ; i<x.length; i++)
			p+=weights[i+1]*x[i];
		return p;
	};

/* Learn from one input, 
if the output chosen is incorrect,
- we adjust the weights of the targeted output (adding the input*learning_rate) 
- we adjust the weights of the predicted output (substracting the input*learning_rate) 
- we return false
if the output chosen is correct,
- we return true
*/
var learn = function(outputs, input, targeted_label,learning_rate){

	var maxScore = null;
	var bestPrediction = 0;
	for(var o = 0;o<outputs.length; o++){
		var output = outputs[o];
		var score = dot_product(output, input);
		if(maxScore === null || maxScore < score){
			maxScore = score;
			bestPrediction = o;
		}
	}

	if(targeted_label != bestPrediction){
		var incorrect = outputs[bestPrediction];
		var expected = outputs[targeted_label];
		//console.log("adjust "+bestPrediction+"/"+targeted_label);
		//first the bias
		expected[0] += learning_rate;
		incorrect[0] -= learning_rate;
		for (var i = 0; i < input.length; i++){
			expected[i+1] += learning_rate * input[i]; //output is 0 and should  be 1 -> add
			incorrect[i+1] -= learning_rate * input[i]; //output is 1 and should  be 0 -> sub
		}
		return false;
	}
	return true;
};


var Perceptron = function(learning_rate){
	this.outputs=null;
	this.learning_rate=learning_rate;
};
Perceptron.prototype.train = function(training_set){
	var startTime = new Date().getTime();

	var numberofpixels = training_set.pixels(0).length;
	
	//random init 
	if(this.outputs === null){
		this.outputs = [];
		for(var i = 0;i<10+1;i++){
			var output = [];
			for(var j = 0;j<(numberofpixels+1);j++){
				output.push(Math.random());
			}
			this.outputs.push(output);
		}
	}
	//learn from every input
	for (var i = 0; i < training_set.size(); i++){
		learn(this.outputs,training_set.pixels(i),training_set.label(i),this.learning_rate);
	}

	console.log("Training done in "+(new Date().getTime() - startTime)+"ms");
};

Perceptron.prototype.predict = function(input,verbose){
	var outputs = this.outputs;
	var maxScore = null;
	var bestPrediction = 0;
	for(var o = 0;o<outputs.length; o++){
		var output = outputs[o];
		var score = dot_product(output, input);
		if(typeof verbose !== "undefined" && verbose)
			console.log(o+" = "+score);
		if(maxScore === null || maxScore < score){
			maxScore = score;
			bestPrediction = o;
		}
	}
	return bestPrediction;
};
Perceptron.prototype.score = function(test_set){
//TODO
//The basic idea is to compute all precision and recall of all the classes, 
//then average them to get a single real number measurement.
};


Perceptron.prototype.serialize = function(){	
	return JSON.stringify(this.outputs);
};

Perceptron.prototype.loadBackup = function(){
	var perceptron = this;
	$.ajax({
		url: "data/outputs.json",
		dataType: "json",
		success: function(data) {
			perceptron.outputs = data;
		}
	});
};

return new Perceptron(0.1);

})();



/* TRAINING; UNCOMMENT TO EXPORT NEW DATA
Data.loadTrainingSet(function(){
	Perceptron.train(Data.trainingSet());
	Data.loadTestSet(function(){
		var data = Data.testSet();
		var tp = 0;
		for(var i = 0;i<data.size();i++){
			if(data.label(i) == Perceptron.predict(data.pixels(i))){
				tp++;
			}
		}
		console.log(Math.round(100*tp/data.size(),2)+"% found");
		$('body').html(Perceptron.serialize());
	});	
});
*/