import { SPCOLLIDERTYPES } from "./SPCollider.js";

class SPBody{
    constructor(mesh=null, collider=null, mass=0){
        this.mass = mass;
        this.invMass = (mass!=0) ? 1/mass : 0;
        this.position = (mesh) ? mesh.position.clone() : new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.damping = 0.99;
        this.restitution = 0.9;
        this.collider = collider;
        this.mesh = mesh;
        if (mass>0 && collider.type != SPCOLLIDERTYPES.SPHERE){
            console.warn( 'SPBody constructor: only Sphere dynamic bodies are supported' );
        }
        this.sfx = null;
        this.onCollision = null;
    }

    playSfx(){
        const elapsedTime = (this.sfxPlayTime) ? Date.now() - this.sfxPlayTime : 1000;
        if (this.sfx==null || this.sfx.isPlaying || this.velocity.length()<0.01 || elapsedTime<500) return;
        this.sfx.play();
        this.sfxPlayTime = Date.now();
    }
}

export { SPBody };