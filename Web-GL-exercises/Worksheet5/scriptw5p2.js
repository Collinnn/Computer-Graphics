var gl;
var index = 0;
var pointsArray =[];
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
    var numberSubdiv=0;


    gl = WebGLUtils.setupWebGL(canvas);
    
    if(gl == null){
        alert("Not supported");
        return;
    }

    gl.vBuffer = null;
    gl.bufferc = null;
    gl.nbuffer = null;

    //Tetrahedron
    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);

    var normalsArray = [];
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
    
    function initObject(gl, obj_filename, scale)
    {
        gl.program.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        gl.program.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
        gl.program.a_Color = gl.getAttribLocation(gl.program, 'a_Color');
        // Prepare empty buffer objects for vertex coordinates, colors, and normals
        var model = initVertexBuffers(gl);
        // Start reading the OBJ file
        readOBJFile("../Models/Suzanne.obj", gl, model, scale, true);
        return model;
    }
        // Create a buffer object and perform the initial configuration
        function initVertexBuffers(gl,program) { 
            var o = new Object();
            o.vertexBuffer = createEmptyArrayBuffer(gl,program.a_Position,3,gl.FLOAT);
            o.normalBuffer = createEmptyArrayBuffer(gl,program.a_Normal,3,gl.FLOAT);
            o.colorBuffer = createEmptyArrayBuffer(gl,program.a_Color,4,gl.FLOAT);
        }

        function createEmptyArrayBuffer(gl, a_attribute, num, type) { 
            var buffer = gl.createBuffer(); // Create a buffer object
            gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
            gl.vertexAttribPointer(a_attribute,num,type,false,0,0);
            gl.enableVertexAttribArray(a_attribute);
            return buffer;
        }


        var g_objDoc = null; // Info parsed from OBJ file
        var g_drawingInfo = null; // Info for drawing the 3D model with WebGL
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
                g_objDoc = null; g_drawingInfo = null;
                console.log("OBJ file has a passing error");
            }

        }
        function onReadComplete(gl, model, objDoc) { 
            
         }





    function triangle(a,b,c){
        normalsArray.push(vec4(a[0],a[1],a[2],0));
        normalsArray.push(vec4(b[0],b[1],b[2],0));
        normalsArray.push(vec4(c[0],c[1],c[2],0));
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);
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

    
    //import shaders
    gl.program = initShaders(gl, "Shaders/vshaderw4p5.glsl", "Shaders/fshaderw4p5.glsl");
    gl.useProgram(gl.program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    


    function initTetrahedron(gl,numberSubdiv){

        tretrahedron(va,vb,vc,vd,numberSubdiv);

        //create vertex buffer
        gl.deleteBuffer(gl.vBuffer);
        gl.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        //Enable vertex
        var vPos = gl.getAttribLocation(gl.program, "v_Position");
        gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray(vPos);

        //Create normal buffer
        gl.deleteBuffer(gl.nbuffer);
        gl.nbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,gl.nbuffer);
        gl.bufferData(gl.ARRAY_BUFFER,flatten(normalsArray),gl.STATIC_DRAW);
        
        //Enable normal
        var nPos = gl.getAttribLocation(gl.program,"normal");
        gl.vertexAttribPointer(nPos,4,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(nPos);
    }
    
    //Location lock for lighting
    gl.uniform4fv( gl.getUniformLocation(gl.program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(gl.program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(gl.program, "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(gl.program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(gl.program, "shininess"), materialShininess );




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


    var increaseButton = document.getElementById("IncreaseDepth");
    var decreaseButton = document.getElementById("DecreaseDepth");
    var ambientSlider = document.getElementById("AmbientSlider");
    var diffuseSlider = document.getElementById("DiffuseSlider");
    var SpecularSlider = document.getElementById("SpecularSlider");
    var ShinySlider = document.getElementById("ShinySlider");
    var LightEmission = document.getElementById("LightEmission");
    
    increaseButton.addEventListener("click",function(ev){
        numberSubdiv ++;
        pointsArray = [];
        normalsArray= [];
        index = 0;
    });

    decreaseButton.addEventListener("click",function(ev){
        if(numberSubdiv != 0){
            numberSubdiv --;
        }
        pointsArray = [];
        normalsArray= [];
        index = 0;
        
    });
    
    
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
        initTetrahedron(gl,numberSubdiv);
        eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
        V= lookAt(eye,look,up);
        render(gl); 
        requestAnimationFrame(tick);
    }
    tick();
}

function render(gl)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()) {
        // OBJ and all MTLs are available
        g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        }
    if (!g_drawingInfo) return;

    gl.drawElements(gl.TRIANGLES,g_drawingInfo.indicies.length,gl.UNSIGNED_SHORT,0);

}
