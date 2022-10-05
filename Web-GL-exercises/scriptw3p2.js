
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



    var numVertices = 36;

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
    

    var indices = [
        1, 0, 3,
        3, 2, 1,
        2, 3, 6,
        7, 6, 2,
        3, 0, 4,
        4, 7, 3,
        6, 5, 1,
        1, 2, 6,
        4, 5, 6,
        6, 7, 4,
        0, 4, 0,
        0, 1, 5
    ];
    //import shaders
    var program = initShaders(gl, "Shaders/vshaderw3p2.glsl", "Shaders/fshaderw3p2.glsl");
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
    
    var eye = vec3(0.0,0.0,0.0);
    var up = vec3(0.0,1.0,0.0);
    var at = vec3(1.0,0.0,0.0);

    //Prespective matrix
    var P = perspective(45,canvas.width/canvas.height,0.1,20);
    var ploc = gl.getUniformLocation(program,"projectionMatrix");
    gl.uniformMatrix4fv(ploc,false,flatten(P));
    //Not used
    V= lookAt(eye, at, up);
    //Camera postion
    var V = mat4();
    var vloc= gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(vloc, false, flatten(V));
    

    //Model Matrix

    var mloc =gl.getUniformLocation(program,"modelMatrix");
    
    //Spacing for the different squares
    
    
    var squares = [-2,0,2];
    var rot = [20,0,40];
    gl.clear(gl.COLOR_BUFFER_BIT);
        
    for(var i = 0; i<3; i++){
        var M = null;
        M =translate(squares[i],0.0,-7.5);
        M = mult(M,rotateY(rot[i]));
        if(i==2)M = mult(M,rotateX(-20));

        gl.uniformMatrix4fv(mloc,false,flatten(M));
        gl.drawElements(gl.LINES, numVertices, gl.UNSIGNED_BYTE, 0);
    }
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
   
/*
    function tick(){
        render(gl,numVertices); 
        requestAnimationFrame(tick);
    }
    tick();
*/

 

}

function render(gl,numOfVertices)
{
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.LINES, numOfVertices, gl.UNSIGNED_BYTE, 0);
}
