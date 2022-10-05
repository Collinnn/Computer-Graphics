attribute vec4 v_Position;
attribute vec4 v_Color;
uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
varying vec4 fColor;

void main() {
    fColor      = v_Color;
    gl_Position  = projectionMatrix*viewMatrix*modelMatrix*v_Position;

}
