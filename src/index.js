import { SPWorld } from './SimplePhysics/SPWorld.js';
import { SPBody } from './SimplePhysics/SPBody.js';
import { SPSphereCollider, SPPlaneCollider, SPAABBCollider } from './SimplePhysics/SPCollider.js';
import { BasicUI } from './BasicUI.js';
import { VRButton } from './VRButton.js';
import { CollisionEffect } from './CollisionEffect.js';
import { Tween } from './Tween.js';
import { Tree, Rock, RockFace, Tower } from './Models.js';
import { Knight } from './Knight.js';
import { DebugControls } from './DebugControls.js';
import ballSfx from "../assets/ball1.mp3";

class App{
	constructor(){
        const debug = false;

		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 200 );
        this.createUI();

		this.camera.position.set( 5.3, 10.5, 20 );
        this.camera.quaternion.set( -0.231, 0.126, 0.03, 0.964);
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x050505 );

		this.scene.add( new THREE.HemisphereLight( 0xffffff, 0x404040, 0.15 ) );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        
		container.appendChild( this.renderer.domElement );

        this.tweens = [];
        
        this.initScene();
        this.initPhysics();

        this.tmpVec = new THREE.Vector3();
        this.tmpEuler = new THREE.Euler();
        this.tmpMat4 = new THREE.Matrix4();

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
        this.state = 'game';
        //this.sfx.click.play();
    }

    random( min, max ){
        return Math.random() * (max-min) + min;
    }
    
    initScene(){

		this.scene.background = new THREE.Color( 0x0a0a0a );
		this.scene.fog = new THREE.Fog( 0x0a0a0a, 50, 100 );

		// ground
		const ground = new THREE.Mesh( new THREE.PlaneGeometry( 100, 1000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: true } ) );
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
        const maxTreeType = 2;
        const offset = new THREE.Vector3();
        const rock = new Rock();
        const tree1 = new Tree(0);
        const tree2 = new Tree(1);
        const trees = [tree1, tree2];

        while (z>-2000){
            const w = (Math.random()>0.5) ? width : -width;
            let x = Math.random() * 4;
            x = (w<0) ? w - x : w + x;
            z -= Math.random() * 10;
            const theta = Math.random()*Math.PI*2;
            const type = Math.floor(Math.random() * maxTreeType);
            const tree = trees[type].clone();
            tree.position.set(x, 0, z);
            tree.rotateY(theta);
            this.scene.add(tree);
            for(let i=0; i<6; i++){
                const rock1 = rock.clone();
                offset.set( Math.random()*6, 0, (Math.random()-0.5)*6);
                if (tree.position.x<0) offset.x = -offset.x;
                rock1.position.copy(tree.position).add(offset);
                rock1.rotateY(Math.random()*6);
                rock1.scale.set(Math.random()*2+1, Math.random()*2+1, Math.random()*2+1);
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

    createUI(){
        this.scoreUI = new BasicUI(this.camera, new THREE.Vector3(1, 1.1, -4.5));
        this.scoreUI.style.fontColor = 'white';
        this.scoreUI.showText( 10, 30, '00000');
        this.scoreUI.showText( 120, 30, '00:00', false);
        this.livesUI = new BasicUI(this.camera, new THREE.Vector3(-1, 1.1, -4.5));
        this.livesUI.showLives(5);
        this.scoreUI.visible = false;
        this.livesUI.visible = false;
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

    createBall(){
        const geometry = new THREE.SphereGeometry( 0.5, 20, 12 );
        const material = new THREE.MeshPhongMaterial( { color: 0xFF0000 });
        const ball = new THREE.Mesh( geometry, material );
        ball.position.set( 2.1, 0.5, 0 );
        this.scene.add( ball );
        const body = new SPBody( ball, new SPSphereCollider(0.5), 1 ); 
        this.world.addBody( body );
        return body;
    }

    createPlayer(){
        const player = new Knight( this.scene );
        player.root.position.set( 0, 0.5, 10 );
        const body = new SPBody( player.root, new SPSphereCollider(0.5), 1 ); 
        body.mesh.userData.knight = player;
        this.knight = player;
        this.world.addBody( body );
        return body;
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

        function createWall1(){
            const positions = [-10, -6, -2, 2, 6, 10];
            const objects = ['tower2', 'wall3', 'tower3', 'tower3', 'wall3', 'tower2'];
            buildWall(positions, objects);
        }

        function createWall2(){
            const positions = [-10, -8, -6, -2, 1, 4, 7, 10];
            const objects = ['tower2', 'wall1', 'tower3', 'tower3', 'wall2', 'tower1', 'wall2', 'tower2'];
            buildWall(positions, objects);
        }

        function createWall3(){
            const positions = [-10, -7, -4, -1, 2, 6, 8, 10];
            const objects = ['tower2', 'wall2', 'tower1', 'wall2', 'tower3', 'tower3', 'wall1', 'tower2'];
            buildWall(positions, objects);
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
        }
    }

    initPhysics(){
        this.world = new SPWorld();
        const pos = new THREE.Vector3();

        const tower1 = new Tower(1,3,1);
        const tower2 = new Tower(1,3.5,1);
        const tower3 = new Tower(1,4,1);
        const wall1 = new Tower(3,2,0.2);
        const wall2 = new Tower(5,2,0.2);
        const wall3 = new Tower(7,2,0.2);
        const wall4 = new Tower(0.2,2,20);

        const castleParts = { tower1, tower2, tower3, wall1, wall2, wall3, wall4 };

        for(let z=0; z>=-1000; z-=20){
            if (z==0){
                this.createWall(1, z, castleParts);
            }else{
                this.createWall(Math.floor(Math.random()*3)+1, z, castleParts);
            }
        }

        this.player = this.createPlayer();
        this.player.sfx = this.sfx.ball;
        this.player.onCollision = () => {
            this.effect.reset( this.player.position );
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

        function onSqueezeStart() {
            scope.knight.playAnim('switchaction');  
        }

        function onSqueezeEnd() {
            scope.knight.stopAnims();    
        }

        const scope = this;

        this.renderer.xr.addEventListener( 'sessionend', function ( event ) {
            scope.dolly.position.z = 10;
            scope.camera.position.set( 5.3, 10.5, 20 );
            scope.camera.quaternion.set( -0.231, 0.126, 0.03, 0.964);
            scope.camera.fov = 50;
            scope.player.position.set( 0, 0.5, 10);
            scope.player.velocity.set(0,0,0);
            scope.force.set(0,0,0);
            scope.resize();
            scope.scoreUI.visible = false;
            scope.livesUI.visible = false;
        } );

        this.renderer.xr.addEventListener( 'sessionstart', function ( event ) {
            scope.state = 'game';
            scope.startTime = scope.clock.elapsedTime;
            scope.timerInterval = setInterval( scope.updateTime.bind(scope), 1000 );
            scope.lives = 5;
            scope.livesUI.showLives( scope.lives );
            
            scope.scoreUI.visible = true;
            scope.livesUI.visible = true;
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
            controller.addEventListener( 'squeezestart', onSqueezeStart );
            controller.addEventListener( 'squeezeend', onSqueezeEnd );
            controller.addEventListener( 'connected', ( event ) => {
                const mesh = this.buildController(event.data, i);
                mesh.scale.z = 0;
                controller.add( mesh );
                controller.gamepad = event.data.gamepad;
                controller.handedness = event.data.handedness;
                console.log(`controller connected ${controller.handedness}`);
            } );
            
            controller.addEventListener( 'disconnected', function () {
                const grip = this.children[0];
                if (grip && grip.children && grip.children.length>0){
                    if (grip.children[0].isMesh) grip.children[0].geometry.dispose();
                    this.remove( grip );
                }
                scope.dolly.remove(this);
                //this.remove( this.children[ 0 ] );
            } );

            this.root.add( controller );

            const grip = this.renderer.xr.getControllerGrip( i );
            grip.add( this.buildGrip( ) );
            controller.add( grip );

            this.controllers.push({controller, grip});
        }
        
        this.dolly.position.set(0, 5, 10);
        this.dolly.add( this.camera );
        this.scene.add( this.dolly );
        this.camera.remove( this.scoreUI.mesh );
        this.scoreUI.mesh.position.set(1, 2.1, -2.5 );
        this.camera.remove( this.livesUI.mesh );
        this.livesUI.mesh.position.set(-1, 2.1, -2.5 );
        this.dolly.attach( this.scoreUI.mesh );
        this.dolly.attach( this.livesUI.mesh )
        
        this.dummyCam = new THREE.Object3D();
        this.camera.add( this.dummyCam );

    }

    updateTime(){
        const tm = 100 - Math.floor(this.clock.elapsedTime - this.startTime);
        if (tm<0){
            this.renderer.xr.getSession().end();
            clearInterval(this.timerInterval);
            return;
        }
        const mins = Math.floor(tm/60);
        const secs = tm - mins*60;
        let minsStr = String(mins);
        while (minsStr.length<2) minsStr = '0' + minsStr;
        let secsStr = String(secs);
        while (secsStr.length<2) secsStr = '0' + secsStr;
        const str = minsStr + ':' + secsStr;
        this.scoreUI.clear( { x:120, w:136 } );
        this.scoreUI.showText( 120, 30, str, false);
    }
    
    buildGrip(){
        const geometry = new THREE.CylinderGeometry(0.02, 0.015, 0.12, 16, 1);
        geometry.rotateX( -Math.PI/2 );
        const material = new THREE.MeshStandardMaterial( { color: 0xdddddd, roughness: 1 } );
        return new THREE.Mesh(geometry, material);
    }

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
            console.log(`handleController: ${controller.gamepad.axes[2].toFixed(2)},  ${controller.gamepad.axes[3].toFixed(2)}`);
        }
    }

	render( time ) {  
        const dt = this.clock.getDelta();
        if (this.world){
            this.player.velocity.add( this.force.clone().multiplyScalar(dt * this.speed) );

            this.world.step(this.fixedStep);
        }

        if (this.renderer.xr.isPresenting){
            if (this.debugControls==undefined){
                if (this.useHeadsetOrientation){
                    this.tmpMat4.extractRotation( this.dummyCam.matrixWorld );
                    this.tmpEuler.setFromRotationMatrix(this.tmpMat4);
                    this.force.set(-this.tmpEuler.z, 0, this.tmpEuler.x);
                }else{
                    this.controllers.forEach( (obj) => this.handleController(obj.controller));
                }
            }
            this.dolly.position.z = this.player.position.z + 10;
            
        }

        if (this.knight) this.knight.update(dt, this.player.velocity);

        if ( this.effect && this.effect.visible ) this.effect.update(time, dt);
        if ( this.tweens && this.tweens.length > 0){
            this.tweens.forEach( tween => tween.update(dt) );
        }
       
        this.renderer.render( this.scene, this.camera );
    }
}

window.app = new App();  