attribute vec4 v_Position;
attribute vec4 v_Color;
uniform mat4 viewMatrix; 
varying vec4 fColor;

void main() {
    fColor      = v_Color;
    gl_Position  = viewMatrix*0.5*v_Position;

}
