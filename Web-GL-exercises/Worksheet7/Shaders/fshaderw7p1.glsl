precision mediump float;
uniform samplerCube texCubeMap;

varying vec4 fTexNormal;
#define PI 3.1415926538

void main() {

    
    vec4 texColor = textureCube(texCubeMap, fTexNormal.xyz);
    texColor.a=1.0;

    gl_FragColor = texColor;

}
