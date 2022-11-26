
var gl;
var index = 0;
var pointsArray =[];
var g_objDoc = null; 
var g_drawingInfo = null;
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

window.onload = function init(){
    const canvas = document.querySelector("#gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    
    //import shaders
    gl.program = initShaders(gl, "Shaders/vshaderw6p1.glsl", "Shaders/fshaderw6p1.glsl");
    gl.useProgram(gl.program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    if(gl == null){
        alert("Not supported");
        return;
    }

    gl.vBuffer = null;
    gl.bufferc = null;
    gl.nbuffer = null;

    vertices = [
        vec4(-4,-1,-1,1),
        vec4(4,-1,-1,1),
        vec4(4,-1,-21,1),
        vec4(-4,-1,-21,1)
    ];
    
    //Create texture coord
    var texCord = [
        vec2(-1.5,0.0),
        vec2(2.5,0.0),
        vec2(2.5,10.0),
        vec2(-1.5,10.0)
    ];

    var vBuffer= gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    var vPos = gl.getAttribLocation(gl.program,"v_Position");
    gl.vertexAttribPointer(vPos,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPos);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);

    //Create and bind textures
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);

    //Upload a 2D-sample
    gl.uniform1i(gl.getUniformLocation(gl.program,"texMap"),0);

    //Create checkerboard image
    const numRows = 10;
    const numCols = 10;
    const texSize = 64;
    var myTexels = new Uint8Array(4*texSize*texSize); //4 is RGBA
    for(var i = 0; i<texSize;++i){
        for(var j = 0;j<texSize;++j){
            var texX = Math.floor(i/(texSize/numRows));
            var texY = Math.floor(j/(texSize/numCols));
            if(texX%2 !==texY%2 ){
                var color = 255;
            }else{
                var color = 0;
            }
            var index = 4*(i*texSize+j);
            myTexels[index]   = color;
            myTexels[index+1] = color;
            myTexels[index+2] = color;
            myTexels[index+3] = 255;
        }
    }
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,texSize,texSize,0,gl.RGBA,gl.UNSIGNED_BYTE,myTexels);


    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(texCord),gl.STATIC_DRAW);
    var vTexCord = gl.getAttribLocation(gl.program,"v_TexCord");
    gl.vertexAttribPointer(vTexCord,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vTexCord);

    //Set texture parameters:
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(colors[8][0],colors[8][1],colors[8][2],colors[8][3]);
    gl.clear(gl.COLOR_BUFFER_BIT);



    //Prespective matrix
    var P = perspective(90,canvas.width/canvas.height,0.1,100.0);
    var ploc = gl.getUniformLocation(gl.program,"projectionMatrix");
    gl.uniformMatrix4fv(ploc,false,flatten(P));


    //Camera postion
    var theta = 0;
    var radius = 0.1; // it is wrong when it spins. Spin spin wrong wrong.
    eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
    look = vec3(0,0,0);
    up = vec3(0,1,0);
    var V= lookAt(eye,look,up);

    var vloc= gl.getUniformLocation(gl.program, "viewMatrix");
    
    

    //Model Matrix
    var mloc =gl.getUniformLocation(gl.program,"modelMatrix");

    //Moves the camera back to get a proper view.
    M =mat4();


    /*
        var I = mat4(); // identity matrix
        var R = rotate(angle, direction);
        var Rx = rotateX(angle);
        var Ry = rotateY(angle);
        var Rz = rotateZ(angle);
        var S = scalem(s_x, s_y, s_z);
        var T = translate(t_x, t_y, t_z);
        var c = mult(a, b); // c = a*b
    */

    var spin = 0.0;
    function tick(){
        M=mult(M,rotateX(spin));
        M=mult(M,rotateY(spin));
        M=mult(M,rotateZ(spin));
        theta+=0.00;
        gl.uniformMatrix4fv(mloc,false,flatten(M));
        gl.uniformMatrix4fv(vloc, false, flatten(V));
        eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
        gl.uniform3fv( gl.getUniformLocation(gl.program, "eyepos"), flatten(eye));
        V= lookAt(eye,look,up);
        render(gl); 
        requestAnimationFrame(tick);
    }
    tick();
}

function render(gl)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, gl.UNSIGNED_BYTE, 0);

}
