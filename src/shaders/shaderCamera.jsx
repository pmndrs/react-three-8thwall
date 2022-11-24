const fragment = `

precision mediump float;
varying vec2 texUv;
uniform sampler2D sampler;
uniform float time;
uniform float factor;

float circle(in vec2 _st, in float _radius){
  vec2 dist = _st-vec2(0.5);
return 1.-smoothstep(_radius-(_radius*0.01),
                       _radius+(_radius*0.01),
                       dot(dist,dist)*4.0);
}



void main() {
  // vec2 uvS = mix(texUv, texUv * distance(texUv, vec2(0.5)), factor);
  vec2 position = - 1.0 + 2.0 * texUv;

  // float a = atan( position.y, position.x );
  // float r = sqrt( dot( position, position ) );

  // vec2 uv2;
  // uv2.x = cos( a ) / r;
  // uv2.y = sin( a ) / r;
  // uv2 /= 10.0;
  // uv2 += time * 0.05;

  vec4 camera = texture2D(sampler, mix(texUv, texUv, factor));
  gl_FragColor = mix(camera, vec4(1.), factor);
}


`
export default fragment
