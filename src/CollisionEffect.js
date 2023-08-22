class CollisionEffect extends THREE.InstancedMesh{
    static STAR = 0;

    constructor(scene, visible=false, options = { shape: CollisionEffect.STAR }){
        let geometry;

        switch(options.shape){
            case CollisionEffect.STAR:
                geometry = createStar();
                const scale = 0.2;
                geometry.scale(scale, scale, scale);
                break;
        }

        const material = new THREE.MeshBasicMaterial();
    
        super(geometry, material, options.count ? options.count : 50);
        this.startColor = new THREE.Color(options.startColor ? options.startColor : 0xFFFFFF);
        this.endColor = new THREE.Color(options.endColor ? options.endColor : 0xAA2222);
         
        scene.add(this);
        this.visible = visible;
        this.config = options;

        this.obj = new THREE.Object3D();

        this.velocity = [];
        this.acceleration = [];
        this.positions = [];

        function createStar(){
            const outerRadius = 1;
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

        const speed = 0.03;

        this.velocity = [];
        this.acceleration = [];
        this.positions = [];

        this.position.copy(pos);
        let v, p;
        const inc = Math.PI * 2 / this.count;

        for(let i=0; i<this.count; i++){
            if (this.config.velocity){
                v = this.config.velocity.clone();
                v.y *= this.random(0.4, 1.1);
            }else{
                v = new THREE.Vector3(this.random(-1,1) * speed, this.random(-1,1)*speed, this.random(-1,1)*speed );
            }
            if (this.config.radius){
                p = new THREE.Vector3(Math.cos(inc*i)*this.config.radius, 0, Math.sin(inc*i)*this.config.radius);
                v.add(p.clone().multiplyScalar(0.02));
            }else{
                p = new THREE.Vector3();
            }
            this.velocity.push(v);
            this.acceleration.push(v.clone().multiplyScalar(5));
            this.positions.push( p );
            this.setMatrixAt(i, this.obj.matrix);
        }

        this.instanceMatrix.needsUpdate = true;
        this.elapsedTime = 0;

        this.visible = true;
    }
   
    update(time, dt){
        if (this.visible){
            const scale = (this.elapsedTime<0.5) ? 1 : 1 - (this.elapsedTime-0.5)*2;
            this.material.color.lerpColors( this.startColor, this.endColor, this.elapsedTime-0.2);
            this.material.needsUpdate = true;
            for(let i=0; i<this.count; i++){
                this.obj.position.copy(this.positions[i].clone().add(this.velocity[i].clone().multiplyScalar(this.elapsedTime)).add(this.acceleration[i].clone().multiplyScalar(this.elapsedTime*this.elapsedTime)));
                this.velocity[i].multiplyScalar(0.99);
                this.acceleration[i].multiplyScalar(0.99);
                this.acceleration[i].y -= dt * 0.05;//gravity effect
                this.obj.rotation.z = this.elapsedTime * 6;
                this.obj.scale.set(scale, scale, scale);
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