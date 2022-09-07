attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
uniform float v;

void main() {
v_Color = a_Color;
//Translation matrix
gl_Position.x = a_Position.x;
gl_Position.y = a_Position.y+v;
gl_Position.z = a_Position.z;
gl_Position.w = a_Position.w; 
}
