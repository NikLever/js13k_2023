class KeyboardControls{
    constructor(){
        this.move = new THREE.Vector3();
        document.addEventListener('keydown', (event) => {
            if (event.repeat) return;

            switch(event.code){
                case 'ArrowUp':
                    this.move.z = -1;
                    break;
                case 'ArrowDown':
                    this.move.z = 1;
                    break;
                case 'ArrowLeft':
                    this.move.x = -1;
                    break;
                case 'ArrowRight':
                    this.move.x = 1;
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
          }, false);
        
        //this.state = 'initialising';
        //const btn = document.getElementById('startBtn');
        //btn.addEventListener('click', this.startGame.bind(this));
    }
}