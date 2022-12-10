


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

    var canvas = document.querySelector("#gl-canvas");
    
    var gl = WebGLUtils.setupWebGL(canvas);
    if(gl == null){
        alert("Not supported");
        return;
    }
    //Canvas setup
   
    gl.clearColor(colors[8][0],colors[8][1],colors[8][2],colors[8][3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);    



    var program_surface = initShaders(gl, "Shaders/vshadersurfacew9p1.vert", "Shaders/fshadersurfacew9p1.frag");
    var program_object = initShaders(gl,"Shaders/vshaderobjectw9p1.vert", "Shaders/fshaderobjectw9p1.frag");
    //import shaders
    gl.useProgram(program_surface);
    program_surface.v_Position = gl.getAttribLocation(program_surface, 'v_Position');
    program_surface.v_TexCord = gl.getAttribLocation(program_surface, 'v_TexCord');
    
    gl.useProgram(program_object);
    program_object.v_Position = gl.getAttribLocation(program_object,'v_Position');
    program_object.normal = gl.getAttribLocation(program_object,'normal');
    program_object.v_Color = gl.getAttribLocation(program_object,'v_Color');
    
    
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LESS);
    
    var index_unit = gl.getExtension('OES_element_index_uint');
    if (!index_unit) {
        console.log('Unable to use an extension for OES');
    }
    
    

    
    //W5p3/////////////
    //var lightPosition;
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
    var model = initVertexBuffers(gl,program_object);
    model =initObject("../Models/teapot.obj",0.25,program_object);
    model.vertexBuffer.num = 3;
    model.normalBuffer.num = 3;
    model.colorBuffer.num = 4;
    model.vertexBuffer.type = gl.FLOAT;
    model.normalBuffer.type = gl.FLOAT;
    model.colorBuffer.type = gl.FLOAT;


    var vertices = [];
    var Plane = [
        vec4(-2, -1, -1, 1.0), 
        vec4(2, -1, -1, 1.0), 
        vec4(2, -1, -5, 1.0), 
        vec4(-2, -1, -5, 1.0)
    ];

    
    //Create texture coord
    var texCord = [
        vec2(0.0,0.0),
        vec2(0.0,1.0),
        vec2(1.0,1.0),
        vec2(1.0,0.0)
    ];
    gl.useProgram(program_surface);

    //Vertex Buffer
    var vBuffer_surface= gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer_surface);
    gl.vertexAttribPointer(vBuffer_surface.v_Position,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vBuffer_surface.v_Position);
    
    ///var vPos = gl.getAttribLocation(program_surface,"v_Position");

    gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);

    // Texture buffer
    var tBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER,tBuffer);
    gl.vertexAttribPointer(tBuffer.v_TexCord,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(tBuffer.v_TexCord);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCord), gl.STATIC_DRAW);
    /////////////////////////////////
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

    // Magnification and minification filtering //////////!!!////////
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    //Set texture parameters:

    gl.activeTexture(gl.TEXTURE1);
    var shadow_tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,shadow_tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,1,1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array([255,0,0]));

    // Center of the light and the radius for the rotation
    lightRadius = 2;
    lightCenter = vec3(0, 2, -2);




    gl.useProgram(program_surface);
    var vBuffer_surface = gl.createBuffer();
    vBuffer_surface.num = 4;
    vBuffer_surface.type = gl.FLOAT;
    initAttributeVariable(program_surface.v_Position,vBuffer_surface);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(Plane),gl.STATIC_DRAW); 

    //Prespective matrix
    var P = perspective(90,canvas.width/canvas.height,0.1,1000);
    var ploc = gl.getUniformLocation(program_surface,"projectionMatrix");
    gl.uniformMatrix4fv(ploc,false,flatten(P));

    //Model Matrix
    var mloc_surface = gl.getUniformLocation(program_surface,"modelMatrix");

    //Moves the camera back to get a proper view.
    var M =mat4();
    gl.uniformMatrix4fv(mloc_surface,false,flatten(M));
    //Camera postion
    var theta = 0;
    var radius = 0.4; // it is wrong when it spins. Spin spin wrong wrong.
    eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
    look = vec3(0,0,0);
    up = vec3(0,1,0);
    var V= lookAt(eye,look,up);

    var vloc= gl.getUniformLocation(program_surface, "viewMatrix");
    var vloc_object= gl.getUniformLocation(program_object, "viewMatrix");
    
    
    var translated = translate(0,-1,-3); 
    var m_object = mult(mat4(),translated);

    var shadowMLoc = gl.getUniformLocation(program_object,"shadowMatrix");
    var shadowLoc = gl.getUniformLocation(program_object,"shadow");

    gl.useProgram(program_object);
    var mloc_object = gl.getUniformLocation(program_object,"modelMatrix");
    gl.uniformMatrix4fv(mloc_object,false,flatten(m_object));
    var ploc_object = gl.getUniformLocation(program_object,"projectionMatrix");
    gl.uniformMatrix4fv(ploc_object,false,flatten(P));
    var vloc_object = gl.getUniformLocation(program_object,"viewMatrix");
    gl.uniformMatrix4fv(vloc_object,false,flatten(V));



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
    gl.uniform4fv( gl.getUniformLocation(program_object, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program_object, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program_object, "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program_object, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program_object, "shininess"), materialShininess );

    var ambientSlider = document.getElementById("AmbientSlider");
    var diffuseSlider = document.getElementById("DiffuseSlider");
    var SpecularSlider = document.getElementById("SpecularSlider");
    var ShinySlider = document.getElementById("ShinySlider");
    var LightEmission = document.getElementById("LightEmission");
    ambientSlider.addEventListener("input",function(ev){
        var a = ambientSlider.value;
        materialAmbient = vec4(a,a,a,1.0); 
        ambientProduct = mult(lightAmbient,materialAmbient);
        gl.uniform4fv( gl.getUniformLocation(program_object, "ambientProduct"), flatten(ambientProduct) );
    });
    diffuseSlider.addEventListener("input",function(ev){
        var a = diffuseSlider.value;
        //Set green to zero
        materialDiffuse = vec4(a,a,a,1.0); 
        diffuseProduct = mult(lightDiffuse,materialDiffuse);
        gl.uniform4fv( gl.getUniformLocation(program_object, "diffuseProduct"), flatten(diffuseProduct) );
    });
    SpecularSlider.addEventListener("input",function(ev){
        var a = SpecularSlider.value;
        materialSpecular = vec4(a,a,a,1.0); 
        specularProduct = mult(lightSpecular,materialSpecular);
        gl.uniform4fv( gl.getUniformLocation(program_object, "specularProduct"), flatten(specularProduct) );
    });

    ShinySlider.addEventListener("input",function(ev){
        var a = ShinySlider.value;
        materialShininess = a;
        gl.uniform1f( gl.getUniformLocation(program_object, "shininess"), materialShininess);
    });
    LightEmission.addEventListener("input",function(ev){
        var a = LightEmission.value;
        
        lightAmbient = vec4(a,a,a,1.0);
        lightDiffuse = vec4(a,a,a,1.0);
        lightSpecular = vec4(a,a,a,1.0); 
        ambientProduct = mult(lightAmbient,materialAmbient);
        diffuseProduct = mult(lightDiffuse,materialDiffuse);
        specularProduct = mult(lightSpecular,materialSpecular);

        gl.uniform4fv( gl.getUniformLocation(program_object, "ambientProduct"), flatten(ambientProduct) );
        gl.uniform4fv( gl.getUniformLocation(program_object, "diffuseProduct"), flatten(diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(program_object, "specularProduct"), flatten(specularProduct) );
    });   

   
    function tick() {
        requestAnimationFrame(tick);
        if (!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()) {
            // OBJ and all MTLs are available
            g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        }
        if (!g_drawingInfo) {
            return;
        }
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program_surface);
        
        initAttributeVariable(program_surface.v_Position, vBuffer_surface);
        initAttributeVariable(program_surface.v_TexCord, tBuffer);
        
        // Draw ground plane
        gl.uniform1i(tMLoc, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer_surface);
        gl.uniform1i(tMLoc, 0);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Plane), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, Plane.length);
        
        gl.useProgram(program_object);
        
        if (true) {
            theta += 0.01;
            var matrixLight = mat4();
            lightPos = vec3(lightCenter[0] + lightRadius*Math.cos(theta), lightCenter[1], lightCenter[2] + lightRadius*Math.sin(theta));
            // Projection matrix to ground plane
            var diff= -(lightPos[1]+1);
            matrixLight[3][3] = -0.0001;//Moves it a tiny bit up so no clipping occurs
            matrixLight[3][1] = 1/diff;
            matrixShadow = translate(lightPos[0], lightPos[1], lightPos[2]);  
            matrixShadow = mult(matrixShadow, matrixLight);
            matrixShadow = mult(matrixShadow, translate(-lightPos[0], -lightPos[1], -lightPos[2]) );
            matrixShadow = mult(matrixShadow,M); 
            gl.uniformMatrix4fv(shadowMLoc, false, flatten(matrixShadow));
        }
        M_object = mat4();
       
        gl.uniformMatrix4fv(mloc_object, false, flatten(m_object));
        
        initAttributeVariable(program_object.v_Position, model.vertexBuffer);
        initAttributeVariable(program_object.normal, model.normalBuffer);
        initAttributeVariable(program_object.v_Color, model.colorBuffer);

    
        
        // Draw shadows
        gl.uniform1i(shadowLoc, true);
        gl.depthFunc(gl.GREATER);
        gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
        
        //objects
        gl.uniform1i(shadowLoc, false);
        gl.depthFunc(gl.LESS);
        gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
    }
    tick();
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
    function initAttributeVariable(a_attribute, buffer,num,buffertype) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, num, buffertype, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }
    function initObject(obj_filename, scale,program)
    {
        program.v_Position = gl.getAttribLocation(program, 'v_Position');
        program.normal = gl.getAttribLocation(program, 'normal');
        program.v_Color = gl.getAttribLocation(program, 'v_Color');
        // Prepare empty buffer objects for vertex coordinates, colors, and normals
        var model = initVertexBuffers(program);
        // Start reading the OBJ file
        readOBJFile(obj_filename, gl, model, scale, true);
        return model;
    }
    // Create a buffer object and perform the initial configuration
    function initVertexBuffers(program) { 
        var o = new Object();
        o.vertexBuffer = createEmptyArrayBuffer(program.v_Position,3,gl.FLOAT);
        o.normalBuffer = createEmptyArrayBuffer(program.normal,3,gl.FLOAT);
        o.colorBuffer = createEmptyArrayBuffer(program.v_Color,4,gl.FLOAT);
        o.indexBuffer = gl.createBuffer();
        return o;
    }
    
    function createEmptyArrayBuffer(a_attribute, num, type) { 
        var buffer = gl.createBuffer(); // Create a buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.vertexAttribPointer(a_attribute,num,type,false,0,0);
        gl.enableVertexAttribArray(a_attribute);
        return buffer;
    }
    // Asynchronous file loading (request, parse, send to GPU buffers)
    function readOBJFile(fileName, model, scale, reverse) { 
        var request = new XMLHttpRequest();
        request.onreadystatechange= function(){
            if(request.readyState===4 && request.status !==404){
                onReadOBJFile(request.responseText,fileName,gl,model,scale,reverse);
            }
        }
        request.open('GET',fileName,true); //Create request
        request.send();
    }
    
    
    function onReadOBJFile(fileString, fileName, o, scale, reverse) { 
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


}

