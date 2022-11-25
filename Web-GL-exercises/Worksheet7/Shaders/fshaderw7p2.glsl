precision mediump float;
uniform samplerCube texCubeMap;

varying vec4 fTexNormal;
uniform mat4 texMatrix;
#define PI 3.1415926538

void main() {

    
    vec4 texColor = textureCube(texCubeMap, (texMatrix * fTexNormal).xyz);
    texColor.a=1.0;

    gl_FragColor = texColor;

}
