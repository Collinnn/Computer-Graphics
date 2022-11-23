precision mediump float;
varying vec3 N,L,E;
uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform float shininess;
uniform sampler2D texMap;
varying vec4 fTexNormal;
#define PI 3.1415926538

void main() {
    vec4 fColor;
    vec3 LL=normalize(L);
    vec3 EE=normalize(E);
    vec3 NN=normalize(N);
    vec3 H = normalize(LL+EE);


    vec4 ambient = ambientProduct;
    float Kd = max(dot(LL,NN),0.0);
    vec4 diffuse = Kd*diffuseProduct;
    
    float Ks = pow(max(dot(NN, H), 0.0), shininess);
    vec4 specular = Ks * specularProduct;

    if (dot(LL, NN) < 0.0) {
    specular = vec4(0.0, 0.0, 0.0, 1.0);
    }
    vec3 texN = normalize(fTexNormal.xyz);
    vec2 fTexCoord = vec2(1.0 - atan(texN.z,texN.x)/(2.0*PI), acos(texN.y) / PI);  

    fColor = ambient + diffuse + specular + texture2D(texMap, fTexCoord);
    fColor.a = 1.0;
    gl_FragColor = fColor;

}
