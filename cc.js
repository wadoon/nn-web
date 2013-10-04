var SCALE_X = 100;
var SCALE_Y = 100;


var MIN_X = -SCALE_X;
var MIN_Y = -SCALE_Y;
var MAX_X = SCALE_X;
var MAX_Y = SCALE_Y;

var currentClass = undefined;
var canvas = undefined;
var ctx = undefined;

var classColor = [
    'hsla(25,100%,50%,0.8)',
    'hsla(90,100%,50%,0.8)',
    'hsla(180,100%,50%,0.8)',
    'hsla(260,100%,50%,0.8)',
    'hsla(320,100%,50%,0.8)',
];


var clusterColor = [
    'hsla(50,100%,50%,0.8)',
    'hsla(200,100%,50%,0.8)',
    'hsla(300,100%,50%,0.8)',
    'hsla(100,100%,50%,0.8)',
    'hsla(150,100%,50%,0.8)',
    'hsla(250,100%,50%,0.8)',
    'hsla(350,100%,50%,0.8)',
];

var data = [ [], [], [], [], [] ];
var rng;

var int = parseInt;
var float = parseFloat;

function clearData() {
    data = [ [], [], [], [], [] ];
    clearCanvas();
    drawGrid();
}


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
    ctx.lineWidth="0.5";
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
var K_CLUSTER = 3;
var ROUNDS_CLUSTER = 10;

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

function writeClassCss() {

		s = "";
		i = 0;
		classColor.map(function(item, index, ary) {
				s += "#class" + (index) + " { background: "+item+"; }\n";
		});


		var scrpt = document.createElement("style");
		var txt = document.createTextNode(s);

		scrpt.appendChild(txt);

		var body = document.getElementsByTagName("body")[0];
		body.appendChild(scrpt);

		console.log(s);
		console.log(scrpt);
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
    $('#K_CLUSTER').val(K_CLUSTER);
    $('#ROUNDS_CLUSTER').val(ROUNDS_CLUSTER);

    generateDataForCluster(10, 50, 10, 50, 10, a, b, 0);
    generateDataForCluster(10, -50, 10, 50, 30, a, b, 1);
    generateDataForCluster(10, 50, 10, -50, 20, a, b,2);
    generateDataForCluster(10, -50, 50, -50, 30, a, b, 3);

    resetClassifyRegion();
}




/**
 ** Clustering
 ***********************************/

function drawConnections(ameans,bmeans) {
    ctx.lineWidth="0.3";
    for(var i = 0 ; i < ameans.length; i++) {
	ctx.strokeStyle=clusterColor[i];
	drawLine(ameans[i][0], ameans[i][1],
		 bmeans[i][0], bmeans[i][1]);
    }
}

function resetCluster() {
    resetClassifyRegion();
}


function  cluster() {
    resetCluster();

    var means = initCluster(K_CLUSTER, function() {
        return [ rng.uniform() * (MAX_X),
                 rng.uniform() * (MAX_Y)];
    });

    var rounds = ROUNDS_CLUSTER;

    var history = [];
    for(var rnd = 0; rnd < rounds; rnd++) {
	history[rnd] = means;
	var newmeans = classify(means);
        console.log(newmeans);
	drawConnections(means, newmeans);

	means = newmeans;
    }

    var sites = [];
    for(var i = 0; i < means.length; i++) {
	RADIUS = 3 ;
	ctx.fillStyle   = clusterColor[i];
	drawPoint(means[i][0], means[i][1] );
	RADIUS = 1;
	sites[i] = {x: means[i][0], y: means[i][1] };
    }



		var voronoi = new Voronoi();

		var bbox = {xl: MIN_X, xr:  MAX_X ,
								yt: MIN_Y, yb: MAX_Y};

		var diagram = voronoi.compute(sites, bbox);


		ctx.fillStyle   = 'black';
		ctx.strokeStyle  = 'black';

		diagram.edges.map(function(item) {
				var va = item.va;
				var vb = item.vb;

				drawLine(va.x, va.y, vb.x, vb.y);
		});

}

function zeros(k1, k2) {
    if(k2 == 1 || k2 == undefined) {
	return initCluster(k1, function() {return 0;});
    }
    else {
	return initCluster(k1, function() {return zeros(k2,1);});
    }
}

function initCluster(k, fn) {
    var c = Array(k);
    for(var i = 0; i < k; i++) {
        c[i] = fn();
    }
    return c;
}

function classify(means) {
    var acc = zeros(means.length, 2);
    var cnt = zeros(means.length);

    for(var i = 0; i < data.length; i++) {
	for(var j = 0; j < data[i].length; j++) {
	    var c = nearestNeighbour(means, data[i][j]);

	    acc[c] = add( acc[c], data[i][j] );
	    cnt[c] = cnt[c] + 1;

	}
    }

    for(var i = 0; i < acc.length; i++ ) {
	if(cnt[i] == 0) {
	    acc[i] = add(means[i], zeros(means[i].length));
	}
	else {
	    acc[i] = mult(1.0 / cnt[i] , acc[i] );
	}
    }
    return acc;
}

function add(vec1, vec2) {
		return elementwise(vec1,vec2, function(a,b) { return a + b;});
}

function mult(scalar, vec1) {
    return elementwise(vec1, Array(vec1.length),
		       function(a,b) { return a * scalar;});
}

function sub(vec1, vec2) {
    return elementwise(vec1,vec2, function(a,b) { return a-b;});
}


function dist(vec1, vec2) {
    return norm2( sub(vec1, vec2) );
}

function norm2(vec) {
    var s = 0;
    for(var i = 0; i < vec.length; i++) {
	s += vec[i] * vec[i];
    }
    return Math.sqrt(s);
}

function elementwise(vec1, vec2, fn) {
    var t = Array(vec1.length);
    for(var i = 0; i < vec1.length; i++) {
	t[i] = fn(vec1[i],  vec2[i]);
    }
    return t;
}


function nearestNeighbour(means, data) {
    var min_mean = -1;
    var min_dist = dist([-100, -100], [100,100]) + 1;

    for(var i = 0 ; i < means.length; i++ ){
	var d = dist(means[i], data);

	if(d < min_dist) {
	    min_dist = d;
	    min_mean = i;
	}
    }
    return min_mean;
}
