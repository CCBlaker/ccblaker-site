#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float lerp (float a, float b, float t) {
    return (1.0-t)*a + t*b;
}

vec3 vecLerp(vec3 v1, vec3 v2, float t) {
    return vec3(
        lerp(v1.x, v2.x, t),
        lerp(v1.y, v2.y, t),
        lerp(v1.z, v2.z, t)
    );
}

vec2 complexSquare(vec2 z) {
    return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
}

float juliaSet(vec2 z0, vec2 c) {
    vec2 z = z0;
    float itr = 300.0;
    for (int i = 0; i < 300; i++) {
        z = complexSquare(z) + c;
        if (length(z) > 2.0) {
            itr = float(i);
            break;
        }
    }
    return itr / 300.0;
}

void main() {
  
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
  uv.x *= aspect;

  vec2 mousePos = (u_mouse / u_resolution) * 2.0 - 1.0;
  mousePos.x *= aspect;

  float t = u_time;

  vec2 c = mousePos;
  vec2 z = uv;
  int maxItr = 300;

  float juliaDist = juliaSet(z, c);
    
  vec3 col = vecLerp(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), pow(juliaDist, 0.3));

  gl_FragColor = vec4(col, 1.0);
}