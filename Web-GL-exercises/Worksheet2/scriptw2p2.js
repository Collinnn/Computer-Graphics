
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
    var program = initShaders(gl, "Shaders/vshaderw2p2.glsl", "Shaders/fshaderw2p2.glsl");
    gl.useProgram(program);

    //create vertex buffer
    var max_verts = 1000;
    var index = 0; var numPoints = 0;
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec2'], gl.STATIC_DRAW);

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

    //mouse controls
    var mousepos = vec2(0.0,0.0);
    canvas.addEventListener("click", function (ev) {
        //bbox centers
        var bbox = ev.target.getBoundingClientRect();
        mousepos = vec2(2*(ev.clientX - bbox.left)/canvas.width - 1, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec2'], flatten(mousepos));
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferc);
        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec4'], flatten(colors[ColorIndex]));
        numPoints = Math.max(numPoints, ++index); 
        index %= max_verts;
    });


    

    
    //Clear canvas button
    var clearCanvasButton = document.getElementById("clearCanvas");
    clearCanvasButton.addEventListener("click",function(ev){
        //gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec2'], flatten(mousepos));
        numPoints=0;
        index=0;
        gl.clearColor(colors[ColorIndex][0],colors[ColorIndex][1],colors[ColorIndex][2],colors[ColorIndex][3])
    });
    
    function tick(){
        render(gl,numPoints); 
        requestAnimationFrame(tick);
    }
    tick();


 

}

function render(gl,points)
{
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points);
}