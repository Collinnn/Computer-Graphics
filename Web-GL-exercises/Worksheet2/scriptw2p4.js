
var gl

window.onload = function init(){
    const canvas = document.querySelector("#gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    
    if(gl == null){
        alert("Not supported");
        return;
    }

    //Color controls
    var ColorIndex=0;
    var colors=[
        vec4(0.0,0.0,0.0,1.0), // Black
        vec4(1.0,0.0,0.0,1.0), // Red
        vec4(1.0,1.0,0.0,1.0), // Yellow
        vec4(0.0,1.0,0.0,1.0), // Green
        vec4(0.0,0.0,1.0,1.0), // Blue
        vec4(1.0,0.0,1.0,1.0), // Magenta
        vec4(0.0,1.0,1.0,1.0), // Cyan
        vec4(1.0,1.0,1.0,1.0), // Weiß
        vec4(0.3921, 0.5843, 0.9294, 1.0), // Cornflower
    ]
    var m = document.getElementById("colorpick");

    
    
    m.addEventListener("click",function(){ColorIndex=m.selectedIndex;});


    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(colors[8][0],colors[8][1],colors[8][2],colors[8][3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //import shaders
    var program = initShaders(gl, "Shaders/vshaderw2p4.glsl", "Shaders/fshaderw2p4.glsl");
    gl.useProgram(program);

    //create vertex buffer
    var max_verts = 1000;
    var max_triangle= 100;
    var index = 0; var numPoints = 0;
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec2']+max_triangle*sizeof['vec2']*3, gl.STATIC_DRAW);

    //Enable vertex
    var vPos = gl.getAttribLocation( program, "a_Position" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPos);

    //create colorbuffer
    var bufferc = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferc);
    gl.bufferData(gl.ARRAY_BUFFER,max_verts*sizeof['vec4'] ,gl.STATIC_DRAW);
    
    //Enable colors
    var vCol = gl.getAttribLocation( program, "a_Color" );
    gl.vertexAttribPointer( vCol, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vCol);  
    
     
    //Get buttons and listen
    var triangleButton = document.getElementById("triangle");
    var circleButton = document.getElementById("cicle");
    var pointsButton = document.getElementById("points");

    var trianglePressed = false;
    var pointsPressed = true;
    var circlePressed = false;
    

    //Buttons listeners
    triangleButton.addEventListener("click",function(ev){
        trianglePressed = true;
        pointsPressed = false;
        circlePressed = false;
    });

    pointsButton.addEventListener("click",function(ev){
        trianglePressed = false;
        pointsPressed = true;
        circlePressed = false;
    });

    circleButton.addEventListener("click",function(ev){
        trianglePressed = false;
        pointsPressed = false;
        circlePressed = true;
    });
    

    //mouse controls
    var mousepos = vec2(0.0,0.0);
    var Triarr = [];
    var Pointarr = [];
    var circleArr = [];
    var pointset= 0;
    var x,y;
    canvas.addEventListener("click", function (ev) {
        //bbox centers
        var bbox = ev.target.getBoundingClientRect();
        mousepos = vec2(2*(ev.clientX - bbox.left)/canvas.width - 1, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 1);
        if(trianglePressed){
            switch(pointset){
                case 0:
                case 1: 
                    pointset++;
                    addPoint(mousepos);
                    break;
                case 2:
                    pointset = pointset-2;
                    addPoint(mousepos);
                        addTriangle();
                    
                    break;
                default:
                    break;
            }
        } 

        else if(circlePressed){
            switch(pointset){
                case 0:
                    x=mousepos[0];
                    y=mousepos[1];
                    addPoint(mousepos);
                    pointset++;
                    break;
                case 1:
                    addCircle(mousepos);
                    pointset --;
                    break;
            }

        }
        else if(pointsPressed){
            pointset=0;
            addPoint(mousepos);
        }
    });

    function addPoint(point){
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec2'], flatten(point));
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferc);
        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec4'], flatten(colors[ColorIndex]));
        Pointarr.push(index);
        numPoints = Math.max(numPoints, ++index); 
        index %= max_verts;
    }
    function addTriangle(){
        Triarr.push(Pointarr.pop()-2);
        Pointarr.pop();
        Pointarr.pop();
    }
    function addCircle(mousepos){
        circleArr.push(Pointarr.pop())
        var r = Math.sqrt((mousepos[0]-x)*(mousepos[0]-x)+(mousepos[1]-y)*(mousepos[1]-y));
        for(var i=0.0;i<=100.0;i++){
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec2'], flatten(vec2(r*Math.cos(i*2*Math.PI/100.0)+x,r*Math.sin(i*2*Math.PI/100.0)+y)));
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferc);
            gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec4'], flatten(colors[ColorIndex]));
            numPoints = Math.max(numPoints, ++index); 
            index %= max_verts;
        };
    }




    
    //Clear canvas button
    var clearCanvasButton = document.getElementById("clearCanvas");
    clearCanvasButton.addEventListener("click",function(ev){
        numPoints=0;
        index=0;
        Pointarr = [];
        Triarr = [];
        circleArr = [];
        pointsPressed = true;
        circlePressed = false;
        trianglePressed = false;
        pointset = 0;
        gl.clearColor(colors[ColorIndex][0],colors[ColorIndex][1],colors[ColorIndex][2],colors[ColorIndex][3])
    });
    
    function tick(){
        render(gl,Triarr,Pointarr,circleArr); 
        requestAnimationFrame(tick);
    }
    tick();


 

}

function render(gl,triarr,pointarr,circleArr)
{
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    triarr.forEach(element => {
        gl.drawArrays(gl.TRIANGLES,element,3);
    });
    pointarr.forEach(element => {
        gl.drawArrays(gl.POINTS,element,1);
    });
    circleArr.forEach(element => {
        gl.drawArrays(gl.TRIANGLE_FAN,element,102);
    });
}
