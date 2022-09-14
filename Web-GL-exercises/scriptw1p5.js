
var gl

window.onload = function init(){
    const canvas = document.querySelector("#gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    
    if(gl == null){
        alert("Not supported");
        return;
    }

    //Array of points and colors
    var vertices = [vec2(0.0,0.0)];
    var colors =[vec4(1.0,0.0,0.0,0.0)];
    //Array for circle
    const r = 0.5;
    for(var i=0.0;i<=100.0;i++){
        vertices.push(vec2(r*Math.cos(i*2*Math.PI/100.0),r*Math.sin(i*2*Math.PI/100.0)));
        colors.push(vec4(Math.cos(i),Math.cos(i),Math.tan(i),1.0));

    };


    

    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //import shaders
    var program = initShaders(gl, "Shaders/vshaderw1p5.glsl", "Shaders/fshaderw1p5.glsl");
    gl.useProgram(program);

    //Enable simple time for rotation
    var vloc= gl.getUniformLocation(program, "v");
    var v = 0.0;
    var w = 0.01;
    

    
    //tick function to handle time with gl
    function tick(){
        //Movement
        v +=w;
        w = Math.sign(1-r-Math.abs(v))*w;
        gl.uniform1f(vloc,v);
        render(gl,vertices.length); 
        requestAnimationFrame(tick);
    }


    //create buffer
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);

    //Enable vertex
    var vPos = gl.getAttribLocation( program, "a_Position" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPos);
    
    //create colorbuffer
    var bufferc = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferc);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);
    
    
    //Enable colors
    var vCol = gl.getAttribLocation( program, "a_Color" );
    gl.vertexAttribPointer( vCol, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vCol);
    

    tick();
    
 

}

function render(gl,points)
{
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, points);
}