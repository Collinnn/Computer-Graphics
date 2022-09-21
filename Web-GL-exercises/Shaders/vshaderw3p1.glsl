attribute vec4 v_Position;
attribute vec4 v_Color;
varying vec4 fColor;

void main() {
    fColor      = v_Color;
    gl_Position  = 0.5*v_Position;
}
