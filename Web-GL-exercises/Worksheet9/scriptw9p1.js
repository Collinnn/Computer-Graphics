


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
    let move=true;
    var canvas = document.querySelector("#gl-canvas");
    
    var gl = WebGLUtils.setupWebGL(canvas);
    if(gl == null){
        alert("Not supported");
        return;
    }
    //Canvas setup
   
    gl.clearColor(colors[8][0],colors[8][1],colors[8][2],colors[8][3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
      

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
    //lightPosition = vec4(0.0, 0.0, -1.0, 0.0 );
    

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
    readOBJFile("../Models/teapot.obj",gl,model,0.25,true);
    model.vertexBuffer.num = 3;
    model.normalBuffer.num = 3;
    model.colorBuffer.num = 4;
    model.vertexBuffer.type = gl.FLOAT;
    model.normalBuffer.type = gl.FLOAT;
    model.colorBuffer.type = gl.FLOAT;



    var Plane = [
        vec4(-2, -1, -1, 1.0), 
        vec4(2, -1, -1, 1.0), 
        vec4(2, -1, -5, 1.0), 
        vec4(-2, -1, -5, 1.0)
    ];
    gl.useProgram(program_surface);

    //Vertex Buffer
    var vBuffer_surface = gl.createBuffer();
    vBuffer_surface.num = 4;
    vBuffer_surface.type = gl.FLOAT;
    initAttributeVariable(gl, program_surface.v_Position, vBuffer_surface);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Plane), gl.STATIC_DRAW);
    
    //Create texture coord
    var texCord = [
        vec2(0.0,0.0),
        vec2(1.0,0.0),
        vec2(1.0,1.0),
        vec2(0.0,1.0)
    ];



    // Texture buffer
    var tBuffer = gl.createBuffer();
    tBuffer.num = 2;
    tBuffer.type = gl.FLOAT;
    initAttributeVariable(gl,program_surface.v_TexCord, tBuffer); //////////////////
    gl.bufferData(gl.ARRAY_BUFFER,flatten(texCord),gl.STATIC_DRAW);
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
    initAttributeVariable(gl,program_surface.v_Position,vBuffer_surface);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(Plane),gl.STATIC_DRAW); 

    //Prespective matrix
    var P = perspective(90,canvas.width/canvas.height,0.1,1000);
    var ploc = gl.getUniformLocation(program_surface,"projectionMatrix");
    gl.uniformMatrix4fv(ploc,false,flatten(P));

    //Model Matrix
    var mloc_surface = gl.getUniformLocation(program_surface,"modelMatrix")
    var M =mat4();
    gl.uniformMatrix4fv(mloc_surface,false,flatten(M));


    //Camera postion
    var theta = 0;
    var radius = 0.4;
    eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
    look = vec3(0,0,0);
    up = vec3(0,1,0);
    var V= lookAt(eye,look,up);


    var vloc_surface= gl.getUniformLocation(program_surface, "viewMatrix");
    gl.uniformMatrix4fv(vloc_surface, false, flatten(V));
    var translated = translate(0,-1,-3); 
    var m_object = mult(mat4(),translated);
;


  

    var shadowMLoc = gl.getUniformLocation(program_object,"shadowMatrix");
    var shadowLoc = gl.getUniformLocation(program_object,"shadow");

    gl.useProgram(program_object);
    var mloc_object = gl.getUniformLocation(program_object, "modelMatrix");
    gl.uniformMatrix4fv(mloc_object, false, flatten(m_object));
    var pLoc_object = gl.getUniformLocation(program_object, "projectionMatrix");
    gl.uniformMatrix4fv(pLoc_object, false, flatten(P));
    var vLoc_object = gl.getUniformLocation(program_object, "viewMatrix");
    gl.uniformMatrix4fv(vLoc_object, false, flatten(V));


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
        console.log("he");
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
    var bounceButton = document.getElementById("moveButton");
    bounceButton.addEventListener("click", function (event) {
        console.log("move");
        move = !move;
    });

    var theta2=0;
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
        
        initAttributeVariable(gl,program_surface.v_Position, vBuffer_surface);
        initAttributeVariable(gl,program_surface.v_TexCord, tBuffer);
        
        // Draw ground plane
        gl.uniform1i(tMLoc, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer_surface);
        
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Plane), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, Plane.length);
        
        
        gl.useProgram(program_object);
        
        
        
        var matrixLight = mat4();
        lightPos = vec3(lightCenter[0]+lightRadius*Math.sin(theta),lightCenter[1],lightCenter[2]+ lightRadius*Math.cos(theta));
        theta += 0.01;    
        // Projection matrix to ground plane
        var diff= -(lightPos[1]+1);
        matrixLight[3][3] = -0.0001;//Moves it a tiny bit up so no clipping occurs
        matrixLight[3][1] = 1/diff;
        matrixShadow = translate(lightPos[0], lightPos[1], lightPos[2]);  
        matrixShadow = mult(matrixShadow, matrixLight);
        matrixShadow = mult(matrixShadow, translate(-lightPos[0], -lightPos[1], -lightPos[2]) );
        matrixShadow = mult(matrixShadow,M); 
        gl.uniformMatrix4fv(shadowMLoc, false, flatten(matrixShadow));
        
      
        
        
        if(move){
            theta2 +=0.01;
            var T = translate(0, Math.sin(theta2), -3); 
            m_object = mult(mat4(),T);
        }


        gl.uniformMatrix4fv(mloc_object, false, flatten(m_object));
        initAttributeVariable(gl,program_object.v_Position, model.vertexBuffer);
        initAttributeVariable(gl,program_object.normal, model.normalBuffer);
        initAttributeVariable(gl,program_object.v_Color, model.colorBuffer);
        gl.uniform4fv(gl.getUniformLocation(program_object, "lightPosition"), flatten(vec4(lightPos[0],lightPos[1],lightPos[2],1.0)));
    
        
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



}

function initAttributeVariable(gl, attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(attribute);
}

// Create a buffer object and perform the initial configuration
function initVertexBuffers(gl, program) {
    var model = new Object();
    model.vertexBuffer = createEmptyArrayBuffer(gl, program.v_Position, 3, gl.FLOAT);
    model.normalBuffer = createEmptyArrayBuffer(gl, program.normal, 3, gl.FLOAT);
    model.colorBuffer = createEmptyArrayBuffer(gl, program.v_Color, 4, gl.FLOAT);
    model.indexBuffer = gl.createBuffer();
    return model;
}

function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer = gl.createBuffer(); // Create a buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute); // Enable the assignment

    return buffer;
}

// Read a file
function readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
        }
    }
    request.open('GET', fileName, true);
    request.send(); 
}


// OBJ file has been read, has been re-written t stop bugs
function onReadOBJFile(fileString, fileName, gl, model, scale, reverse) {
    var objDoc = new OBJDoc(fileName); 
    var result = objDoc.parse(fileString, scale, reverse);
    if (!result) {
        g_objDoc = null; g_drawingInfo = null;
        console.log("OBJ file parsing error.");
        return;
    }
    g_objDoc = objDoc;
}

function onReadComplete(gl, model, objDoc) {
    // Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
    return drawingInfo;
}

