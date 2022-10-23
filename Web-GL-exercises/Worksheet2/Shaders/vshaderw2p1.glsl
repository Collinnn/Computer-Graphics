attribute vec4 vPosition;

void main()
{
	gl_PointSize = 20.0;
    gl_Position = vPosition;
}