import { Knight } from "./Knight.js";
import { LifeUI } from "./LifeUI.js";
import { ForceField } from "./ForceField.js";
import { SPBody } from "./SimplePhysics/SPBody.js";
import { SPSphereCollider } from "./SimplePhysics/SPCollider.js";
import { App } from './index.js';

class Player extends Knight{
    constructor(scene, world){
        const colours = [ 15991041, 16373422, 0xC7C7C7, 16777215, 12615993, 16777215, 6458346, 16774938 ];

        super(scene, colours);

        this.tmpVec = new THREE.Vector3();
        this.lifeUI = new LifeUI(this.root, new THREE.Vector3(0, 2.6, 0), 64);
        this.lifeUI.visible = false;

        this.world = world;

        this.forceField = new ForceField();
        this.root.add(this.forceField);
        this.invincibleDuration = 0;

        this.rotateStrength = 0;

        //this.sword.scale.y = 0.2;
    }

    rotate(dir){
        this.model.rotateY(dir * 0.1);
        this.rotateOnMove = false;
    }

    reset(){
        this.root.position.copy(this.startPosition);
        this.body.position.copy(this.startPosition);
        this.body.velocity.set(0,0,0);
        this.life = 1;
        this.forceField.visible = false;
        this.sword.scale.y = 1;
        this.sword.visible = true;
    }

    hit(amount=0.05){
        if (this.forceField.visible) return;
        this.lifeDisplayTime = 0;
        this.life -= amount;
        this.lifeUI.showLife(this.life);
        this.lifeUI.visible = true;
        if (this.app && this.life<=0) this.app.gameOver( { state: App.STATES.DEAD });
    }

    makeInvincible(time){
        this.invincibleTime = 0;
        this.invincibleDuration += time;
        this.forceField.visible = true;
    }

    set underAttack( val ){
        if (this.skipAttack) return;
        this.rotateOnMove = !val;
    }

    update(dt, v, cam){
        super.update(dt, v);

        //console.log('rotateOnMove = ' + this.rotateOnMove);

        if (this.forceField.visible){
            this.invincibleTime += dt;
            if (this.invincibleTime>this.invincibleDuration){
                this.invincibleDuration = 0;
                this.forceField.visible = false;
            }
        }

        if (Math.abs(this.rotateStrength)>0.1){
            this.rotate(this.rotateStrength);
            this.rotateStrength *= 0.8;
        }else{
            this.rotateStrength = 0;
        }

        if (this.lifeUI.visible){
            this.lifeDisplayTime += dt;
            if (this.lifeDisplayTime>1) this.lifeUI.visible = false;
            cam.getWorldPosition(this.tmpVec)
            this.lifeUI.lookAt(this.tmpVec);
        }
        if (this.forceField.visible){
            this.forceField.update(dt);
        }
        if (this.attacking && this.world){
            this.bladeEnd.getWorldPosition(this.tmpVec);
            const intersects = this.world.getPointCollisions(this.tmpVec, this.body, 0.8);
            //console.log( 'checking intersects');
            if (intersects.length>0){
                const body = intersects[0];
                const obj = body.mesh;
                const bodies = intersects.filter( intersect => intersect.mesh.name == 'Enemy' );
                //console.log( `Player Sword hit ${obj.name} ${bodies.length}`);
                if (bodies.length>0){
                    bodies.forEach( body => body.mesh.userData.enemy.hit(0.5));
                }else{
                    switch( obj.name ){
                        case 'Gate':
                            if (obj.hit()){
                                body.active = false;
                            };
                            break;
                    }
                }
            }
        }

    }
}

export { Player };