import { SPCOLLIDERTYPES } from "./SPCollider.js";

class SPBody{
    constructor(mesh=null, collider=null, mass=0){
        this.mass = mass;
        this.invMass = (mass!=0) ? 1/mass : 0;
        this.position = (mesh) ? mesh.position.clone() : new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.damping = 0.99;
        this.restitution = 0.8;
        this.collider = collider;
        this.mesh = mesh;
        if (mass>0 && collider.type != SPCOLLIDERTYPES.SPHERE){
            console.warn( 'SPBody constructor: only Sphere dynamic bodies are supported' );
        }
    }
}

export { SPBody };