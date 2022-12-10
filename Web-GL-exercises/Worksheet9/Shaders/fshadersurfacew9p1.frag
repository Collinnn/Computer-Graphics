precision mediump float;
varying vec2 fTexCord;
uniform sampler2D texMap;
uniform bool shadow;

void main() {
    gl_FragColor = texture2D(texMap, fTexCord);
}
