class CollisionEffect extends THREE.InstancedMesh{
    static STAR = 0;

    constructor(scene, visible=false, type=CollisionEffect.STAR, count=50){
        let geometry;

        switch(type){
            case CollisionEffect.STAR:
                geometry = createStar();
                const scale = 0.2;
                geometry.scale(scale, scale, scale);
                break;
        }

        const material = new THREE.MeshBasicMaterial();
    
        super(geometry, material, count);

        scene.add(this);
        this.visible = visible;

        this.obj = new THREE.Object3D();

        this.velocity = [];
        this.acceleration = [];
        this.positions = [];

        const speed = 0.005;

        for(let i=0; i<count; i++){
            const v = new THREE.Vector3(this.random(-1,1) * speed, this.random(-1,1)*speed, this.random(-1,1)*speed );
            this.acceleration.push(v);
            this.velocity.push( new THREE.Vector3() );
            this.positions.push( new THREE.Vector3() );
        }

        function createStar(){
            const outerRadius = 0.3;
            const innerRadius = outerRadius * 0.4;

            let outer = true;
            let move = true;

            const shape = new THREE.Shape();
            
            for(let i=0; i<10; i++){
                const theta = (Math.PI * 2 / 10) * i;
                const radius = (outer) ? outerRadius : innerRadius;
                const x = Math.cos(theta) * radius;
                const y = Math.sin(theta) * radius;
                if (move){
                    shape.moveTo(x, y);
                    move = false;
                }else{
                    shape.lineTo(x, y);
                }
                outer = !outer;
            }

            const extrudeSettings = {
                steps: 1,
                depth: outerRadius*0.1,
                bevelEnabled: false
            }; 
    
            return new THREE.ExtrudeGeometry( shape, extrudeSettings );
        }
    }

    random( min, max ){
        return Math.random() * (max-min) + min;
    }

    reset(pos){
        this.obj.position.set(0,0,0);
        this.obj.updateMatrix();

        for(let i=0; i<this.count; i++){
            this.setMatrixAt(i, this.obj.matrix);
            this.positions[i].copy(this.obj.position);
            this.velocity[i].copy(this.obj.position);
        }

        this.instanceMatrix.needsUpdate = true;
        this.elapsedTime = 0;

        this.visible = true;
    }

    update(time, dt){
        if (this.visible){
            for(let i=0; i<this.count; i++){
                this.velocity[i].add(this.acceleration[i]);
                this.obj.position.copy(this.positions[i]).add(this.velocity[i]);
                this.obj.updateMatrix();
                this.positions[i].copy(this.obj.position);
        
                this.setMatrixAt(i, this.obj.matrix);
            }
            this.instanceMatrix.needsUpdate = true;
            this.elapsedTime += dt;
            if (this.elapsedTime > 1) this.visible = false;
        }
    }
}

export { CollisionEffect };