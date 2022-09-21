
var gl

window.onload = function init(){
    const canvas = document.querySelector("#gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    
    if(gl == null){
        alert("Not supported");
        return;
    }

    //Different Colors
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


    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(colors[8][0],colors[8][1],colors[8][2],colors[8][3]);
    gl.clear(gl.COLOR_BUFFER_BIT);



    var vertices = [
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, -0.5)
    ];
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
    var numVertices = 36;
    var points = [];
    var colors = [];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ], // black
        [ 1.0, 0.0, 0.0, 1.0 ], // red
        [ 1.0, 1.0, 0.0, 1.0 ], // yellow
        [ 0.0, 1.0, 0.0, 1.0 ], // green
        [ 0.0, 0.0, 1.0, 1.0 ], // blue
        [ 1.0, 0.0, 1.0, 1.0 ], // magenta
        [ 1.0, 1.0, 1.0, 1.0 ], // white
        [ 0.0, 1.0, 1.0, 1.0 ] // cyan
    ];
    
    function quad(a, b, c, d)
    {
        var indices = [ a, b, c, a, c, d ];
        for (var i = 0; i < indices.length; ++i) {
            points.push(vertices[indices[i]]);
            colors.push(vertexColors[indices[i]]);
        }
    }
    function colorCube(){
        quad(1, 0, 3, 2);
        quad(2, 3, 7, 6);
        quad(3, 0, 4, 7);
        quad(6, 5, 1, 2);
        quad(4, 5, 6, 7);
        quad(5, 4, 0, 1);
    }
    var indices = [
        1, 0, 3,
        3, 2, 1,
        2, 3, 7,
        7, 6, 2,
        3, 0, 4,
        4, 7, 3,
        6, 5, 1,
        1, 2, 6,
        4, 5, 6,
        6, 7, 4,
        5, 4, 0,
        0, 1, 5
    ];
    //import shaders
    var program = initShaders(gl, "Shaders/vshaderw3p1.glsl", "Shaders/fshaderw3p1.glsl");
    gl.useProgram(program);


    //ibuffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices),gl.STATIC_DRAW);



    //create vertex buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    //Enable vertex
    var vPos = gl.getAttribLocation(program, "v_Position");
    gl.vertexAttribPointer( vPos, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPos);

    //create colorbuffer
    var bufferc = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferc);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
    
    //Enable colors
    var vCol = gl.getAttribLocation( program, "v_Color" );
    gl.vertexAttribPointer( vCol, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vCol);  
    

    var w=0;
    function tick(){
        indices = mult(indices,rotate(w));
        w+=w+1;
        rotateX()
        render(gl,numVertices); 
        requestAnimationFrame(tick);
    }
    tick();


 

}

function render(gl,numOfVertices)
{
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.LINES, numOfVertices, gl.UNSIGNED_BYTE, 0);
}
