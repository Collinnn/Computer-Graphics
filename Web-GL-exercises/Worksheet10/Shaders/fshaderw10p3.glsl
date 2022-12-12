precision mediump float;
#define PI 3.1415926535897932384626433832795
uniform samplerCube texCubeMap;

uniform mat4 texMatrix;

uniform bool isReflective;
uniform vec4 eyepos;
uniform sampler2D nMap;
varying vec4 fPosition;
varying vec4 fTexNormal;

vec3 rotate_to_normal(vec3 n, vec3 v) {
    float sgn_nz = sign(n.z + 1.0e-12);
    float a = -1.0/(1.0 + abs(n.z));
    float b = n.x*n.y*a;
    return vec3(1.0 + n.x*n.x*a, b, -sgn_nz*n.x)*v.x
    + vec3(sgn_nz*b, sgn_nz*(1.0 + n.y*n.y*a), -n.y)*v.y
    + n*v.z;
}

//reflect(vec3 incident, vec3 normal)
void main() {
     vec4 texColor;
     
    if(isReflective){
        vec4 c = texture2D(nMap, vec2(1.0 - atan(fTexNormal.z, fTexNormal.x)/(2.0*PI), acos(fTexNormal.y)/PI));
        vec3 n = 2.0*c.xyz - 1.0;
        vec3 omegaN = (fTexNormal).xyz;
        vec3 viewVector = (fPosition - eyepos).xyz;
        texColor = textureCube(texCubeMap, reflect(viewVector,  rotate_to_normal(omegaN, n)));
    }else{
        texColor = textureCube(texCubeMap, (texMatrix * fPosition).xyz);
    }
    
    texColor.a=1.0;

    gl_FragColor = texColor;

}
