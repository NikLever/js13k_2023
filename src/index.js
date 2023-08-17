import { Shield } from './Models.js';
import { OrbitControls } from './OrbitControls.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 200 );
		this.camera.position.set( 0, 1.6, 5 );
        
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
        
        this.raycaster = new THREE.Raycaster();
        this.workingMatrix = new THREE.Matrix4();
        this.workingVector = new THREE.Vector3();
        this.workingQuat = new THREE.Quaternion();
        this.origin = new THREE.Vector3();
        
        this.initScene();

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.target.y = 1;
        controls.update();

        window.addEventListener('resize', this.resize.bind(this) );
        
        document.addEventListener('keydown', (event) => {
            if (event.repeat) return;
            console.log(`keydown ${event.code}`);
            switch(event.code){
                case 'KeyO':
                    //this.coffin.animate();
                    break;
            }
          }, false);

        this.renderer.setAnimationLoop( this.render.bind(this) );
	}	
    
    initScene(){
        //this.gate = new Gate(1, 4);
        //this.scene.add(this.gate);
        //this.gate.openGate();
        const geometry = new THREE.SphereGeometry(0.7, 16, 8);
        const material = new THREE.MeshBasicMaterial({color:0xFFFFFF, wireframe: true});
        const mesh = new THREE.Mesh( geometry, material );
        mesh.position.y = 0.7;
        this.scene.add(mesh);
        this.shield = new Shield();
        this.scene.add(this.shield);
    } 
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {  
        const dt = this.clock.getDelta();
        if (this.shield){
            this.shield.rotateY(0.01);
        }
        this.renderer.render( this.scene, this.camera );
    }
}

window.app = new App();  