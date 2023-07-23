class SPBody{
    constructor( mesh, collider, mass = 0){
        this.mesh = mesh;
        this.position = mesh.position.clone();
        this.velocity = new THREE.Vector3();
        this.force = new THREE.Vector3();
        this.mass = mass;
        this.collider = collider;
        this.restitution = 0.7;
        this.staticFriction = 0.8;
        this.dynamicFriction = 0.3;
    }
}

export { SPBody };