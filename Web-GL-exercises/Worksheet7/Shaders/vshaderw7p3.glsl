attribute vec4 v_Position;
attribute vec4 normal;


varying vec4 fPosition;
varying vec4 fTexNormal;


uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;


void main() {
    fTexNormal = normal;
    fPosition = v_Position;
    gl_Position  = projectionMatrix*viewMatrix*modelMatrix*v_Position;

}
