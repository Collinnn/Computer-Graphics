attribute vec4 v_Position;
attribute vec4 normal;
attribute vec4 v_Color;
uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform vec4 lightPosition;
uniform vec3 eyepos;
varying vec3 N,L,E;
uniform mat4 shadowMatrix;
uniform bool shadow;
varying vec4 fColor;

void main() {
    if(shadow){
        gl_Position=projectionMatrix*viewMatrix*shadowMatrix*modelMatrix*v_Position;
    }else{
        vec3 pos = (modelMatrix*v_Position).xyz;
        vec3 light = lightPosition.xyz;
        L = lightPosition.w == 0.0 ? normalize(-light) : normalize(light - pos);
        E = normalize(eyepos-pos);
        N = normalize((modelMatrix*normal).xyz);
        gl_Position  = projectionMatrix*viewMatrix*modelMatrix*v_Position;
        fColor = v_Color;
    }


}
