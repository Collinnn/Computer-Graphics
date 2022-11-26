precision mediump float;
uniform samplerCube texCubeMap;

uniform mat4 texMatrix;
varying vec4 fPosition;
varying vec4 fTexNormal;
uniform bool isReflective;
uniform vec4 eyepos;


//reflect(vec3 incident, vec3 normal)
void main() {
     vec4 texColor;
    if(isReflective){
        texColor = textureCube(texCubeMap, reflect(((fPosition) - eyepos).xyz, fTexNormal.xyz));
    }else{
        texColor = textureCube(texCubeMap, (texMatrix * fPosition).xyz);
    }
    
    texColor.a=1.0;

    gl_FragColor = texColor;

}
