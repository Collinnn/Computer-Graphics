
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
    gl.program = initShaders(gl, "Shaders/vshaderw5p3.glsl", "Shaders/fshaderw5p3.glsl");
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
    


        var model = initObject(gl,"../Models/Suzanne.obj",1);



    //Canvas setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(colors[8][0],colors[8][1],colors[8][2],colors[8][3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    

    
    
    //Location lock for lighting
    gl.uniform4fv( gl.getUniformLocation(gl.program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(gl.program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(gl.program, "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(gl.program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(gl.program, "shininess"), materialShininess );

    
    var ambientSlider = document.getElementById("AmbientSlider");
    var diffuseSlider = document.getElementById("DiffuseSlider");
    var SpecularSlider = document.getElementById("SpecularSlider");
    var ShinySlider = document.getElementById("ShinySlider");
    var LightEmission = document.getElementById("LightEmission");


    //Prespective matrix
    var P = perspective(45,canvas.width/canvas.height,0.1,20.0);
    var ploc = gl.getUniformLocation(gl.program,"projectionMatrix");
    gl.uniformMatrix4fv(ploc,false,flatten(P));


    //Camera postion
    var theta = 0;
    var radius = 8;
    eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
    look = vec3(0,0,0);
    up = vec3(0,1,0);
    var V= lookAt(eye,look,up);

    var vloc= gl.getUniformLocation(gl.program, "viewMatrix");
    
    

    //Model Matrix
    var mloc =gl.getUniformLocation(gl.program,"modelMatrix");

    //Moves the camera back to get a proper view.
    M =mat4();
       
    ambientSlider.addEventListener("input",function(ev){
        var a = ambientSlider.value;
        materialAmbient = vec4(a,a,a,1.0); 
        ambientProduct = mult(lightAmbient,materialAmbient);
        gl.uniform4fv( gl.getUniformLocation(gl.program, "ambientProduct"), flatten(ambientProduct) );
    });
    diffuseSlider.addEventListener("input",function(ev){
        var a = diffuseSlider.value;
        //Set green to zero
        materialDiffuse = vec4(a,a,a,1.0); 
        diffuseProduct = mult(lightDiffuse,materialDiffuse);
        gl.uniform4fv( gl.getUniformLocation(gl.program, "diffuseProduct"), flatten(diffuseProduct) );
    });
    SpecularSlider.addEventListener("input",function(ev){
        var a = SpecularSlider.value;
        materialSpecular = vec4(a,a,a,1.0); 
        specularProduct = mult(lightSpecular,materialSpecular);
        gl.uniform4fv( gl.getUniformLocation(gl.program, "specularProduct"), flatten(specularProduct) );
    });

    ShinySlider.addEventListener("input",function(ev){
        var a = ShinySlider.value;
        materialShininess = a;
        gl.uniform1f( gl.getUniformLocation(gl.program, "shininess"), materialShininess);
    });
    LightEmission.addEventListener("input",function(ev){
        var a = LightEmission.value;
        
        lightAmbient = vec4(a,a,a,1.0);
        lightDiffuse = vec4(a,a,a,1.0);
        lightSpecular = vec4(a,a,a,1.0); 
        ambientProduct = mult(lightAmbient,materialAmbient);
        diffuseProduct = mult(lightDiffuse,materialDiffuse);
        specularProduct = mult(lightSpecular,materialSpecular);

        gl.uniform4fv( gl.getUniformLocation(gl.program, "ambientProduct"), flatten(ambientProduct) );
        gl.uniform4fv( gl.getUniformLocation(gl.program, "diffuseProduct"), flatten(diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(gl.program, "specularProduct"), flatten(specularProduct) );
    });    




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
        theta+=0.01;
        gl.uniformMatrix4fv(mloc,false,flatten(M));
        gl.uniformMatrix4fv(vloc, false, flatten(V));
        eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
        gl.uniform3fv( gl.getUniformLocation(gl.program, "eyepos"), flatten(eye));
        V= lookAt(eye,look,up);
        render(gl,model); 
        requestAnimationFrame(tick);
    }
    tick();
}

function render(gl,model)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()) {
        // OBJ and all MTLs are available
        g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        console.log("Model has been loaded");
        }
    if (!g_drawingInfo){
        return;
    }

    gl.drawElements(gl.TRIANGLES,g_drawingInfo.indices.length,gl.UNSIGNED_SHORT,0);

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
function initObject(gl, obj_filename, scale)
{
    gl.program.v_Position = gl.getAttribLocation(gl.program, 'v_Position');
    gl.program.normal = gl.getAttribLocation(gl.program, 'normal');
    gl.program.v_Color = gl.getAttribLocation(gl.program, 'v_Color');
    // Prepare empty buffer objects for vertex coordinates, colors, and normals
    var model = initVertexBuffers(gl);
    // Start reading the OBJ file
    readOBJFile(obj_filename, gl, model, scale, true);
    return model;
}
    // Create a buffer object and perform the initial configuration
    function initVertexBuffers(gl,program) { 
        var o = new Object();
        o.vertexBuffer = createEmptyArrayBuffer(gl,gl.program.v_Position,3,gl.FLOAT);
        o.normalBuffer = createEmptyArrayBuffer(gl,gl.program.normal,3,gl.FLOAT);
        o.colorBuffer = createEmptyArrayBuffer(gl,gl.program.v_Color,4,gl.FLOAT);
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