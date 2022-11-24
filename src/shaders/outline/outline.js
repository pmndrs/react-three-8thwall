import { BackSide, Color, ShaderMaterial, UniformsLib, UniformsUtils } from 'three'
import guid from 'short-uuid'
import { extend } from '@react-three/fiber'

const vertex = `
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
uniform float outlineThickness;


vec4 calculateOutline( vec4 pos, vec3 normal, vec4 skinned ) {
    float thickness = outlineThickness;
    float ratio = 1.5; // TODO: support outline thickness ratio for each vertex
    vec4 pos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + normal, 1.0 );
    vec4 norm = normalize( pos - pos2 );
    // REMOVED * POS.W
    return pos + norm * thickness * ratio * (pos.w / 4.);
}

void main() {

    #include <uv_vertex>

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <project_vertex>
    vec3 outlineNormal = - objectNormal; // the outline material is always rendered with BackSide
    gl_Position = calculateOutline(gl_Position, outlineNormal, vec4( transformed, 1.0 ));

    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    #include <fog_vertex>
}
`

const fragment = `
#include <common>
#include <fog_pars_fragment>
uniform vec3 outlineColor;
uniform float outlineAlpha;

void main() {
    gl_FragColor = vec4( outlineColor, outlineAlpha );
    #include <premultiplied_alpha_fragment>
    #include <fog_fragment>
}
`

class ShaderOutline extends ShaderMaterial {
  constructor() {
    super({
      uniforms: UniformsUtils.merge([
        UniformsLib['fog'],
        UniformsLib['displacementmap'],
        {
          outlineThickness: { value: 0.02 },
          outlineColor: { value: new Color(0x000000) },
          outlineAlpha: { value: 1 },
        },
      ]),
      fragmentShader: fragment,
      vertexShader: vertex,
      side: BackSide,
    })
  }
}

ShaderOutline.key = guid.generate()

extend({ ShaderOutline })
export default ShaderOutline
