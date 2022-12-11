precision mediump float;
varying vec3 N,L,E;
varying vec4 fColor;
uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform float shininess;
uniform bool shadow;
void main() {

    if(shadow){
        gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    }else{
    vec4 fColor;
    vec3 LL=normalize(L);
    vec3 EE=normalize(E);
    vec3 NN=normalize(N);
    vec3 H =normalize(LL+EE);
    NN[0] = -NN[0];

    vec4 ambient = ambientProduct;
    float Kd = max(dot(LL,NN),0.0);
    vec4 diffuse = Kd*diffuseProduct;
    
    float Ks = pow(max(dot(NN, H), 0.0), shininess);
    vec4 specular = Ks * specularProduct;

    if (dot(LL, NN) < 0.0) {
    specular = vec4(0.0, 0.0, 0.0, 1.0);
    }

    fColor = ambient + diffuse + specular;
    fColor.a = 1.0;
    gl_FragColor = fColor;
    }


}