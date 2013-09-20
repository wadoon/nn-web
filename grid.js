var SCALE_X = 100;
var SCALE_Y = 100;


var MIN_X = -SCALE_X; 
var MIN_Y = -SCALE_Y; 
var MAX_X = SCALE_X; 
var MAX_Y = SCALE_Y; 

var currentClass = undefined;
var canvas = undefined;
var ctx = undefined;

var classColor = ['red', 'blue', 'green', 'orange', 'pink'];
var data = [ [], [], [], [], [] ];
var rng; 

var int = parseInt;
var float = parseFloat;

function addCluster() {
    var amount = int($('#amount').val());
    var mu_x   = float($('#mu_x').val());
    var mu_y   = float($('#mu_y').val());  
    var var_x  = float($('#var_x').val());
    var var_y  = float($('#var_y').val());
    
    var a = 1 - float($('#a').val());
    var b = 1 - float($('#b').val());
    
    generateDataForCluster(amount, mu_x, var_x, mu_y, var_y, a, b, currentClass);
}

function generateDataForCluster(amount, mu_x, var_x, mu_y, var_y, a, b, in_class) {
     for(i = 0; i < amount; i++) {
	  var x = rng.normal();		  
	  var y = rng.normal();
	  	  	  
	  var x_ = var_x * (a*x+(1-a)*y) + mu_x; 
	  var y_ = var_y * (b*y+(1-b)*x) + mu_y;	  
	  
	  data[in_class].push([x_,y_ ]);      
    }    
    drawData(); 
}

function setClass(i) {
 $('a.classes').removeClass('selected'); 
 $('#class'+i).addClass('selected');
 currentClass = i;  
}

function drawLine(x1,y1,x2,y2) {
 ctx.beginPath();

 ctx.moveTo(x1,y1);
 ctx.lineTo(x2,y2);
 
 ctx.stroke();
    
}

function drawGrid() {   
    ctx.lineWidth="1";
    ctx.strokeStyle="black";
    drawLine(0, MIN_Y, 0, MAX_Y);
    drawLine(MIN_X, 0, MAX_X, 0);
            
    ctx.lineWidth="0.1";
    ctx.strokeStyle="grey";
    
    for(var i = MIN_X; i < MAX_X; i+=10) {    
      drawLine(i, MIN_Y, i, MAX_Y);
      drawLine(MIN_X, i, MAX_X, i);       
    }
        
}

var RADIUS = 1;
function drawPoint(x,y) {          
    ctx.beginPath();   
    ctx.arc(x,y,RADIUS,0,2*Math.PI);
    ctx.fill();  
}
  
function drawData() {
  for(var i = 0; i < data.length; i++ ) {
      ctx.strokeStyle = classColor[i];
      ctx.fillStyle = classColor[i];
      var c = data[i];
      for(var j = 0; j < c.length; j++) {
	var d = c[j];
	
	
	drawPoint(d[0], d[1]);
      }      
  }
}
   
   
function distance(x1, y1, x2, y2) {
  var x = (x1-x2);
  var y = y1-y2;
  return Math.sqrt( x*x + y*y )    
}
   
function sortfst(a , b) {
    return a[0] - b[0];
}

   
function knn_classify( x , y, k ) {
  var current_max = distance(-100,-100,100,100)+1;
  var nearest = [];   
  
  
  for(var i = 0; i < data.length; i++) {
      for(var j = 0; j < data[i].length; j++) {
	var u = data[i][j][0];
	var v = data[i][j][1];	
	var dist = distance(x,y, u,v);
	nearest.push([dist, u, v, i]);
      }    
  }    
  nearest.sort(sortfst);	 	
  nearest = nearest.slice(0,k);
  
  
  var cm = [];
  for(var i = 0; i < data.length; i++) {
      cm[i] = 0;    
  }
  
  for(var i = 0; i < nearest.length; i++) {
      cm[ nearest[i][3] ] += 1;    
  }  
  
  var max = -1;
  var maxidx = -1;
  for(var i = 0; i < cm.length; i++) {
    if(cm[i] > max) {
      max = cm[i]; maxidx = i;      
    }    
  }    
  return maxidx;
}

function resetClassifyRegion() {
 clearCanvas(); drawGrid(); drawData()
}

function clearCanvas() {  
 ctx.clearRect ( -MAX_X , -MAX_Y , 2* MAX_X , 2 * MAX_Y );   
}

var K_NN = 10;
var STEP_X = STEP_Y = 2;

var classification = [];
function classifyRegion() {
  clearCanvas();    
  for(var x = MIN_X; x < MAX_X; x+=STEP_X) {
    for(var y = MIN_Y; y < MAX_Y; y+=STEP_Y) { 
	var c = knn_classify(x,y, K_NN);
	var clr = classColor[c];		
	ctx.fillStyle = clr;
	drawPoint(x,y);
    }
  }
}
  
  
  
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  var pxX =  evt.clientX - rect.left;
  var pxY =  evt.clientY - rect.top;
    
  return {
          x:  (pxX - Ttx) / Tsx  ,
          y:  (pxY - Tty) / Tsy
  };
}
      
     
function onCanvasClick(evt) {  
  var m = getMousePos(canvas,evt);
  data[currentClass].push([m.x,m.y]);
  drawData();  
}
  
function onCanvasMouseMove(evt) {  
  var mousePos = getMousePos(canvas, evt);
  var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
  //console.log(message);  
}

var Tsx;
var Tsy;

var Ttx;
var Tty;
   
function main() {
  canvas = document.getElementById('frame');
  ctx = canvas.getContext('2d');
  
  canvas.addEventListener('click', onCanvasClick);  
  canvas.addEventListener('mousemove', onCanvasMouseMove);
  
  if(!ctx) {
    alert('painting not supported');
  }
  
  //tranform the underlying space to origin (0,0) in center
  // and a scale from -10 till 10
  
  var centerX = canvas.width/2;
  var centerY = canvas.height/2; 
  
  
  Ttx = centerX;
  Tty = centerY;
  
  Tsx =   centerX/SCALE_X;  
  Tsy = - centerY/SCALE_Y;
  
  ctx.translate(Ttx, Tty);
  ctx.scale( Tsx, Tsy);
      
  rng = new RNG(Math.random);
  setClass(0);  
  
  var a = 0.4;
  var b = 0.3;
  
  $('#K_NN').val(K_NN);
  
  generateDataForCluster(100, 50, 10, 50, 10, a, b, 0);
  generateDataForCluster(100, -50, 10, 50, 30, a, b, 1);
  generateDataForCluster(100, 50, 10, -50, 20, a, b,2);
  generateDataForCluster(100, -50, 50, -50, 30, a, b, 3);
  
  
  resetClassifyRegion();
}
