precision mediump float;
varying vec2 fTexCord;
uniform sampler2D texMap;
uniform bool shadow;

void main() {
    if(shadow){
        gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    }else {
        gl_FragColor = texture2D(texMap,fTexCord);
    }
  

}
