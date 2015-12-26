var Data = {
	_testSet:null,
	_trainingSet:null,
	/** jquery call $.ajax ...*/
	_loadFile:function(path,success){
		$.ajax({
		        type: "GET",
		        url: path,
		        dataType: "text",
		        success: success,
		        error: function (request, status, error) { alert(path+" not found.\n"+request.responseText); }
		     });
	},
	/** return the test set (must be loaded first)*/
	testSet(){
		if(this._testSet == null)
			throw "Empty testSet, did you call loadTestSet() ?" ;
		else
			return this._testSet;
	},
	/** return the training set (must be loaded first)*/
	trainingSet(){
		if(this._trainingSet == null)
			throw "Empty trainingSet, did you call loadTrainingSet() ?" ;
		else
			return this._trainingSet;
	},
	/** load the test set, it will be available calling with testSet() */
	loadTestSet:function(success){
		Data._loadFile("/data/mnist_test.csv",function(data){this._testSet=new DataSet(data);success();}.bind(this));
	},
	/** load the training set, it will be available calling with testTraining() */
	loadTrainingSet:function(success){
		Data._loadFile("/data/mnist_train.csv",function(data){this._trainingSet=new DataSet(data);success();}.bind(this));
	},

};


var DataSet = function(csv) {
  this.data = csv.split("\n");
};

DataSet.prototype.size = function(){
  return this.data.length;
};
DataSet.prototype.label = function(i){
	try{
		return parseInt(this.data[i][0]);
	}catch(e){
		console.log(i);
	}
  
};
DataSet.prototype.pixels = function(i){
	var pixels = this.data[i].slice(2).split(",");
	pixels = pixels.map(function(value){
		return parseInt(value);
	});
  	return pixels;
};