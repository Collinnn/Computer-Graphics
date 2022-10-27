attribute vec4 v_Position;
attribute vec4 normal;
uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform vec4 lightPosition;
varying vec3 N,L,E;

void main() {
    mat4 modelViewmatrix = (modelMatrix*viewMatrix);
    vec3 pos = (modelMatrix*v_Position).xyz;
    vec3 light = (viewMatrix*lightPosition).xyz;
    L = lightPosition.w == 0.0 ? normalize(light) : normalize(light - pos);
    E = -normalize(pos);
    N = normalize(modelMatrix*normal).xyz;
    gl_Position  = projectionMatrix*viewMatrix*modelMatrix*v_Position;

    

}
