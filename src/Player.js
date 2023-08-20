import { Knight } from "./Knight.js";
import { LifeUI } from "./LifeUI.js";
import { SPBody } from "./SimplePhysics/SPBody.js";
import { SPSphereCollider } from "./SimplePhysics/SPCollider.js";

class Player extends Knight{
    constructor(scene, world){
        const colours = [ 15991041, 16373422, 0xC7C7C7, 16777215, 12615993, 16777215, 6458346, 16774938 ];

        super(scene, colours);

        this.tmpVec = new THREE.Vector3();
        this.lifeUI = new LifeUI(this.root, new THREE.Vector3(0, 2.6, 0));
        this.lifeUI.visible = false;

        this.world = world;
    }

    hit(amount=0.05){
        this.lifeDisplayTime = 0;
        this.life -= amount;
        this.lifeUI.showLife(this.life);
        this.lifeUI.visible = true;
    }

    update(dt, v, cam){
        super.update(dt, v);
        if (this.lifeUI.visible){
            this.lifeDisplayTime += dt;
            if (this.lifeDisplayTime>1) this.lifeUI.visible = false;
            cam.getWorldPosition(this.tmpVec)
            this.lifeUI.lookAt(this.tmpVec);
        }
        if (this.attacking && this.world){
            this.bladeEnd.getWorldPosition(this.tmpVec);
            const intersects = this.world.getPointCollisions(this.tmpVec, this.body, 0.3);
            //console.log( 'checking intersects');
            if (intersects.length>0){
                const body = intersects[0];
                const obj = body.mesh;
                console.log( `Player Sword hit ${obj.name}`);
                switch( obj.name ){
                    case 'Gate':
                        if (obj.hit()){
                            body.active = false;
                        };
                        break;
                    case 'Enemy':
                        obj.hit();
                        break;
                }
            }
        }
    }
}

export { Player };