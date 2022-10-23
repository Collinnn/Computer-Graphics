
var gl

window.onload = function init(){
    const canvas = document.querySelector("#gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    
    if(gl == null){
        alert("Not supported");
        return;
    }
    //Array of points
    var array = [vec2(0.0,0.5),vec2(-0.5,-0.5),vec2(0.5,-0.5)]

    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //import shaders
    var program = initShaders(gl, "Shaders/vshaderw1p2.glsl", "Shaders/fshaderw1p2.glsl");
    gl.useProgram(program);

    //create buffer
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(array),gl.STATIC_DRAW);

    //Enable vertex
    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPos);
    render(array.length);
    
 

}

function render(points)
{
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points);
}