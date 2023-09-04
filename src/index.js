import { SPWorld } from './SimplePhysics/SPWorld.js';
import { SPBody } from './SimplePhysics/SPBody.js';
import { SPSphereCollider, SPPlaneCollider, SPAABBCollider } from './SimplePhysics/SPCollider.js';
import { VRButton } from './VRButton.js';
import { CollisionEffect } from './CollisionEffect.js';
import { Tree, Rock, RockFace, Tower, Shield, Heart, Grail, Gate } from './Models.js';
import { Player } from './Player.js';
import { Enemy  } from './Enemy.js';
import { DebugControls } from './DebugControls.js';
import ballSfx from "../assets/ball1.mp3";

class App{
    static STATES = { IDLE: 0, PLAYING: 1, PAUSED: 2, DEAD: 3, COMPLETE: 4 };

	constructor(){
        const debug = false;

		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 200 );

		this.camera.position.set( 5.3, 10.5, 20 );
        this.camera.quaternion.set( -0.231, 0.126, 0.03, 0.964);
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x050505 );

		this.scene.add( new THREE.HemisphereLight( 0xffffff, 0x404040, 0.45 ) );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

       const light = new THREE.DirectionalLight(0xFFFFFF, 0.3);
       light.position.set(1,3,3);
       this.scene.add(light);
        
		container.appendChild( this.renderer.domElement );
        
        this.initScene();
        this.initPhysics();

        this.tmpVec = new THREE.Vector3();
        this.tmpEuler = new THREE.Euler();
        this.tmpMat4 = new THREE.Matrix4();
        this.raycaster = new THREE.Raycaster();

        this.force = new THREE.Vector3();
        this.speed = 3;
        this.sfxInit = true;
        this.useHeadsetOrientation = false;

        if (debug){
            this.debugControls = new DebugControls(this );
        }

        this.setupVR();
        
        window.addEventListener('resize', this.resize.bind(this) );

        this.renderer.setAnimationLoop( this.render.bind(this) );
	}	

    startGame(){
        this.state = App.STATES.PLAYING;
        this.gameTime = 0;
        this.startTime = this.clock.elapsedTime;
        const panel = document.getElementById('openingPanel');
        panel.style.display = 'none';
        this.sfx.ball.play();
    }

    gameOver(options){
        if (options){
            const panel = document.getElementById('gameoverPanel');
            const details = document.getElementById('details');
            switch( options.state ){
                case App.STATES.DEAD:
                    details.innerHTML = `<P>You ran out of life ${this.player.position.distanceTo(this.grail.position).toFixed(0)} metres away from the Holy Grail</p>`
                    break;
                case App.STATES.COMPLETE:
                    const tm = this.clock.elapsedTime - this.startTime;
                    details.innerHTML = `<p>Congratulations</p><p>You found the grail in ${tm.toFixed(2)} seconds</p><p>Can you do better</p>`;
                    break;
            }
            panel.style.display = 'block';
        }
        try{
            this.renderer.xr.getSession().end();
        }catch(e){
            console.error(e);
        }
    }

    random( min, max ){
        return Math.random() * (max-min) + min;
    }
    
    initScene(){

		this.scene.background = new THREE.Color( 0x0a0a0a );
		this.scene.fog = new THREE.Fog( 0x0a0a0a, 50, 100 );

		// ground
		const ground = new THREE.Mesh( new THREE.PlaneGeometry( 100, 1000 ), new THREE.MeshPhongMaterial( { color: 0x998866, depthWrite: true } ) );
		ground.rotation.x = - Math.PI / 2;
		this.scene.add( ground );
        ground.position.z = -400;
        this.ground = ground;

        const listener = new THREE.AudioListener();
        this.camera.add( listener );

        this.sfx = {};
        this.sfx.ball = this.loadSound(ballSfx, listener, 0.1);

        let z = 40;
        const width = 12;
        const offset = new THREE.Vector3();
        const rock = new Rock();
        const tree = new Tree();

        while (z>-2000){
            const w = (Math.random()>0.5) ? width : -width;
            let x = Math.random() * 4;
            x = (w<0) ? w - x : w + x;
            z -= Math.random() * 10;
            const theta = Math.random()*Math.PI*2;
            const treeA = tree.clone();
            treeA.position.set(x, 0, z);
            treeA.rotateY(theta);
            treeA.scale.set(this.random(0.5, 2),this.random(0.5, 2),this.random(0.5, 2));
            this.scene.add(treeA);
            for(let i=0; i<6; i++){
                const rock1 = rock.clone();
                offset.set( this.random(0,6), 0, this.random(-3, 3));
                if (treeA.position.x<0) offset.x = -offset.x;
                rock1.position.copy(treeA.position).add(offset);
                rock1.rotation.set(this.random(0, Math.PI*2),this.random(0, Math.PI*2),this.random(0, Math.PI*2));
                rock1.scale.set(this.random(0.5, 2),this.random(0.5, 2),this.random(0.5, 2));
                this.scene.add(rock1);
            }
        }

        const rockface = new RockFace();
        const rockface2 = rockface.clone();

        rockface.rotateY(Math.PI/2);
        rockface.rotateX(-Math.PI/4);
        rockface.position.set(-width-15, 5, -200);
        this.scene.add(rockface);

        rockface2.rotateY(-Math.PI/2);
        rockface2.rotateX(-Math.PI/4);
        rockface2.position.set(width+15, 5, -200);
        this.scene.add(rockface2);
    } 
    
    loadSound( snd, listener, vol=0.5, loop=false ){
        // create a global audio source
        const sound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( snd, ( buffer ) => {  
            sound.setBuffer( buffer );
            sound.setLoop(loop);
            sound.setVolume(vol);
        });

        return sound;
    }

    createPlayer(){
        const player = new Player( this.scene, this.world );
        player.root.position.set( 0, 0.5, 10 );
        const body = new SPBody( player.root, new SPSphereCollider(0.8), 1 ); 
        body.mesh.userData.player = player;
        body.mesh.name = 'Player';
        player.app = this;
        this.knight = player;
        this.knight.body = body;
        this.world.addBody( body );
        player.startPosition.copy(player.root.position);
        player.game = this;
        this.follower = new THREE.Object3D();
        this.follower.position.set(0, 5, 8);
        body.mesh.add(this.follower);

        return body;
    }

    createEnemy(pos, z){
        const enemy = new Enemy( this.scene, z, this.world );
        enemy.root.position.copy( pos );
        const body = new SPBody( enemy.root, new SPSphereCollider(0.8), 1 ); 
        body.mesh.userData.enemy = enemy;
        body.mesh.name = 'Enemy';
        enemy.body = body;
        enemy.startPosition.copy(pos);
        enemy.orgZ = z;
        this.enemies.push(enemy);
        this.world.addBody( body );
        enemy.startPatrol();
        return enemy;
    }

    createWall(n, z, parts){
        const self = this;
        const pos = new THREE.Vector3(0,0,z);

        switch(n){
            case 1:
                createWall1();
                break;
            case 2:
                createWall2()
                break;
            case 3:
                createWall3()
                break;
        }

        pos.set(this.random( -7, 7), 0, z - this.random(3, 13) );
        this.collectables.push( new Heart(pos) );
        pos.set(this.random( -7, 7), 0, z - this.random(3, 13) );
        this.collectables.push( new Shield(pos) );

        function createWall1(){
            const positions = [-10, -6.75, -2.5, 2.5, 6.75, 10];
            const objects = ['tower2', 'wall3', 'tower3', 'tower3', 'wall3', 'tower2'];
            buildWall(positions, objects);
            const gate = new Gate( 1.5, 5 );
            pos.set( 0, 0, z);
            gate.body = createAABB(pos, gate);
            self.gates.push(gate);
        }

        function createWall2(){
            const positions = [-10, -7.75, -5, -0.5, 2, 5, 7.5, 10];
            const objects = ['tower2', 'wall1', 'tower3', 'tower3', 'wall2', 'tower1', 'wall2', 'tower2'];
            buildWall(positions, objects);
            const gate = new Gate( 1.375, 4.5 );
            pos.set( -2.75, 0, z);
            gate.body = createAABB(pos, gate);
            self.scene.add(gate);
            self.gates.push(gate);
        }

        function createWall3(){
            const positions = [-10, -7.5, -5, -2, 0.5, 5, 7.75, 10];
            const objects = ['tower2', 'wall2', 'tower1', 'wall2', 'tower3', 'tower3', 'wall1', 'tower2'];
            buildWall(positions, objects);
            const gate = new Gate( 1.375, 4.5 );
            pos.set( 2.75, 0, z );
            gate.body = createAABB(pos, gate);
            self.gates.push(gate);
        }

        function buildWall(positions, objects){
            const pos = new THREE.Vector3(0,0,z);
            for(let i=0; i<positions.length; i++){
                pos.x = positions[i];
                const part = parts[objects[i]].root.clone();
                createAABB(pos, part);
            }
            pos.set(-10, 0, z-10);
            let part = parts.wall4.root.clone();
            createAABB(pos, part);
            pos.x = 10;
            createAABB(pos, part.clone());
        }

        function createAABB(pos, tower){
            if (!tower) return;
    
            tower.position.copy(pos);
            
            self.scene.add(tower)
    
            const max = new THREE.Vector3( tower.userData.bounds.width, tower.userData.bounds.height, tower.userData.bounds.depth ).multiplyScalar(0.5);
            const min = max.clone().multiplyScalar(-1);

            const body = new SPBody( tower, new SPAABBCollider(min,  max)); 
    
            self.world.addBody( body );

            return body;
        }
    }

    initPhysics(){
        this.world = new SPWorld();
        const pos = new THREE.Vector3();

        const tower1 = new Tower(2,4,2);
        const tower2 = new Tower(2,5,2);
        const tower3 = new Tower(2,6,2);
        const wall1 = new Tower(3,3,0.2);
        const wall2 = new Tower(4,3,0.2);
        const wall3 = new Tower(7,3,0.2);
        const wall4 = new Tower(0.2,3,20);

        const castleParts = { tower1, tower2, tower3, wall1, wall2, wall3, wall4 };
        this.enemies = [];

        //this.createEnemy(pos.set(0), 0.5, -10);
        this.collectables = [];
        this.gates = [];

        for(let z=0; z>=-1000; z-=20){
            if (z==0){
                this.createWall(1, z, castleParts);
            }else{
                this.createWall(Math.floor(Math.random()*3)+1, z, castleParts);
            }
            if (Math.random()>0.3){
                this.createEnemy(pos.set(this.random(-8, 8), 0.5, z-10+this.random(-5, 5)), z-10);
            }
            if (z == -400){
                this.grail = new Grail(this.scene);
                this.grail.position.set(0,0,z-10);
                this.scene.add(this.grail);
                const max = new THREE.Vector3( 1.5, 3, 1.5 ).multiplyScalar(0.5);
                const min = max.clone().multiplyScalar(-1);

                const body = new SPBody( this.grail, new SPAABBCollider(min,  max)); 
    
                this.world.addBody( body );
            }
        }

        this.collectables.forEach( collectable => { this.scene.add(collectable) } );

        this.player = this.createPlayer();
        this.player.sfx = this.sfx.ball;
        this.player.onCollision = (type) => {
            const pos = this.player.position.clone();
            pos.y += 0.7;
            this.effect.reset( pos );
            this.knight.hit(0.05);
            if (type == 'Gate'){
                this.knight.rotateOnMove = false;
                this.knight.skipAttack = true;
                setTimeout( () => {
                    this.knight.rotateOnMove = true;
                    this.knight.skipAttack = false;
                }, 1000);
            }
            if (this.knight.life<=0){
                this.gameOver( { state: App.STATES.DEAD })
            }
        }
        this.fixedStep = 1/60;
        this.effect = new CollisionEffect(this.scene, false);
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }

    playAnim(name, stop=false){
        if (this.knight){
            if (stop){
                this.knight.stopAnims();
            }else{
                this.knight.playAnim(name);
            }
        }
    }

    resetGame(){
        this.dolly.position.z = 10;
        this.camera.position.set( 5.3, 10.5, 20 );
        this.camera.quaternion.set( -0.231, 0.126, 0.03, 0.964);
        this.camera.fov = 50;
        this.knight.reset();
        this.force.set(0,0,0);
        this.resize();

        this.enemies.forEach( enemy => enemy.reset() );
        this.collectables.forEach( collectable => collectable.visible = true );
        this.grail.reset();
        this.gates.forEach( gate => gate.reset() );
    }

    setupVR(){
        this.renderer.xr.enabled = true;
        
        const button = new VRButton( this.renderer );
        button.onClick = () => {
            this.sfx.ball.play();
        }
        
        function onSelectStart() {
            scope.knight.playAnim('drawaction');    
        }

        function onSelectEnd() {
            scope.knight.stopAnims();    
        }

       /* function onSqueezeStart() {
            //scope.knight.playAnim('switchaction');  
        }

        function onSqueezeEnd() {
            scope.knight.stopAnims();    
        }*/

        const scope = this;

        this.renderer.xr.addEventListener( 'sessionend', function ( event ) {
            scope.resetGame();
        } );

        this.renderer.xr.addEventListener( 'sessionstart', function ( event ) {
            scope.startGame();
        } );
        

        this.dolly = new THREE.Group();
        this.root = new THREE.Group();
        this.root.position.y = -3.4;
        this.dolly.add( this.root );

        this.controllers = [];

        for (let i=0; i<=1; i++){
            const controller = this.renderer.xr.getController( i );
            controller.addEventListener( 'selectstart', onSelectStart );
            controller.addEventListener( 'selectend', onSelectEnd );
            //controller.addEventListener( 'squeezestart', onSqueezeStart );
            //controller.addEventListener( 'squeezeend', onSqueezeEnd );
            controller.addEventListener( 'connected', ( event ) => {
                const mesh = this.buildController(event.data, i);
                mesh.scale.z = 0;
                controller.add( mesh );
                controller.gamepad = event.data.gamepad;
                controller.handedness = event.data.handedness;
                //console.log(`controller connected ${controller.handedness}`);
            } );
            
            controller.addEventListener( 'disconnected', function () {
                const grip = this.children[0];
                if (grip && grip.children && grip.children.length>0){
                    if (grip.children[0].isMesh) grip.children[0].geometry.dispose();
                    this.remove( grip );
                }
                scope.dolly.remove(this);
            } );

            this.root.add( controller );

            /*const grip = this.renderer.xr.getControllerGrip( i );
            grip.add( this.buildGrip( ) );
            controller.add( grip );*/

            this.controllers.push({controller});// grip});
        }
        
        this.dolly.position.set(0, 8, 10);
        this.dolly.add( this.camera );
        this.scene.add( this.dolly );
        
        this.dummyCam = new THREE.Object3D();
        this.camera.add( this.dummyCam );

    }
    
    /*buildGrip(){
        const geometry = new THREE.CylinderGeometry(0.02, 0.015, 0.12, 16, 1);
        geometry.rotateX( -Math.PI/2 );
        const material = new THREE.MeshStandardMaterial( { color: 0xdddddd, roughness: 1 } );
        return new THREE.Mesh(geometry, material);
    }*/

    buildController( data ) {
        let geometry, material;
        
        switch ( data.targetRayMode ) {
            
            case 'tracked-pointer':

                geometry = new THREE.BufferGeometry();
                geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
                geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

                material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );

                return new THREE.Line( geometry, material );

            case 'gaze':

                geometry = new THREE.RingBufferGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
                material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
                return new THREE.Mesh( geometry, material );

        }

    }
    
    handleController( controller, dt ){
        if (controller.handedness == 'right'){
            this.force.set( controller.gamepad.axes[2], 0, controller.gamepad.axes[3] );
            //console.log(`handleController: ${controller.gamepad.axes[2].toFixed(2)},  ${controller.gamepad.axes[3].toFixed(2)}`);
        }else if (controller.handedness == 'left'){
            this.knight.rotateStrength = -controller.gamepad.axes[2];
        }
    }

	render( time, frame ) {  
        const dt = this.clock.getDelta();

        if (this.world){
            this.player.velocity.add( this.force.clone().multiplyScalar(dt * this.speed) );

            this.world.step(this.fixedStep);
        }

        if (this.renderer.xr.isPresenting){
            this.gameTime += dt;

            if (this.debugControls==undefined){
                if (this.useHeadsetOrientation){
                    this.tmpMat4.extractRotation( this.dummyCam.matrixWorld );
                    this.tmpEuler.setFromRotationMatrix(this.tmpMat4);
                    this.force.set(-this.tmpEuler.z, 0, this.tmpEuler.x);
                }else{
                    this.controllers.forEach( (obj) => this.handleController(obj.controller));
                }
            }
            //this.dolly.position.z = this.player.position.z + 10;
            this.follower.getWorldPosition(this.tmpVec);
            this.dolly.position.lerp(this.tmpVec, 0.1);
            
            if ( this.enemies ){
                this.knight.underAttack = false;
                this.enemies.forEach( enemy => {
                    if (enemy.state == Enemy.STATES.DEAD){
                        enemy.update(dt);
                        return;
                    }
                    if (enemy.state == Enemy.STATES.HONE){
                        enemy.body.velocity.copy(enemy.root.position).sub(this.knight.root.position).normalize().multiplyScalar(this.speed*0.7).negate();
                    }
                    enemy.update(dt, enemy.body.velocity);
                    const dist = enemy.root.position.distanceTo(this.knight.root.position);
                    if (dist<2){
                        if (enemy.state != Enemy.STATES.ATTACK){
                            enemy.startAttack(this);
                        }else{
                            this.tmpVec.copy(this.player.position).sub(enemy.body.position);
                            enemy.setDirection(this.tmpVec);
                            this.knight.underAttack = true;
                        }
                    }else if (dist<10){
                        enemy.startHone(this);
                    }else if (enemy.state != Enemy.STATES.PATROL){
                        enemy.startPatrol();
                    }
                })
            }
        }else{
            if ( this.enemies ){
                this.enemies.forEach( enemy => {
                    enemy.update(dt, enemy.body.velocity);
                })
            }
        }

        if (this.knight) this.knight.update(dt, this.player.velocity, this.dummyCam);

        if ( this.effect && this.effect.visible ) this.effect.update(time, dt);

        if (this.collectables){
            this.tmpVec.copy(this.player.position);
            this.tmpVec.y -= 0.8;
            //let closest = 100000;
            this.collectables.forEach( collectable => {
                if (!collectable.visible) return;
                collectable.rotateY(0.01);
                const dist = collectable.position.distanceTo(this.tmpVec);
                //if (dist < closest) closest = dist;
                if (dist<0.5){
                    if (collectable instanceof Shield){
                        this.knight.makeInvincible(10);
                    }else if (collectable instanceof Heart){
                        this.knight.hit(-1);
                    }
                    collectable.visible = false;
                }
            });
            //console.log(`Closest collectable is ${closest.toFixed(2)} away`);
        }
    
        if (this.gates){
            this.gates.forEach( gate => gate.update(dt) );
        }

        if (this.grail){
            const dist = this.player.position.distanceTo(this.grail.position);
            //console.log('Distance to grail:' + dist.toFixed(2));
            if (dist<2){
                this.grail.find(this);
            }
            this.grail.update(time, dt);
        }
       
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };

window.app = new App();  