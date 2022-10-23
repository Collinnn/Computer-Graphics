
var gl

window.onload = function init(){
    const canvas = document.querySelector("#gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    
    if(gl == null){
        alert("Not supported");
        return;
    }
    //Array of points and colors
    var vertices = [vec2(0.0,0.0),vec2(1.0,1.0),vec2(1.0,0.0)]
    var colors =[vec4(1.0,0.0,0.0,1.0),vec4(0.0,1.0,0.0,1.0),vec4(0.0,0.0,1.0,1.0)]

    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //import shaders
    var program = initShaders(gl, "Shaders/vshaderw1p3.glsl", "Shaders/fshaderw1p3.glsl");
    gl.useProgram(program);

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


    render(vertices.length);
    
 

}

function render(points)
{
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points);
}