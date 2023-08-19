import { Knight } from "./Knight.js";
import { LifeUI } from "./LifeUI.js";

class Player extends Knight{
    constructor(scene){
        const colours = [ 15991041, 16373422, 0xC7C7C7, 16777215, 12615993, 16777215, 6458346, 16774938 ];

        super(scene, colours);

        this.tmpVec = new THREE.Vector3();
        this.lifeUI = new LifeUI(this.root, new THREE.Vector3(0, 2.6, 0));
    }

    update(dt, v, cam){
        super.update(dt, v);
        if (this.lifeUI.visible){
            cam.getWorldPosition(this.tmpVec)
            this.lifeUI.lookAt(this.tmpVec);
        }
    }
}

export { Player };