precision mediump float;
uniform samplerCube texCubeMap;

uniform mat4 texMatrix;
varying vec4 fPosition;
varying vec4 fTexNormal;


void main() {

    
    vec4 texColor = textureCube(texCubeMap, (texMatrix * fPosition).xyz);
    texColor.a=1.0;

    gl_FragColor = texColor;

}
