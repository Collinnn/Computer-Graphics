attribute vec4 v_Position;
attribute vec4 v_Color;
attribute vec4 normal;
uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform vec4 lightPosition;
varying vec4 fColor;

void main() {
    
    vec3 pos = -(modelMatrix*v_Position).xyz;
    vec3 light = (lightPosition).xyz;
    vec3 L = lightPosition.w == 0.0 ? normalize(light) : normalize(light - pos);

    // Compute terms in the illumination equation
    gl_Position  = projectionMatrix*viewMatrix*modelMatrix*v_Position;

    //Ambient is just a 0.0 vec4
    fColor =  ambientProduct+v_Color*diffuseProduct* max(dot(pos,normalize(L)),0.0);

    

}
