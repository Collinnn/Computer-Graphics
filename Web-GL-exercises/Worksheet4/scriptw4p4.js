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
    
    





    function triangle(a,b,c){
        var t1 = subtract(b, a);
        var t2 = subtract(c, a);
        var normal = normalize(cross(t2, t1));
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
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
    gl.program = initShaders(gl, "Shaders/vshaderw4p4.glsl", "Shaders/fshaderw4p4.glsl");
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
    
    //Location lock for lighting (In this only diffuse is used)
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
        materialDiffuse = vec4(a,0.0,a,1.0); 
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

    var spin = 0.5;
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
    gl.drawArrays(gl.TRIANGLES,0,index);

}
