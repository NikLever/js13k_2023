class ForceField extends THREE.ShaderMaterial{
    constructor(){
        const vshader = `
            varying vec2 vUv;

            void main() {	
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `
            const fshader = `
            #define PI 3.141592653589
            #define PI2 6.28318530718

            uniform float u_time;

            varying vec2 vUv;

            float polygon(vec2 pt, vec2 center, float radius, int sides, float rotate, float edge_thickness){
            pt -= center;
            
            float theta = atan(pt.y, pt.x) + rotate;
            float rad = PI2/float(sides);

            float d = cos(floor(theta/rad + 0.5)*rad-theta)*length(pt);

            return 1.0 - smoothstep(radius, radius + edge_thickness, d);
            }

            mat2 getRotationMatrix(float theta){
            float s = sin(theta);
            float c = cos(theta);
            return mat2(c, -s, s, c);
            }

            void main (void)
            {
            vec2 center = vec2(0.5);
            mat2 mat = getRotationMatrix(u_time);
            vec2 pt = fract(vUv*13.0) - center;
            pt = (mat * pt) + center;
            float radius = 0.1;
            if (polygon(pt, center, radius, 3, 0.0, 0.01)>0.0){
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); 
            }else{
                gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
            }
            }
            `
        super({
            uniforms: { u_time: { value: 0 } },
            vertexShader: vshader,
            fragmentShader: fshader,
            transparent: true       
        });
    }

    update(dt){
        this.uniforms.u_time.value += dt;
    }
}