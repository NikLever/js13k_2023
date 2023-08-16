class DebugControls{
    constructor(app){
        document.addEventListener('keydown', (event) => {
            if (event.repeat) return;

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
                case 'KeyS':
                    if (app.playAnim) app.playAnim('drawaction');
                    break;
                case 'KeyT':
                    if (app.playAnim) app.playAnim('switchaction');
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