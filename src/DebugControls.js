class DebugControls{
    constructor(app){
        document.addEventListener('keydown', (event) => {
            if (event.repeat) return;
            let panel;

            switch(event.code){
                case 'ArrowUp':
                    app.force.z = -1;
                    break;
                case 'ArrowDown':
                    app.force.z = 1;
                    break;
                case 'ArrowLeft':
                    app.force.x = -1;
                    break;
                case 'ArrowRight':
                    app.force.x = 1;
                    break;
                case 'KeyA':
                    app.knight.rotateStrength = 1;
                    break;
                case 'KeyD':
                    app.knight.rotateStrength = -1;
                    break;  
                case 'KeyP':
                    panel = document.getElementById('openingPanel');
                    if (panel.style.display=='none'){
                        panel.style.display = 'block';
                    }else{
                        panel.style.display = 'none';
                    }
                    break;
                case 'KeyR':
                    app.enemies[0].respawn();
                    break;
                case 'KeyK':
                    app.enemies[0].kill();
                    break;
                case 'KeyG':
                    panel = document.getElementById('gameoverPanel');
                    const details = document.getElementById('details');
                    details.innerHTML = "These are the details";
                    if (panel.style.display=='none'){
                        panel.style.display = 'block';
                    }else{
                        panel.style.display = 'none';
                    }
                    break;
                case 'KeyS':
                    if (app.playAnim) app.playAnim('drawaction');
                    break;
                case 'KeyQ':
                    app.renderer.xr.getSession().end();
                    break;
            }
        }, false);
        
        document.addEventListener('keyup', (event) => {
            switch(event.code){
                case 'ArrowUp':
                    app.force.z = 0;
                    break;
                case 'ArrowDown':
                    app.force.z = 0;
                    break;
                case 'ArrowLeft':
                    app.force.x = 0;
                    break;
                case 'ArrowRight':
                    app.force.x = 0;
                    break;
                case 'KeyA':
                case 'KeyD':
                    app.knight.rotateStrength = 0;
                    app.knight.rotateOnMove = true;
                    break;  
                case 'KeyS':
                    if (app.playAnim) app.playAnim('drawaction', true);
                    break;
                case 'KeyT':
                    if (app.playAnim) app.playAnim('switchaction', true);
                    break;
            }
          }, false);
    }
}

export { DebugControls };