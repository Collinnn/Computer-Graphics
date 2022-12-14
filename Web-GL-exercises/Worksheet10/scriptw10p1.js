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
    var program = initShaders(gl, "Shaders/vshaderw10p1.glsl", "Shaders/fshaderw10p1.glsl");
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
 
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);
        normalsArray.push(vec4(a[0],a[1],a[2],0.0));
        normalsArray.push(vec4(b[0],b[1],b[2],0.0));
        normalsArray.push(vec4(c[0],c[1],c[2],0.0));

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
            //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //Flips image, not needed with other maps.
            gl.texImage2D(image.textarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            ++g_tex_ready;
        };
        image.src = cubemap[i];
    }
    gl.uniform1i(gl.getUniformLocation(program, "texCubeMap"), 0);

    //Stops sometimes crashes of the program at startup.
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.activeTexture(gl.TEXTURE1);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var image = new Image();
    image.onload = function() {
        gl.activeTexture(gl.TEXTURE1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    image.src = "../Models/normalmap.png";
    gl.uniform1i(gl.getUniformLocation(program, "nMap"), 1);

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
    
    var eLoc = gl.getUniformLocation(program, "eyepos");

    //Camera postion
    var theta = 0;
    var radius = 1.5;


    // Model matrix 
    var M = mat4();

    //Model Matrix
    var mloc =gl.getUniformLocation(program,"modelMatrix");
 
    var eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
    
    var look = vec3(0,0,0);
    var up = vec3(0,1,0);
    var V= lookAt(eye,look,up);

    var vloc= gl.getUniformLocation(program, "viewMatrix");
    var tMLoc = gl.getUniformLocation(program, "texMatrix");
    var rLoc = gl.getUniformLocation(program, "isReflective");

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

    var mousepressed = false; 
    var x0 = -1, y0 = -1 ;
    var rotationX = 0, rotationY = 0;
    canvas.onmousedown = function(ev){
        x=ev.clientX;
        y=ev.clientY;
        var rectangle = ev.target.getBoundingClientRect();
        //stops if mouse is outside of canvas
        if(rectangle.left <=x && x<rectangle.right && rectangle.top <= y && y<rectangle.bottom){
            x0=x;
            y0=y;
            mousepressed = true;
        }
    }
    canvas.onmouseup = function(ev){
        mousepressed=false;
    }

    canvas.onmousemove = function(ev){
        x=ev.clientX;
        y=ev.clientY;
        if(mousepressed){
            rotationX += 0.2 * (x-x0);
            rotationY += 0.2 * (y-y0);
        }
        x0 = x;
        y0 = y;
    }

    
    function tick(){
        pointsArray = new Array();
        normalsArray = new Array();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        initTetrahedron(numberSubdiv);
        
        gl.uniform4f(eLoc, eye[0], eye[1], eye[2], 1.0);
        eye = vec4(0.0,0.0,radius,1.0);
        var translated = mult(mult(rotateY(-rotationX),rotateX(-rotationY)),eye);
        
        V = lookAt(vec3(translated[0],translated[1],translated[2]), look, up);
        
        gl.uniformMatrix4fv(vloc, false, flatten(V));
        gl.uniformMatrix4fv(ploc, false, flatten(P));
        gl.uniformMatrix4fv(mloc, false, flatten(M));
        
     
     
        
        // Filters comes with error that it's not used. But removal breaks, so they are used. 
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        gl.uniformMatrix4fv(tMLoc, false, flatten(mat4()));
        
        // Points on the sphere
        gl.uniform1i(rLoc, true);
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

        // Background points
        gl.uniform1i(rLoc, false);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(background), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, background.length);
        requestAnimationFrame(tick);
    }
    tick();
}


