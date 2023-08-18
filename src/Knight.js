class Knight{
    constructor(scene, colours, black=false){
        this.root = new THREE.Group();
        this.model = this.createModel(colours, black);
        this.root.add(this.model);
        if (!black){
            const light = new THREE.PointLight(0xFFFFFF, 2.5, 5)
            light.position.set(0, 3, 1);
            this.root.add(light);
        }
        scene.add(this.root);
        this.life = 1;
    }

    createModel(colours, black){
        const gSkirt = new THREE.CylinderGeometry(0.4, 0.6, 0.5, 32, 1, true );
        const gHead = new THREE.SphereGeometry(0.4, 24, 10);
        const pHelmet = [
            new THREE.Vector2(0.5, (black) ? -0.32: 0),
            new THREE.Vector2(0.5, 0.2),
            new THREE.Vector2(0.45, 0.2),
            new THREE.Vector2(0.4, 0.3),
            new THREE.Vector2(0.3, 0.4),
            new THREE.Vector2(0, 0.5),
        ];
        const gHelmet = new THREE.LatheGeometry(pHelmet, 12);
        const pTunic = [
            new THREE.Vector2(0.45, 0),
            new THREE.Vector2(0.43, 0.1),
            new THREE.Vector2(0.4, 0.2),
            new THREE.Vector2(0.32, 0.3),
            new THREE.Vector2(0.16, 0.4),
            new THREE.Vector2(0.05, 0.5),
        ];
        const gTunic = new THREE.LatheGeometry(pTunic, 12);
        const gBelt = new THREE.CylinderGeometry(0.45, 0.45, 0.2, 32, 1, false);

        const mSkirt = new THREE.MeshStandardMaterial( { color: colours[0] } );
        const mHead = new THREE.MeshStandardMaterial( { color: colours[1] } );
        const mHelmet = new THREE.MeshStandardMaterial( { color: colours[2] } );
        const mTunic = new THREE.MeshStandardMaterial( { color: colours[3] } );
        const mBelt = new THREE.MeshStandardMaterial( { color: colours[4] } );

        const root = new THREE.Group();
        const skirt = new THREE.Mesh( gSkirt, mSkirt );
        skirt.matrix.fromArray([1,0,0,0,0,1,0,0,0,0,1,0,0,0.25,0,1]);
        root.add(skirt);
        const head = new THREE.Mesh( gHead, mHead );
        head.matrix.fromArray([1,0,0,0,0,1,0,0,0,0,1,0,0,1.3466628932086855,0,1]);
        root.add(head);
        const helmet = new THREE.Mesh( gHelmet, mHelmet );
        helmet.matrix.fromArray([1,0,0,0,0,1,0,0,0,0,1,0,0,1.4010108612494776,0,1]);
        root.add(helmet);
        const tunic = new THREE.Mesh( gTunic, mTunic );
        tunic.matrix.fromArray([1,0,0,0,0,1,0,0,0,0,1,0,0,0.6106004423389476,0,1]);
        root.add(tunic);
        const belt = new THREE.Mesh( gBelt, mBelt );
        belt.matrix.fromArray([1.2,0,0,0,0,1,0,0,0,0,1,0,-0.04,0.5495005511829094,0,1]);
        root.add(belt);
        const holster = new THREE.Group();
        holster.matrix.fromArray([-0.35720565585769637,0.3938782714057841,-0.8469144152378472,0,0.42366237124806155,0.8764189006544746,
            0.22891069386132204,0,0.8324147491555773,-0.27703757487025793,-0.479933190661225,0,-0.35543787836579954,
            0.7856016096417388,0.15829722622603848,1]);
        root.add(holster);

        this.sword = this.createSword(colours);
        holster.add( this.sword );

        root.traverse( object => {
			if ( object.matrixAutoUpdate ){
                object.matrix.decompose( object.position, object.quaternion, object.scale );
            }
        });

        this.animactions = {};

        const config1 = {
            duration: 0.4,
            times: [0, 0.1, 0.3],
            pos:[{ x:0, y:0, z:0 }, { x:-0.261, y:0.522, z:0.201 }, { x:-0.293, y:0.722, z:0.861 }],
            rot:[{ x:0, y:0, z:0 }, { x:21.69, y:13.79, z:-9.18 }, { x:-2.23, y:4.21, z:175.94 }]
        }
        const drawsword = this.createAnim('drawsword', config1);

        const config2 = {
            duration: 0.45,
            times: [0, 0.05, 0.1, 0.25, 0.3, 0.45],
            pos:[{ x:-0.293, y:0.722, z:0.861 }, { x:-0.928, y:0.556, z:-0.094 }, { x:-0.529, y:0.070, z:-0.026 }, { x:-0.848, y:0.733, z:-0.150 }, { x:-1.038, y:0.755, z:0.720 }, { x:-0.293, y:0.722, z:0.861 }],
            rot:[{ x:-2.23, y:4.21, z:175.94 }, { x:-111.33, y:18.07, z:-107.23 }, { x:29.51, y:-2.52, z:-41.79 }, { x:-86.10, y:6.01, z:-115.58 }, { x:-65.92, y:13.74, z:-39.0 }, { x:-2.23, y:4.21, z:175.94 }]
        }
        const usesword = this.createAnim('usesword', config2);

        this.mixer = new THREE.AnimationMixer(this.sword);
        this.animactions.drawaction = this.mixer.clipAction(drawsword);
        this.animactions.drawaction.clampWhenFinished = true;
        this.animactions.drawaction.loop = THREE.LoopOnce;
        this.animactions.useaction = this.mixer.clipAction(usesword);

        return root;
    }

    createAnim(name, config){
        const pvalues = [], qvalues = [];
        const v = new THREE.Vector3(), q = new THREE.Quaternion(), e = new THREE.Euler();
        const d2r = Math.PI/180;

        for(let i=0; i<config.times.length; i++){
            const pos = config.pos[i];
            const rot = config.rot[i];
            v.set(pos.x, pos.y, pos.z).toArray( pvalues, pvalues.length );
            e.set(rot.x*d2r, rot.y*d2r, rot.z*d2r);
            q.setFromEuler(e).toArray( qvalues, qvalues.length );
        }

		const pos = new THREE.VectorKeyframeTrack( '.position', config.times, pvalues );
        const rot = new THREE.QuaternionKeyframeTrack( '.quaternion', config.times, qvalues );

		return new THREE.AnimationClip( name, config.duration, [ pos, rot ] );
    }

    createSword(colours){
        const gBlade = new THREE.BoxGeometry( 0.22, 0.5, 0.05, 2, 1, 1 );
        const pBlade = gBlade.getAttribute('position');
        const v = new THREE.Vector3();
        //Create point at blade tip
        for(let i=0; i<pBlade.array.length; i+=3){
            v.set(pBlade.array[i], pBlade.array[i+1], pBlade.array[i+2]);
            if (v.x==0 && v.y<0) pBlade.array[i+1] -= 0.06;
        }
        pBlade.needsUpdate = true;
        const gHandle = new THREE.CylinderGeometry(0.08, 0.09, 0.28, 8, 1, true);
        const gHandleTop = new THREE.CapsuleGeometry(0.1, 0.3, 4, 20);
        const gCrossBar = new THREE.BoxGeometry(0.28, 0.04, 0.18);
        const gCrossBarEnd = new THREE.CapsuleGeometry(0.1, 0.3, 4, 12);
        
        const mBlade = new THREE.MeshStandardMaterial( { color: colours[5], emissive: 6381921 } );
        const mHandle = new THREE.MeshStandardMaterial( { color: colours[6] } );
        const mGold = new THREE.MeshStandardMaterial( { color: colours[7], emissive: 6381921 } );

        const root = new THREE.Group();
        const blade = new THREE.Mesh( gBlade, mBlade );
        blade.matrix.fromArray([1,0,0,0,0,1,0,0,0,0,1,0,0,-0.3517202033838308,0,1]);
        root.add(blade);
        const handle = new THREE.Mesh( gHandle, mHandle );
        handle.matrix.fromArray([1,0,0,0,0,1,0,0,0,0,1,0,0,0.07401843451376103,0,1]);
        root.add(handle);
        const handleTop = new THREE.Mesh( gHandleTop, mGold );
        handleTop.matrix.fromArray([1,0,0,0,0,0.22,0,0,0,0,1,0,0,0.14,0,1]);
        handle.add(handleTop);
        const crossBar = new THREE.Mesh( gCrossBar, mGold );
        crossBar.matrix.fromArray([1,0,0,0,0,1,0,0,0,0,1,0,0,-0.0795935848745708,0,1]);
        root.add(crossBar);
        const crossBarEnd = new THREE.Mesh( gCrossBarEnd, mGold );
        crossBarEnd.matrix.fromArray([1.14,0,0,0,0,0.12,0,0,0,0,1,0,-0.12,0,0,1]);
        crossBar.add(crossBarEnd);
        const crossBarEnd2 = crossBarEnd.clone();
        crossBarEnd2.matrix.fromArray([1.14,0,0,0,0,0.12,0,0,0,0,1,0,0.2,0,0,1]);
        crossBar.add(crossBarEnd2);

        return root;
    }

    setDirection( v ){
        if (!v || v.length()==0) return;
        const direction = v.clone().multiplyScalar(10);
        direction.y = 0;
        const target = this.root.position.clone().add(direction);
        const q = this.root.quaternion.clone();
        this.root.lookAt(target);
        this.root.quaternion.slerp(q, 0.9);
    }

    playAnim(name){
        console.log(`playAnim(${name})`);

        this.stopAnims();

        if (name=='drawaction'){
            this.attacking = true;
            this.mixer.addEventListener('finished', this.playAnim.bind(this, 'useaction'));
        }else{
            this.mixer.removeEventListener('finished');
        }

        this.animactions[name].play();
    }

    stopAnims(){
        this.attacking = false;
        for( const [key, action] of Object.entries(this.animactions) ) {
            action.stop();
            action.reset();
        };     
    }

    update(dt, v){
        if (this.mixer) this.mixer.update(dt);
        if (v) this.setDirection(v);
    }
}

export { Knight };