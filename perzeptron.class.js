function scalarprod(a, b) {
    var s = 0;

    if(a.length != b.length) {
      console.error("vector length mismatch!");
    }
    
    for (var i = 0; i < a.length; i++)
        s += a[i] * b[i];
    return s;
}

function sign(a) {
    return a < 0 ? -1 : 1;
}

function sum(a) {
    var s = 0;
    for (var i = 0; i < a.length; i++)
        s += a[i];
    return s;
}

function applyWeights(addOrSub, weights, update) {
    for (var i = 0; i < weights.length; i++) {
        if (addOrSub) {
            weights[i] += update[i];
        } else {
            weights[i] -= update[i];
        }
    }
}


function prepareData(d) {
    return [1, d[0], d[1]];
}



function Perzeptron(initWeights, data) {
    this.weights = initWeights;
    this.weightHistory = [initWeights];
    this.data = data;

    this.errorHistory = [this.error()];
}

Perzeptron.prototype.constructor = Perzeptron;

Perzeptron.prototype.walk = function () {
    alert('I am walking!');
};

Perzeptron.prototype.distance = function() {
  var result = new Array(this.data.length);
  for(var i in this.data) {
    result[i] = scalarprod(this.weights, prepareData( this.data[i] ));
  }
  return result;
};

Perzeptron.prototype.classify = function () {
    var result = this.distance();    
    for(var i in result) {
        result[i] = sign(result[i]);
    }    
    return result;
};

Perzeptron.prototype.error = function () {
    var classifies = this.classify();
    var sum = 0;

    for(var c in classifies) {
      if(classifies[c] != this.data[c][2]) 
      {
        sum+=1
      }
    }
    return sum
};



Perzeptron.prototype.step = function () {
    var c = this.classify();

    var newWeights = this.weights.slice();

    for (var i = 0; i < c.length; i++) {
        if (c[i] != this.data[i][2]) {
            applyWeights(this.data[i][2] == 1, newWeights, prepareData(this.data[i]))
        }
    }

    this.weightHistory.push(newWeights);
    this.weights = newWeights;
    var e = this.error();    
    this.errorHistory.push( e);
    return e;
};

const FRAMESWITCH = 200;
Perzeptron.prototype.draw = function (optionsLine) {
    var layer = new Kinetic.Layer();

    function weights2line(w) {
        var b = w[0];
        var w1 = w[1];
        var w2 = w[2];

        function mxb(x) {
            return (b + x * w1) /  - w2;
        }
        return [MIN_X, mxb(MIN_X), MAX_X, mxb(MAX_X)];
    }

    console.log(weights2line(this.weights));


    var points = this.weightHistory.map(weights2line);

    for(var i = 0; i < points.length; i++) {
      var line = new Kinetic.Line(
        copyInto(optionsLine,     
          { stroke: "rgba(0,0,0,"+ (i+1)/(1+points.length) +")",
            points: points[i]}));    
        layer.add(line);
    }

    /*
    var count = this.weightHistory.length;
    var anim = new Kinetic.Animation(function(frame) {
        var time = frame.time;

        var i = Math.round(time / FRAMESWITCH) % count;
        currentLine.setPoints(points[ i ]);

    }, layer);

    anim.start();
    */

    return layer;
};


