
var gl;
var index = 0;
var pointsArray =[];
var vertexColors=[];
window.onload = function init(){
    const canvas = document.querySelector("#gl-canvas");
    var numberSubdiv=0;


    gl = WebGLUtils.setupWebGL(canvas);
    
    if(gl == null){
        alert("Not supported");
        return;
    }

    gl.vBuffer = null;
    gl.bufferc = null;

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


    function triangle(a,b,c){
        pointsArray.push(a);
        vertexColors.push(vec4(0.5*a[0]+0.5,0.5*a[1]+0.5,0.5*a[2]+0.5,1.0));
        pointsArray.push(b);
        vertexColors.push(vec4(0.5*b[0]+0.5,0.5*b[1]+0.5,0.5*b[2]+0.5,1.0));
        pointsArray.push(c);
        vertexColors.push(vec4(0.5*c[0]+0.5,0.5*c[1]+0.5,0.5*c[2]+0.5,1.0));
        index +=3; 
    }
    function divideTriangle(a,b,c,count){
        if(count >0){
            var ab = normalize(mix(a, b, 0.5),true);
            var ac = normalize(mix(a, c , 0.5),true);
            var bc = normalize(mix(b, c, 0.5), true);
            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        }else {
            triangle(a, b, c);
        }
    }
    function tretrahedron(a,b,c,d,n){
        divideTriangle(a,b,c,n);
        divideTriangle(d,c,b,n);
        divideTriangle(a,d,b,n);
        divideTriangle(a,c,d,n);

    }
    
    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(colors[8][0],colors[8][1],colors[8][2],colors[8][3]);
    gl.clear(gl.COLOR_BUFFER_BIT);





/*
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
*/

    
    //import shaders
    gl.program = initShaders(gl, "Shaders/vshaderw4p1.glsl", "Shaders/fshaderw4p1.glsl");
    gl.useProgram(gl.program);

    function initsphere(gl,numberSubdiv){
        //Tetrahedron
        var va = vec4(0.0, 0.0, 1.0, 1);
        var vb = vec4(0.0, 0.942809, -0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
        var vd = vec4(0.816497, -0.471405, -0.333333, 1)
        tretrahedron(va,vb,vc,vd,numberSubdiv);
        //create vertex buffer
        gl.deleteBuffer(gl.vBuffer);

        gl.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        
        //Enable vertex
        var vPos = gl.getAttribLocation(gl.program, "v_Position");
        gl.vertexAttribPointer( vPos, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray(vPos);
        
        //create colorbuffer
        gl.deleteBuffer(gl.bufferc);
        gl.bufferc = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.bufferc);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
        
        //Enable colors
        var vCol = gl.getAttribLocation( gl.program, "v_Color" );
        gl.vertexAttribPointer( vCol, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray(vCol);  
        
    }




    
    //Prespective matrix
    var P = perspective(45,canvas.width/canvas.height,0.1,20);
    var ploc = gl.getUniformLocation(gl.program,"projectionMatrix");
    gl.uniformMatrix4fv(ploc,false,flatten(P));


    //Camera postion
    var V = mat4();
    var vloc= gl.getUniformLocation(gl.program, "viewMatrix");
    gl.uniformMatrix4fv(vloc, false, flatten(V));
    

    //Model Matrix

    var mloc =gl.getUniformLocation(gl.program,"modelMatrix");
    

    

    gl.clear(gl.COLOR_BUFFER_BIT);
    M =translate(0.0,0.0,-8.0);
    gl.uniformMatrix4fv(mloc,false,flatten(M));




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
   

    function tick(){
        initsphere(gl,numberSubdiv);
        render(gl); 
        requestAnimationFrame(tick);
    }
    tick();
}

function render(gl)
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,index);
}
