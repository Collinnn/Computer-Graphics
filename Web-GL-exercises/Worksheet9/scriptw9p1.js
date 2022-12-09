
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
    
    var index_unit = gl.getExtension('OES_element_index_uint');
    if (!index_unit) {
        console.log('Unable to use an extension for OES');
    }
    
    //import shaders
    var program_surface = initShaders(gl, "Shaders/vshadersurfacew9p1.glsl", "Shaders/fshadersurfacew9p1.glsl");
    program_surface.v_Position = gl.getAttribLocation(program_surface, 'v_Position');
    program_surface.v_TexCord = gl.getAttribLocation(program_surface, 'v_TexCord');

    var program_object = initShaders(gl,"Shaders/vshaderobjectw9p1.glsl", "Shaders/fshaderobjectw9p1.glsl");
    program_object.v_Position = gl.getAttribLocation(program_object,'v_Position');
    program_object.normal = gl.getAttribLocation(program_object,'normal');
    program_object.v_Color = gl.getAttribLocation(program_object,'v_Color');
    gl.useProgram(program_surface);
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LESS);
    
    
    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(colors[8][0],colors[8][1],colors[8][2],colors[8][3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    
    //W5p3/////////////
    var lightPosition;
    var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
    var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 ); 


    //Set to 0.0 for a directional source light
    lightPosition = vec4(0.0, 0.0, -1.0, 0.0 );
    

    var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
    var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
    var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    var materialShininess = 20.0;

    //Products
    var ambientProduct = mult(lightAmbient,materialAmbient);
    var diffuseProduct = mult(lightDiffuse,materialDiffuse);
    var specularProduct = mult(lightSpecular,materialSpecular);
    /////////////


    if(gl == null){
        alert("Not supported");
        return;
    }

    var vertices = [];
    var Plane = [
        vec4(-2, -1, -1, 1.0), 
        vec4(2, -1, -1, 1.0), 
        vec4(2, -1, -5, 1.0), 
        vec4(-2, -1, -5, 1.0)
    ];

    var Vertical= [
        vec4(-1, 0, -2.5, 1.0), 
        vec4(-1, -1, -2.5, 1.0), 
        vec4(-1, -1, -3, 1.0), 
        vec4(-1, 0, -3, 1.0)
    ];

    var Horizontal = [
        vec4(0.25, -0.5, -1.25, 1.0), 
        vec4(0.75, -0.5, -1.25, 1.0), 
        vec4(0.75, -0.5, -1.75, 1.0), 
        vec4(0.25, -0.5, -1.75, 1.0)
    ];
    
    //Create texture coord
    var texCord = [
        vec2(0.0,0.0),
        vec2(0.0,1.0),
        vec2(1.0,1.0),
        vec2(1.0,0.0)
    ];

    var vBuffer= gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    var vPos = gl.getAttribLocation(program_surface,"v_Position");
    gl.vertexAttribPointer(vPos,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPos);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);

    // Texture buffer
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(program_surface, 'v_TexCord'), 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(program_surface, 'v_TexCord'));
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCord), gl.STATIC_DRAW);

    var tMLoc = gl.getUniformLocation(program_surface, "texMap");

    var tex_plane = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex_plane);
    var image = new Image();
    image.onload = function() {
        gl.activeTexture(gl.TEXTURE0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    image.src = "../Models/xamp23.png";

    //Set texture parameters:

    gl.activeTexture(gl.TEXTURE1);
    var red_tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,red_tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,1,1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array([255,0,0]));

    function initObject(gl, obj_filename, scale)
    {
        program_object.v_Position = gl.getAttribLocation(program_object, 'v_Position');
        program_object.normal = gl.getAttribLocation(program_object, 'normal');
        program_object.v_Color = gl.getAttribLocation(program_object, 'v_Color');
        // Prepare empty buffer objects for vertex coordinates, colors, and normals
        var model = initVertexBuffers(gl);
        // Start reading the OBJ file
        readOBJFile(obj_filename, gl, model, scale, true);
        return model;
    }
        // Create a buffer object and perform the initial configuration
        function initVertexBuffers(gl) { 
            var o = new Object();
            o.vertexBuffer = createEmptyArrayBuffer(gl,program_object.v_Position,3,gl.FLOAT);
            o.normalBuffer = createEmptyArrayBuffer(gl,program_object.normal,3,gl.FLOAT);
            o.colorBuffer = createEmptyArrayBuffer(gl,program_object.v_Color,4,gl.FLOAT);
            o.indexBuffer = gl.createBuffer();
            return o;
        }
        
        function createEmptyArrayBuffer(gl, a_attribute, num, type) { 
            var buffer = gl.createBuffer(); // Create a buffer object
            gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
            gl.vertexAttribPointer(a_attribute,num,type,false,0,0);
            gl.enableVertexAttribArray(a_attribute);
            return buffer;
        }
        // Asynchronous file loading (request, parse, send to GPU buffers)
        function readOBJFile(fileName, gl, model, scale, reverse) { 
            var request = new XMLHttpRequest();

            request.onreadystatechange= function(){
                if(request.readyState===4 && request.status !==404){
                    onReadOBJFile(request.responseText,fileName,gl,model,scale,reverse);
                }
            }
            request.open('GET',fileName,true); //Create request
            request.send();
        }


        function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) { 
            var objDoc = new OBJDoc(fileName);
            var result = objDoc.parse(fileString,scale,reverse);
            if(!result){
                g_objDoc = null; 
                g_drawingInfo = null;
                console.log("OBJ file has a passing error");
                return;
            }
            g_objDoc=objDoc;

        }

        var model = initObject(gl,"../Models/teapot.obj",1);


    //Prespective matrix
    var P = perspective(90,canvas.width/canvas.height,0.1,100.0);
    var ploc = gl.getUniformLocation(program_surface,"projectionMatrix");
    gl.uniformMatrix4fv(ploc,false,flatten(P));


    //Camera postion
    var theta = 0;
    var radius = 0.4; // it is wrong when it spins. Spin spin wrong wrong.
    eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
    look = vec3(0,0,0);
    up = vec3(0,1,0);
    var V= lookAt(eye,look,up);

    var vloc= gl.getUniformLocation(program_surface, "viewMatrix");
    
    // Center of the light and the radius for the rotation
    lightRadius = 2;
    lightCenter = vec3(0, 2, -2);
    

    var shadowMLoc = gl.getUniformLocation(program_surface,"shadowMatrix");
    var shadowLoc = gl.getUniformLocation(program_surface,"shadow");

    



    //Model Matrix
    var mloc =gl.getUniformLocation(program_surface,"modelMatrix");

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


    function tick(){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        theta+=0.01;
        gl.uniformMatrix4fv(mloc,false,flatten(M));
        gl.uniformMatrix4fv(vloc, false, flatten(V));

        var lightPos = vec3(lightCenter[0]+lightRadius*Math.cos(theta),lightCenter[1],lightCenter[2]+ lightRadius*Math.sin(theta));
        var matrixLight = mat4();
        var diff= -(lightPos[1]+1);
        matrixLight[3][3] = -0.0001;//Moves it a tiny bit up so no clipping occurs
        matrixLight[3][1] = 1/diff;      
        matrixShadow = translate(lightPos[0], lightPos[1], lightPos[2]);  
        matrixShadow = mult(matrixShadow, matrixLight);
        matrixShadow = mult(matrixShadow, translate(-lightPos[0], -lightPos[1], -lightPos[2]) );
        matrixShadow = mult(matrixShadow,M); 
        gl.uniformMatrix4fv(shadowMLoc, false, flatten(matrixShadow));
        
        V= lookAt(eye,look,up);

        gl.uniform1i(shadowLoc, false);
        gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
        gl.uniform1i(tMLoc, 0);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Plane), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, Plane.length);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

       
        //Shadows
        gl.uniform1i(shadowLoc, true);
       
        gl.uniform1i(tMLoc,1);
        gl.depthFunc(gl.GREATER);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(Vertical),gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN,0,Vertical.length,gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(Horizontal),gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN,0,Horizontal.length,gl.STATIC_DRAW);
        
        //Objects
        gl.uniform1i(shadowLoc, false);
        gl.depthFunc(gl.LESS);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(Vertical),gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN,0,Vertical.length,gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(Horizontal),gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN,0,Horizontal.length,gl.STATIC_DRAW);
        
        //Object
        if (!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()) {
            // OBJ and all MTLs are available
            g_drawingInfo = onReadComplete(gl, model, g_objDoc);
            console.log("Model has been loaded");
            }
        if (!g_drawingInfo){
            return;
        }
    
        gl.drawElements(gl.TRIANGLES,g_drawingInfo.indices.length,gl.UNSIGNED_SHORT,0);
    
        requestAnimationFrame(tick);
    }
    tick();
}

function onReadComplete(gl, model, objDoc) { 
    var drawingInfo = objDoc.getDrawingInfo();
    
    //write into buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER,model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,drawingInfo.vertices,gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER,model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,drawingInfo.vertices,gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER,model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,drawingInfo.colors,gl.STATIC_DRAW);

    //writes the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,drawingInfo.indices,gl.STATIC_DRAW );

    return drawingInfo;
}
