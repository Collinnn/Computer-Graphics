attribute vec4 v_Position;
attribute vec2 v_TexCord;
varying vec2 fTexCord;


uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;





void main() {
    fTexCord = v_TexCord;
    gl_Position  = projectionMatrix*viewMatrix*modelMatrix*v_Position;

    

}
