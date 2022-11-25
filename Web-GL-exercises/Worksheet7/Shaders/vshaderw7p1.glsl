attribute vec4 v_Position;
attribute vec4 normal;
uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform vec3 eyepos;
varying vec4 fPosition;
varying vec4 fTexNormal;
uniform sampler2D texMap;



void main() {
    fTexNormal = normal;
    gl_Position  = projectionMatrix*viewMatrix*modelMatrix*v_Position;

}
