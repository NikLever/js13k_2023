import { GPUParticleSystem } from "./GPUParticleSystem.js";

class CollisionEffect extends GPUParticleSystem{
    constructor(scene, visible){
        
        const texture = createStar();
        //const radius = 0.5;

        super({
          maxParticles: 50,
          particleSpriteTex: texture,
          blending: THREE.AdditiveBlending,
          });

          if (scene) scene.add(this);

          this.visible = visible;

          function createStar(){
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const context = canvas.getContext('2d');
    
            const outerRadius = 31;
            const innerRadius = 12;
    
            let outer = true;
            let move = true;
            const center = 32;
    
            context.fillStyle = 'white';

            context.beginPath();
    
            for(let i=0; i<10; i++){
                const theta = (Math.PI * 2 / 10) * i;
                const radius = (outer) ? outerRadius : innerRadius;
                const x = Math.cos(theta) * radius + center;
                const y = Math.sin(theta) * radius + center;
                if (move){
                    context.moveTo(x, y);
                    move = false;
                }else{
                    context.lineTo(x, y);
                }
                outer = !outer;
            }
    
            context.closePath();
            context.fill();
    
            return new THREE.CanvasTexture(canvas);
        }
    }

    reset(pos){
        this.position.copy(pos);

        const options = {
            position: new THREE.Vector3(0,0,0),
            positionRandomness: 0.0,
            velocity: new THREE.Vector3(0,0,0),
            velocityRandomness: 0.0,
            acceleration: new THREE.Vector3(0,0,0),
          
            color: new THREE.Color(1.0,1.0,1.0),
            endColor: new THREE.Color(1.0,0.0,0.0),
            colorRandomness: 0.0,
          
            lifetime: 1,
            fadeIn:0.001,
            fadeOut:0.001,
            size: 25,
            sizeRandomness: 0.0,
          }   
        
        const rand = (min,max) => Math.random()*(max-min) + min;
        const speed = 0.5;

        for(let i=0; i<this.PARTICLE_COUNT; i++){
            options.velocity.set(rand(-1,1)*speed, rand(-1,1)*speed, rand(-1,1)*speed);
            options.acceleration.copy(options.velocity).multiplyScalar(10);
            this.spawnParticle(options);
        }

        this.visible = true;
    }

    update(time, dt){
        if (this.visible){
            super.update(time);
            this.elapsedTime += dt;
            if (this.elapsedTime > 1) this.visible = false;
        }
    }
}

export { CollisionEffect };