attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
uniform float beta;

void main() {
v_Color.x = a_Color.r *2.0*cos(beta)+0.5;
v_Color.g = a_Color.g *2.0*sin(beta)+0.5;
v_Color.b = a_Color.b *cos(beta)*sin(beta);
v_Color.w = a_Color.a;



//Rotation matrix
gl_Position.x =-sin(beta)*a_Position.x+cos(beta)*a_Position.y; 
gl_Position.y= sin(beta)*a_Position.y+cos(beta)*a_Position.x;
gl_Position.z=0.0;
gl_Position.w=1.0;
}
