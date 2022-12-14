var gl;


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
    var numberSubdiv=4;
    var normalsArray;
    var pointsArray;

    gl = WebGLUtils.setupWebGL(canvas);
    
    if(gl == null){
        alert("Not supported");
        return;
    }
    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(colors[8][0],colors[8][1],colors[8][2],colors[8][3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    

    //import shaders
    var program = initShaders(gl, "Shaders/vshaderw7p2.glsl", "Shaders/fshaderw7p2.glsl");
    gl.useProgram(program);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);


    //Tetrahedron
    var va = vec4(0.0, 0.0, 1.0, 1);
    var vb = vec4(0.0, 0.942809, -0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
    var vd = vec4(0.816497, -0.471405, -0.333333, 1);

    var background = [vec4(1, 1, 0.999, 1),
                     vec4(-1, 1, 0.999, 1),
                    vec4(-1, -1, 0.999, 1),
                    vec4(1, -1, 0.999, 1)];



 

    function triangle(a,b,c){
        normalsArray.push(vec4(a[0],a[1],a[2],0));
        normalsArray.push(vec4(b[0],b[1],b[2],0));
        normalsArray.push(vec4(c[0],c[1],c[2],0));
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);

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
    function initTetrahedron(numberSubdiv){
        tretrahedron(va,vb,vc,vd,numberSubdiv);
    }
    
    var g_tex_ready = 0;
    function initTexture() {
        var cubemap = ['../Models/brightday2_cubemap/brightday2_posx.png',   // POSITIVE_X
                       '../Models/brightday2_cubemap/brightday2_negx.png',  // NEGATIVE_X
                       '../Models/brightday2_cubemap/brightday2_posy.png',    // POSITIVE_Y
                       '../Models/brightday2_cubemap/brightday2_negy.png', // NEGATIVE_Y
                       '../Models/brightday2_cubemap/brightday2_posz.png',   // POSITIVE_Z
                       '../Models/brightday2_cubemap/brightday2_negz.png']; // NEGATIVE_Z

        gl.activeTexture(gl.TEXTURE0);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        for(var i = 0; i < 6; ++i) {
            var image = document.createElement('img');
            image.crossorigin = 'anonymous';
            image.textarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
            image.onload = function(event) {
                var image = event.target;
                gl.activeTexture(gl.TEXTURE0);
                //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(image.textarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
                ++g_tex_ready;
            };
            image.src = cubemap[i];
        }
        gl.uniform1i(gl.getUniformLocation(program, "texCubeMap"), 0);
    }
    initTexture();

    
    //create vertex buffer
    

    var vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);

    //Enable vertex
    var vPos = gl.getAttribLocation(program, "v_Position");
    gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPos);
    

    // Background buffer
    var bgBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bgBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(background), gl.STATIC_DRAW);
    

    //Create normal buffer
    // Normal buffer
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    var normLoc = gl.getAttribLocation(program, "normal");
    gl.vertexAttribPointer(normLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normLoc);
    


    //Prespective matrix
    var P = perspective(90,canvas.width/canvas.height,0.1,1000);
    var ploc = gl.getUniformLocation(program,"projectionMatrix");
    //gl.uniformMatrix4fv(ploc,false,flatten(P));
    


    //Camera postion
    var theta = 0;
    var radius = 3;
    var Rx = rotateX(theta);
    var Ry = rotateY(theta);
    var Rz = rotateZ(theta);
    // Rotation matrix
    var R = mat4();
    R = mult(R, Rx);
    R = mult(R, Ry);
    R = mult(R, Rz);

    // Translation matrix
    var T = translate(0, 0, radius);
    // Model matrix
    var M = mat4();
    //M = mult(M, T);
    //M = mult(M, R);

    //Model Matrix
    var mloc =gl.getUniformLocation(program,"modelMatrix");
 
    var eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
    var look = vec3(0,0,0);
    var up = vec3(0,1,0);
    var V= lookAt(eye,look,up);

    var vloc= gl.getUniformLocation(program, "viewMatrix");
    var tMLoc = gl.getUniformLocation(program, "texMatrix");

    var increaseButton = document.getElementById("IncreaseDepth");
    var decreaseButton = document.getElementById("DecreaseDepth");

    increaseButton.addEventListener("click",function(ev){
        numberSubdiv ++;

    });

    decreaseButton.addEventListener("click",function(ev){
        if(numberSubdiv != 0){
            numberSubdiv --;
        }


    });

    function tick(){
        pointsArray = new Array();
        normalsArray = new Array();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        initTetrahedron(numberSubdiv);
        theta+=0.01;
        eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
        V = lookAt(eye, look, up);
        gl.uniformMatrix4fv(vloc, false, flatten(V));
        gl.uniformMatrix4fv(mloc, false, flatten(M));
        gl.uniformMatrix4fv(ploc, false, flatten(P));
        // mat4tex loc
        gl.uniformMatrix4fv(tMLoc, false, flatten(mat4()));
        
        // Filters
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        // Sphere vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);

        // Calculate M_tex for the background
        gl.uniformMatrix4fv(vloc, false, flatten(mat4()));
        gl.uniformMatrix4fv(mloc, false, flatten(mat4()));
        gl.uniformMatrix4fv(ploc, false, flatten(mat4()));
        Mat4tex = mat4();
        Vinv = inverse(V);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                Mat4tex[i][j] = Vinv[i][j];
            }        
        }
        Mat4tex = mult(Mat4tex, inverse(P));
        gl.uniformMatrix4fv(tMLoc, false, flatten(Mat4tex));

        // Background vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(background), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, background.length);

        requestAnimationFrame(tick);
    }
    tick();
}


