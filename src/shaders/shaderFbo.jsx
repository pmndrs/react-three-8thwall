const vertex = `
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

const fragment = `

precision mediump float;


in vec2 vUv;
out vec4 fragColor;
uniform sampler2D sampler;
uniform sampler2D tDepth;
uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform vec2 uRes;

float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}

float depthSampleToWorld(float depth, float cameraNear, float cameraFar) {
	// return cameraNear * cameraFar / (cameraFar - depth * (cameraFar - cameraNear));
  float viewZ = perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

}

float sobelDepth(sampler2D tex, ivec2 xy, float camNear, float camFar) {
  float
    x00 = depthSampleToWorld(texelFetch(tex, xy + ivec2(-1, -1), 0).x, camNear, camFar),
    x01 = depthSampleToWorld(texelFetch(tex, xy + ivec2(-1,  0), 0).x, camNear, camFar),
    x02 = depthSampleToWorld(texelFetch(tex, xy + ivec2(-1,  1), 0).x, camNear, camFar),
    x10 = depthSampleToWorld(texelFetch(tex, xy + ivec2( 0, -1), 0).x, camNear, camFar),
    x11 = depthSampleToWorld(texelFetch(tex, xy + ivec2( 0,  0), 0).x, camNear, camFar),
    x12 = depthSampleToWorld(texelFetch(tex, xy + ivec2( 0,  1), 0).x, camNear, camFar),
    x20 = depthSampleToWorld(texelFetch(tex, xy + ivec2( 1, -1), 0).x, camNear, camFar),
    x21 = depthSampleToWorld(texelFetch(tex, xy + ivec2( 1,  0), 0).x, camNear, camFar),
    x22 = depthSampleToWorld(texelFetch(tex, xy + ivec2( 1,  1), 0).x, camNear, camFar);
  float
    x = x00 + 2.0f * x10 + x20 - (x02 + 2.0f * x12 + x22),
    y = x00 + 2.0f * x01 + x02 - (x20 + 2.0f * x21 + x22);
  return sqrt(x * x + y * y);
}

vec3 sobelNorm(sampler2D tex, ivec2 xy) {
  vec3
    x00 = texelFetch(tex, xy + ivec2(-1, -1), 0).xyz,
    x01 = texelFetch(tex, xy + ivec2(-1,  0), 0).xyz,
    x02 = texelFetch(tex, xy + ivec2(-1,  1), 0).xyz,
    x10 = texelFetch(tex, xy + ivec2( 0, -1), 0).xyz,
    x11 = texelFetch(tex, xy + ivec2( 0,  0), 0).xyz,
    x12 = texelFetch(tex, xy + ivec2( 0,  1), 0).xyz,
    x20 = texelFetch(tex, xy + ivec2( 1, -1), 0).xyz,
    x21 = texelFetch(tex, xy + ivec2( 1,  0), 0).xyz,
    x22 = texelFetch(tex, xy + ivec2( 1,  1), 0).xyz;
  vec3
    x = x00 + 2.0f * x10 + x20 - (x02 + 2.0f * x12 + x22),
    y = x00 + 2.0f * x01 + x02 - (x20 + 2.0f * x21 + x22);
  return sqrt(x * x + y * y);
}


vec3 toon(
  vec3 colorIn, uint steps,
  ivec2 fCoord, sampler2D normalTex, sampler2D depthTex,
  float camNear, float camFar,
  float normalWeight, float depthWeight,
  float edgeThresholdMin, float edgeThresholdMax, vec3 color, float scale
) {
  colorIn = floor(colorIn * (float(steps) - 0.01f)) / float(steps);
  vec3 normal = normalWeight * sobelNorm(normalTex, fCoord);
  float depth = depthWeight * sobelDepth(depthTex, fCoord, camNear, camFar);
  float diff = length(normal) + depth;

  colorIn = mix(colorIn, color, smoothstep(edgeThresholdMin, edgeThresholdMax, diff * scale));
  return colorIn;
}


float getHeight(vec2 uv) {
  return texture(tDepth, uv).r;
}

vec4 bumpFromDepth(vec2 uv, vec2 resolution, float scale) {
  vec2 step = 1. / resolution;
    
  float height = getHeight(uv);
    
  vec2 dxy = height - vec2(
      getHeight(uv + vec2(step.x, 0.)), 
      getHeight(uv + vec2(0., step.y))
  );
    
  return vec4(normalize(vec3(dxy * scale / step, 1.)), height);
}



float cameraNear = 0.1;
float cameraFar = 10.;

void main() {
  vec3 result = texture(tDiffuse, vUv).rgb;

  uvec2 fragCoord = uvec2(gl_FragCoord.xy);
  ivec2 fCoord = ivec2(gl_FragCoord.xy);

  vec3 diffuseToon = toon(
    result, 1u, fCoord,
    tNormal, tDepth,
    cameraNear, cameraFar,
    0.2f, 0.5f,
    .3f, 1.8f,
    vec3(1., 0., 0.),
    1.0f
  );
  
  fragColor = vec4(1.);
  fragColor = mix(vec4(1.), texture(tDepth, vUv), 1.);
  // fragColor = vec4(diffuseToon, 1.);
}

`

import * as THREE from 'three'

const shaderFbo = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: null },
    uRes: { value: new THREE.Vector2(500) },
    tDiffuse: { value: null },
    tNormal: { value: null },
    tDepth: { value: null },
  },
  fragmentShader: fragment,
  vertexShader: vertex,
  glslVersion: THREE.GLSL3,
})

export default shaderFbo
