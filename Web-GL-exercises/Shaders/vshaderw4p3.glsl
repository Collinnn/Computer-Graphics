attribute vec4 v_Position;
attribute vec4 normal;
uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform float shininess;
uniform mat4 viewMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform vec4 lightPosition;
varying vec4 fColor;

void main() {
    
    vec3 pos = (modelMatrix*viewMatrix*v_Position).xyz;
    vec3 light = (lightPosition).xyz;
    vec3 L = lightPosition.w == 0.0 ? normalize(light) : normalize(light - pos);
    vec3 E = -normalize(pos);
    vec3 H = normalize(L+E);
    vec3 N=normalize((modelMatrix*viewMatrix*normal).xyz);


    // Compute terms in the illumination equation
    vec4 ambient = ambientProduct;
    float Kd = max(dot(L, N), 0.0);
    vec4 diffuse = Kd * diffuseProduct;
    float Ks = pow(max(dot(N, H), 0.0), shininess);
    vec4 specular = Ks * specularProduct;
    if (dot(L, N) < 0.0) {
    specular = vec4(0.0, 0.0, 0.0, 1.0);
    }
    gl_Position  = projectionMatrix*viewMatrix*modelMatrix*v_Position;
    fColor = ambient + diffuse + specular;
    fColor.a = 1.0;
    

}
