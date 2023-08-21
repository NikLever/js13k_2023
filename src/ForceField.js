import { Shield } from "./Models.js";

class ForceField extends THREE.Group{
    static radius = 0.8;
    static height = 1.8;
    static scale = 0.2;
    static rows = 5;
    static count = 8;

    constructor(){
        super();

        const shield = new Shield();

        this.obj = new THREE.Object3D();
        const geometry = shield.geometry.clone().scale( ForceField.scale, ForceField.scale, ForceField.scale);
        this.meshes = new THREE.InstancedMesh( geometry, shield.material, ForceField.count*ForceField.rows);
        this.add(this.meshes);

        this.time = 0;
        this.update(0);
    }

    update(dt){
        this.time += dt;
        
        const PI2 = Math.PI * 2;
        const inc = PI2/ForceField.count;
        let index = 0;

        for(let row=0; row<ForceField.rows; row++){
            const n = (row % 2) ? 1 : -1;
            const y = (ForceField.height/ForceField.rows) * row;
            for(let i=0; i<ForceField.count; i++ ){
                const t = (this.time * n) % PI2;
                const r = (this.time * -1) % PI2;
                const z = Math.sin(t+i*inc) * ForceField.radius;
                const x = Math.cos(t+i*inc) * ForceField.radius;
                this.obj.position.set(x,y,z);
                this.obj.rotation.set(0,t,0);
                this.obj.updateMatrix();
				this.meshes.setMatrixAt( index ++, this.obj.matrix );
            }
        }

        this.meshes.instanceMatrix.needsUpdate = true;
    }
}

export { ForceField };