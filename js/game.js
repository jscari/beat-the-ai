var Game = (function () {

	var TIMELIMIT=1000*10;
	var FIRSTDIGIT=1;
	var CPULAG = 100;//we slow the choices made by the cpu, as if the cpu had to move the mouse :D
	/*http://biology.stackexchange.com/questions/21790/how-long-does-a-signal-from-the-brain-take-to-reach-the-limbs
	On average non-voluntary reflexes 
	(which is actually information going to the CNS, being processed, and then going out to the motor neurons) 
	take about 0.3 seconds. 
	However, the average human can blink in about 0.1 seconds, which is probably a better measure.
	*/
	/** draw a grey pixel*/
	var _drawPixel = function(ctx,x,y,greyvalue){
		ctx.fillStyle = "rgb("+greyvalue+","+greyvalue+","+greyvalue+")";
		ctx.fillRect( x, y, 1, 1 );
		//console.log(x,y,greyvalue,ctx);
	};
	/** draw a number in the given canvas*/
	var _drawNumber = function(canvas,pixels){	
		var ctx = canvas.getContext("2d");	
		var cw = canvas.width;
		var ch = canvas.height;
		//ctx.fillStyle="red";
		//ctx.fillRect(0,0,cw,ch);
		ctx.clearRect(0,0,cw,ch);
		for(var i = 0; i <pixels.length; i++){
	    	var x = i%28;
	    	var y = Math.floor(i/28);
	    	_drawPixel(ctx,x,y,pixels[i]);
	    }
	};

	/** get 3 random input, one and only one of the input must have the target label,
	return an array with the 3 input and the indice of the input with the target value*/
	var _getRandomInputs = function(target){
		var data = Data.testSet();
		var l1, l2, l3 = -1;
		var r1, r2, r3 = -1;
		var i1, i2, i3 = null;
		while(l1!=target){
			r1 = Math.floor(Math.random()*data.size());
			l1 = data.label(r1);
		};
		
		do{
			r2 = Math.floor(Math.random()*data.size());
			l2 = data.label(r2);
		}while(l2==l1);

		do{
			r3 = Math.floor(Math.random()*data.size());
			l3= data.label(r3);
		}while(l3==l1 || l3==l2);

		var r = Math.floor(Math.random()*3);
		var res = [];
		res[r]=data.pixels(r1);
		res[(r+1)%3]=data.pixels(r2);
		res[(r+2)%3]=data.pixels(r3);
		res[3]=r;
		return res;
	};


	/**click on a canvas*/
	var _click = function(canvas){
		if(this._gameEnded) return;
		if(canvas==this._correctCanvas){		
			this._canvass[canvas].style.borderColor = "green";	
			this._correctAnswerCallback(this, canvas);
			this._turn++;
			if(this._mode==="cpu")
				this._cpuScore++;
			else
				this._playerScore++;
			this.nextTurn();
		}
		else{
			this._canvass[canvas].style.borderColor = "red";
			this._wrongAnswerCallback(this,canvas);
		}
	};

	/**timer*/
	var _tic = function(){
		this._timer-=10;
		this._$timerDiv.html(this._timer/1000);
		if(this._timer == 0) this.stopQuizz();
	};

	var Game = function() {
		this._mode=null;//must be player or cpu
		this._turn=-1;//starting digit
		this._playerScore=0;
		this._cpuScore=0;
		this._correctCanvas=-1;//canvas with the correct digit
		this._canvass=[];//list of dom canvas 1 where we will draw the digit
		this._pixelss=[];//assigned pixel to each canvas
		this._timer=0;// max time
		this._$timerDiv=null;// div where we will display the timer
		this._$timerInterval=null;// refresh rate of the timer
		this._tryAGuessCallback=null;/*for the AI; called when the ai van make a new guess*/
		this._correctAnswerCallback=null;/*for the AI; called after a correct answer has been given*/
		this._wrongAnswerCallback=null;/*for the AI; called after a wrong answer has been given*/
		this._gameEndCallback=null;/*for the AI; called after the game end*/
		this._gameEnded=false;
	};
	/** init some stuff on the board and in the cache*/
	Game.prototype._init=function(){
		if(typeof this.__initDone !== "undefined") return;
		//zoom X10
		document.getElementById("drawingPad1").getContext("2d").scale(10, 10);
		document.getElementById("drawingPad2").getContext("2d").scale(10, 10);
		document.getElementById("drawingPad3").getContext("2d").scale(10, 10);


		this._canvass=[];
		for(var i = 0;i<3;i++){
			this._canvass.push(document.getElementById("drawingPad"+(i+1)));
		}
       	this._$timerDiv = $("#timercount");
       	this.__initDone=true;
	};
	Game.prototype.stopQuizz=function(){
			clearInterval(this._$timerInterval);
			this._gameEnded = true;
			this._gameEndCallback(this);

			if(this._mode==="player"){
				if(confirm("You just scored "+this._playerScore+"\nChose cancel to retry or confirm to let your computer play.\n\nnote: To be fair, it is true that your computer doesn't have to move the mouse or touch the screen, so we will slow it down purposely (by making it wait for the digits to be displayed and adding "+CPULAG+"ms before allowing it to answer )")){
					this.setCPUMode();
					this.startQuizz();
				}else{
					this._playerScore=0;
					this.startQuizz();
				}
				
			}
			
	};
	Game.prototype.nextTurn = function(){
			
			$("#score").html("Your Score : "+this._playerScore+" - Your computer score : "+this._cpuScore);
			$("#findthe").html("Find the "+this._turn%10);

			var inputs = _getRandomInputs(this._turn%10);
			this._correctCanvas=inputs[inputs.length-1];
			this._pixelss=inputs.slice(0, -1);
			for(var i = 0;i<this._canvass.length;i++)
				this._canvass[i].style.borderColor="black";
			_drawNumber(this._canvass[0],inputs[0]);
			_drawNumber(this._canvass[1],inputs[1]);
			_drawNumber(this._canvass[2],inputs[2]);
			this._tryAGuessCallback(this);
	};
	Game.prototype.startQuizz = function (){
			if(this.mode === null) throw "Select a mode first setPlayerMode() or setCPUMode()";

        	this._init();
        	this._turn=FIRSTDIGIT;
        	this._timer=TIMELIMIT;
        	this._gameEnded=false;
			//var pixels = Data.testSet().pixels(randomInput);
			//var label = Data.testSet().label(randomInput);
			this.nextTurn(); 
			this._$timerInterval = setInterval(_tic.bind(this),10) ;
	};
		/** listen for player input*/
	Game.prototype.setPlayerMode=function(){
			this._mode="player";
			$("#drawingPad1").click(function(){_click.bind(this)(0);}.bind(this));
			$("#drawingPad2").click(function(){_click.bind(this)(1);}.bind(this));
			$("#drawingPad3").click(function(){_click.bind(this)(2);}.bind(this));

			this._tryAGuessCallback=function(){};
			this._correctAnswerCallback=function(){};
			this._wrongAnswerCallback=function(){};
			this._gameEndCallback=function(){};
	};
	/** listen for cpu inputs*/
	Game.prototype.setCPUMode=function(){
			this._mode="cpu";

			$("#drawingPad1").unbind( "click" );
			$("#drawingPad2").unbind( "click" );
			$("#drawingPad3").unbind( "click" );

			var lag = CPULAG;
			var alreadyTried=[];
			var clickFunction = _click.bind(this);
			var clicktimeout;
			var clicktimeout;

			var guess = function(game){
				
				//overkill ... if(true){clickFunction(game._correctCanvas);return;}

				var guess = -1;
				var target = game._turn%10;
				for(var i = 0;i<game._pixelss.length;i++){
					if(alreadyTried.indexOf(i)>=0) continue;
					var pixels = game._pixelss[i];
					var predicted = Perceptron.predict(pixels);
					if(predicted==target){
						guess = i;
						break;
					}
				}

				if(guess == -1){
					//take a random guess...
					for(var i = 0;i<game._pixelss.length;i++){
						if(alreadyTried.indexOf(i)>=0) continue;
						guess = i;
						break;
					}
				}
				if(guess == -1){
					console.error("Could not find anything");
					console.error(alreadyTried);
					return;
				}
				alreadyTried.push(guess);
				clicktimeout = setTimeout(function(){clickFunction(guess)},lag);

			}; 

			this._tryAGuessCallback=guess;

			this._correctAnswerCallback=function(game,correct_guess){
				alreadyTried.length=0;
			};
			this._wrongAnswerCallback=function(game,incorrect_guess){
				alreadyTried.push(incorrect_guess);
				guess(game);
			};
			this._gameEndCallback=function(){
				clearTimeout(clicktimeout);
			};
	};
	return new Game();
})();