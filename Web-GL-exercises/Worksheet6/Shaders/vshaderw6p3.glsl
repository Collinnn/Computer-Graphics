attribute vec4 v_Position;
attribute vec4 normal;
uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform vec4 lightPosition;
uniform vec3 eyepos;
varying vec3 N,L,E;
varying vec4 fPosition;
varying vec4 fTexNormal;
uniform sampler2D texMap;



void main() {
    fTexNormal = normal;
    fPosition = modelMatrix * v_Position;
    vec3 pos = (modelMatrix*v_Position).xyz;
    vec3 light = lightPosition.xyz;
    L = lightPosition.w == 0.0 ? normalize(-light) : normalize(light - pos);
    E = normalize(eyepos-pos);
    N = normalize((modelMatrix*normal).xyz);
    gl_Position  = projectionMatrix*viewMatrix*modelMatrix*v_Position;

}
