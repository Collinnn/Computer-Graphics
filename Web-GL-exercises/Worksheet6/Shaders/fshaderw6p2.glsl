precision mediump float;
varying vec2 fTexCord;
uniform sampler2D texMap;
void main() {

    gl_FragColor = texture2D(texMap,fTexCord);

}
