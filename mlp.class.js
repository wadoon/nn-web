var rng = new RNG('Example');

function sigmoid(x){
	return 1./(1.+Math.exp(-x))
}

function dsigmoid(x) {
	return x * (1. - x)
}

function dot(a, b) {
    var s = 0;

    if(a.length != b.length) {
      console.error("vector length mismatch!");
    }
    
    for (var i = 0; i < a.length; i++)
        s += a[i] * b[i];
    return s;
}

function zeros(n, fn) {
	
	if(fn == undefined){
		fn = function() {return 0;};
	}

	var a = new Array(n);	
	for(var i = 0; i < n; i++){
		a[i] = fn();
	}	
	return a;
}

function randn(n) {
	return zeros(n, 
		function() { return rng.normal() * 0.3; });
}

function MLP(hidden) {
	this.learnrate = 1;
	this.hiddenCount = hidden;
	this.hWeight  =  zeros(hidden, 
		function() {return randn(3);});
	this.hOutput = zeros(hidden);
	this.hDelta = zeros(hidden);
	this.iOutput = zeros(3);

	this.oWeight = randn(hidden);
	this.oOutput = 0;
	this.oDelta =  0;
	
	this.errorHistory = [];
}


MLP.prototype.forward = function(x) {
	this.iOutput = x;
	for(var i = 0; i < this.hiddenCount; i++) {
		this.hOutput[i] = sigmoid(dot( this.hWeight[i], x));		
	}
	this.oOutput = sigmoid(dot(this.hOutput, this.oWeight));
	return this.oOutput;
}

MLP.prototype.backprop = function(c)  {
	
	var error_o      = c - this.oOutput;
	this.oDelta      = dsigmoid(this.oOutput) * error_o

	for(var i = 0; i < this.hiddenCount; i++) {
		var error_h    = this.oDelta * this.oWeight[i];
		this.hDelta[i] = dsigmoid(this.hOutput[i]) * error_h
	}

	this.oWeight = add(this.oWeight, multiply( this.learnrate * this.oDelta, this.hOutput));
	for(var i = 0; i < this.hiddenCount; i++) {
		this.hWeight[i] = add(this.hWeight[i], 
			multiply(this.learnrate * this.hDelta[i],  this.iOutput));
	}
}

MLP.prototype.error = function(data) {
	var sum = 0;
	for(var i = 0; i < data.length; i++) {
		var o = this.forward(prepareData(data[i]));
		var t = data[i][2];

		sum += (t-o) * (t-o);
	}
	return sum / data.length;
};

MLP.prototype.train = function(data, epochs) {
  for(var i = 0; i < epochs; i++){
  	for(var dt in data) {
  		var d = prepareData(data[dt]);
  		var o = (data[dt][2] + 1) / 2; // -1 => 1 | 1 => 1
  		this.forward(d);
  		this.backprop( o );
				
  	}
	
	this.errorHistory.push(this.error(data));
  }
}

MLP.prototype.draw = function() {
	var layer = new Kinetic.Layer();

	for(var x = MIN_X; x < MAX_X; x+=5) {
		for(var y = MIN_Y; y < MAX_Y; y+=5) {
			var o = this.forward([1, x, y]);		
			var clr = ("rgb(" + Math.round(255 * (1-o)) + ","+ Math.round(255 * o)+",0)");

			var circle = new Kinetic.Rect({
				x: x, 
				y: y,
				height: 5,
				width: 5,
				strokeWidth:0,
				stroke: clr,
				fill: clr
			});
			layer.add(circle);
		}
	}
	return layer;
};

function elementwise(a , b, fn) {
	if(a.length != b.length) {
		console.error("length mismatch");
	}

    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++)
        c[i] = fn(a[i],  b[i]);
    return c;
}

function elementwiseUnary(a , fn) {

    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++)
        c[i] = fn(a[i]);
    return c;
}

function add(a,b) { return elementwise(a,b, function(x,y){return x+y;});}
function multiply(cnst,b) { return elementwiseUnary(b, function(x){return cnst*x;});}


var mlpLayer = new Kinetic.Layer();
function startMLP(){
  var epochs = $('#epochs').val();
  var mlp = new MLP(3);
  mlp.train(data, epochs );

  plotDataLine(mlp.errorHistory);
  
  mlpLayer.remove();  
  var opacity = mlpLayer.getOpacity();
  mlpLayer = mlp.draw();
  mlpLayer.setOpacity(opacity);
  stage.add(mlpLayer);
}

/*
window.onload = function() {
  for(var i = 0 ; i < 100; i++) {
  	addDataPoint( rng.gamma(5)*10, rng.gamma(5)*10, 1);
  	addDataPoint( 50+rng.normal()*10, -50+rng.exponential()*240, -1);
  	addDataPoint( -50+rng.normal()*10, -50+rng.exponential()*240, -1);
  }
  
  var mlp = new MLP(3);


  for(var i = 0; i < 20; i++){
  	for(var dt in data) {
  		var d = prepareData(data[dt]);
  		var o = (data[dt][2] + 1) / 2; // -1 => 1 | 1 => 1
  		console.log(mlp.forward(d));
  		mlp.backprop( o );

  		//console.log(mlp.error(data));  		
  	}
  }

  stage.add(mlp.draw());

};
*/