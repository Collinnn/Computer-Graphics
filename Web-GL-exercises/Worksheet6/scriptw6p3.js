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
    var numberSubdiv=4;


    gl = WebGLUtils.setupWebGL(canvas);
    
    if(gl == null){
        alert("Not supported");
        return;
    }

    gl.vBuffer = null;
    gl.bufferc = null;
    gl.nbuffer = null;

    //Tetrahedron
    var va = vec4(0.0, 0.0, 1.0, 1);
    var vb = vec4(0.0, 0.942809, -0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
    var vd = vec4(0.816497, -0.471405, -0.333333, 1);

    var normalsArray = [];
    var lightPosition;
    var lightAmbient = vec4(0.25, 0.25, 0.25, 1.0 );
    var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 ); 


    //Set to 0.0 for a directional source light
    lightPosition = vec4(0.0, 0.0, -1.0, 0.0 );
    

    var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
    var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    var materialShininess = 150.0;

    //Products
    var ambientProduct = mult(lightAmbient,materialAmbient);
    var diffuseProduct = mult(lightDiffuse,materialDiffuse);
    var specularProduct = mult(lightSpecular,materialSpecular);
    
    





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
    gl.program = initShaders(gl, "Shaders/vshaderw6p3.glsl", "Shaders/fshaderw6p3.glsl");
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
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW); 
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
    
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    var image = new Image();
    image.onload = function(){
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    image.src ="../Models/earth.jpg";
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    //Camera postion
    var theta = 0;
    var radius = 3;
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
        pointsArray = new Array();
        normalsArray = new Array();
        M=mult(M,rotateX(spin));
        M=mult(M,rotateY(spin));
        M=mult(M,rotateZ(spin));
        theta+=0.01;
        gl.uniformMatrix4fv(mloc,false,flatten(M));
        gl.uniformMatrix4fv(vloc, false, flatten(V));
        initTetrahedron(gl,numberSubdiv);
        eye = vec3(radius * Math.sin(theta),0,radius * Math.cos(theta));
        gl.uniform3fv( gl.getUniformLocation(gl.program, "eyepos"), flatten(eye));
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
