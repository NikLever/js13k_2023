import { SPWorld } from './SimplePhysics/SPWorld.js';
import { SPBody } from './SimplePhysics/SPBody.js';
import { SPSphereCollider, SPPlaneCollider, SPAABBCollider } from './SimplePhysics/SPCollider.js';
import { BasicUI } from './BasicUI.js';
import { VRButton } from './VRButton.js';
//import { JoyStick } from './JoyStick.js';
import { CollisionEffect } from './CollisionEffect.js';
import { Tween } from './Tween.js';
import { Tree, Rock, RockFace } from './Models.js';
import ballSfx from "../assets/ball1.mp3";

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 200 );
        this.createUI();

		this.camera.position.set( 5.3, 10.5, 20 );
        this.camera.quaternion.set( -0.231, 0.126, 0.03, 0.964);
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x505050 );

		this.scene.add( new THREE.HemisphereLight( 0xffffff, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
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

        /*this.joystick = new JoyStick({ onMove: (up, right) => {
            this.force.set(right, 0, -up);
            if (this.sfxInit){
                this.sfx.ball.stop();
                this.sfx.ball.play();
                this.sfxInit = false;
            }
        }});*/
        this.setupVR();
        
        window.addEventListener('resize', this.resize.bind(this) );

        /*document.addEventListener('keydown', (event) => {
            const name = event.key;
            const code = event.code;
            //console.log(`Key pressed ${name} \r\n Key code value: ${code}`);
            switch(event.code){
                case 'ArrowUp':
                    this.ball.position.y -= 0.1;
                    break;
                case 'ArrowDown':
                    this.ball.position.y += 0.1;
                    break;
                case 'ArrowLeft':
                    this.ball.position.x -= 0.1;
                    break;
                case 'ArrowRight':
                    this.ball.position.x += 0.1;
                    break;
                case 'KeyI':
                    this.ball.position.z -= 0.1;
                    break;
                case 'KeyO':
                    this.ball.position.z += 0.1;
                    break;
                case 'KeyS':
                    if (this.world) this.world.step(this.fixedStep);
                    break;
                case 'KeyC':
                    console.log('Camera pos: ', this.camera.position, " quat:", this.camera.quaternion);
                    break;
            }
            this.ball.mesh.position.copy(this.ball.position);
          }, false);*/
        
        //this.state = 'initialising';
        //const btn = document.getElementById('startBtn');
        //btn.addEventListener('click', this.startGame.bind(this));

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

		this.scene.background = new THREE.Color( 0xa0a0a0 );
		this.scene.fog = new THREE.Fog( 0xa0a0a0, 50, 100 );

		// ground
		const ground = new THREE.Mesh( new THREE.PlaneGeometry( 200, 200 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: true } ) );
		ground.rotation.x = - Math.PI / 2;
		this.scene.add( ground );
        this.ground = ground;

		const grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
		grid.material.opacity = 0.2;
		grid.material.transparent = true;
		this.scene.add( grid );

        //this.createDot();

        const listener = new THREE.AudioListener();
        this.camera.add( listener );

        this.sfx = {};
        //this.sfx.click = this.loadSound(clickSfx, listener);
        this.sfx.ball = this.loadSound(ballSfx, listener, 0.1);

        let z = 40;
        const width = 9;
        const maxTreeType = 2;
        const offset = new THREE.Vector3();
        const rock = new Rock();

        while (z>-2000){
            const w = (Math.random()>0.5) ? width : -width;
            let x = Math.random() * 4;
            x = (w<0) ? w - x : w + x;
            z -= Math.random() * 10;
            const theta = Math.random()*Math.PI*2;
            const type = Math.floor(Math.random() * maxTreeType);
            const tree = new Tree(type);
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

        //this.createUI();
    } 

    /*createUI(){
        //clipPath created using https://yqnn.github.io/svg-path-editor/
        const config = {
            body: { clipPath: "M 258.3888 5.4432 C 126.9744 5.4432 20.4432 81.8424 20.4432 164.4624 C 20.4432 229.1976 86.3448 284.2128 178.1016 304.8192 C 183.5448 357.696 173.2416 444.204 146.8032 476.6688 C 186.6552 431.9568 229.2288 356.5296 244.7808 313.3728 C 249.252 313.3728 253.9176 313.7616 258.3888 313.7616 C 389.8032 313.7616 496.14 246.888 496.14 164.4624 S 389.8032 5.4432 258.3888 5.4432 Z", backgroundColor: "#ddd", fontColor: "#000", fontFamily: "Gochi Hand" },
            speech: { type: "text", position: { left: 50, top: 80 }, fontSize: 45, fontColor: "#000", width: 400, height: 250 },
            opacity: 1
        }
        const speech = "A custom shaped panel. How about that?";
        const content = {
            speech
        }
        const ui = new CanvasUI( content, config );
        ui.mesh.position.set( 0, 1.5, 2 );
        this.scene.add( this.camera );
        this.camera.attach( ui.mesh );
        
        this.ui = ui;
    }*/

    createUI(){
        this.scoreUI = new BasicUI(this.camera, new THREE.Vector3(2.5, 1.5, -3.25));
        this.scoreUI.style.fontColor = 'white';
        this.scoreUI.showText( 10, 30, '00000');
        this.scoreUI.showText( 120, 30, '00:00', false);
        this.livesUI = new BasicUI(this.camera, new THREE.Vector3(-2.0, 1.5, -3.25));
        this.livesUI.showLives(5);
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

    /*createDot(){
        const geometry = new THREE.SphereGeometry( 0.1 );
        const material = new THREE.MeshPhongMaterial( { color: 0x0000FF, depthTest: true });
        const dot = new THREE.Mesh( geometry, material );
        this.scene.add( dot );
        this.dot = dot;
    }*/

    createAABB(pos){
        const width = 3;
        const height = 1;
        const depth = 3;
        const geometry = new THREE.BoxGeometry( width, height, depth );
        const material = new THREE.MeshPhongMaterial( { color: 0x00FF00 });
        const edges = new THREE.EdgesGeometry( geometry );
        const lines = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } ) );

        const box = new THREE.Mesh( geometry, material );
        box.position.set( 0, height/2, 0 ).add(pos);
        lines.position.copy( box.position );
        this.scene.add( box );
        this.scene.add( lines );

        const body = new SPBody( box, new SPAABBCollider(new THREE.Vector3(-width/2, -height/2, -depth/2), 
                                        new THREE.Vector3(width/2, height/2, depth/2) )); 
        body.edges = lines;

        this.world.addBody( body );
        return body;
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

    initPhysics(){
        this.world = new SPWorld();
        const pos = new THREE.Vector3();
        this.aabb = this.createAABB(pos);

        this.tweens.push(new Tween(this.aabb.mesh.scale, 'x', 0, 2.0, onComplete.bind(this)));
        this.tweens.push(new Tween(this.aabb.edges.scale, 'x', 0, 2.0, onComplete.bind(this)));

        function onComplete(tween){
            const index = this.tweens.indexOf(tween);
            if (index >= 0) this.tweens.splice(index, 1);
            this.aabb.mesh.visible = false;
            this.aabb.edges.visible = false;
            this.aabb.active = false;
        }

        for(let x=-5; x<=5; x+=5){
            for(let z=-5; z<=5; z+=5){
                if (x==0 && z==0) continue;
                pos.set(x, 0, z);
                this.createAABB(pos);
            }
        }
        this.ball = this.createBall();
        this.ball.sfx = this.sfx.ball;
        this.ball.onCollision = () => {
            this.effect.reset( this.ball.position );
        }
        this.fixedStep = 1/60;
        this.effect = new CollisionEffect(this.scene, false);
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
    /*positionDot(){
        const pt = this.aabb.collider.closestPoint( this.ball.position, this.aabb.position );
        if (pt){
            this.dot.position.copy(pt);
            this.dot.visible = true;
        }else{
            this.dot.visible = false;
        }
        const normal = pt.clone().sub(this.ball.position);
        if (normal.length()<this.ball.collider.radius){
            normal.normalize().negate().multiplyScalar(this.ball.collider.radius);
            this.ball.position = pt.clone().add(normal);
        }
    }*/

    setupVR(){
        this.renderer.xr.enabled = true;
        
        const button = new VRButton( this.renderer );
        button.onClick = () => {
            this.sfx.ball.play();
        }
        
        /*function onSelectStart() {
            
            this.userData.selectPressed = true;
        }

        function onSelectEnd() {

            this.userData.selectPressed = false;
            
        }

        function onSqueezeStart() {
            
            this.userData.squeezePressed = true;
        }

        function onSqueezeEnd() {

            this.userData.squeezePressed = false;
            
        }*/

        const scope = this;

        this.renderer.xr.addEventListener( 'sessionend', function ( event ) {
            scope.dolly.position.z = 10;
            scope.camera.position.set( 5.3, 10.5, 20 );
            scope.camera.quaternion.set( -0.231, 0.126, 0.03, 0.964);
            scope.camera.fov = 50;
            scope.ball.position.set( 2.1, 0.5, 0);
            scope.ball.velocity.set(0,0,0);
            scope.force.set(0,0,0);
            scope.resize();
        } );

        this.renderer.xr.addEventListener( 'sessionstart', function ( event ) {
            scope.state = 'game';
            scope.startTime = scope.clock.elapsedTime;
            scope.timerInterval = setInterval( scope.updateTime.bind(scope), 1000 );
        } );
        

        this.dolly = new THREE.Object3D();

        this.controllers = [];

        for (let i=0; i<=1; i++){
            const controller = this.renderer.xr.getController( i );
            //controller.addEventListener( 'selectstart', onSelectStart );
            //controller.addEventListener( 'selectend', onSelectEnd );
            //controller.addEventListener( 'squeezestart', onSqueezeStart );
            //controller.addEventListener( 'squeezeend', onSqueezeEnd );
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

            this.dolly.add( controller );

            const grip = this.renderer.xr.getControllerGrip( i );
            grip.add( this.buildGrip( ) );
            controller.add( grip );

            this.controllers.push({controller, grip});
        }
        
        this.dolly.position.set(0, 5, 10);
        this.dolly.add( this.camera );
        this.scene.add( this.dolly );
        
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
            this.ball.velocity.add( this.force.clone().multiplyScalar(dt * this.speed) );
            this.world.step(this.fixedStep);
        }

        if (this.renderer.xr.isPresenting){
            if (this.useHeadsetOrientation){
                this.tmpMat4.extractRotation( this.dummyCam.matrixWorld );
                this.tmpEuler.setFromRotationMatrix(this.tmpMat4);
                this.force.set(-this.tmpEuler.z, 0, this.tmpEuler.x);
            }else{
                this.controllers.forEach( (obj) => this.handleController(obj.controller));
            }
            this.dolly.position.z = this.ball.position.z + 10;
            
        }

        if ( this.effect && this.effect.visible ) this.effect.update(time, dt);
        if ( this.tweens && this.tweens.length > 0){
            this.tweens.forEach( tween => tween.update(dt) );
        }
       
        this.renderer.render( this.scene, this.camera );
    }
}

window.app = new App();  