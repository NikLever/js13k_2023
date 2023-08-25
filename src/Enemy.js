import { Knight } from "./Knight.js";
import { Coffin } from "./Models.js";

class Enemy extends Knight{
    constructor(scene, z, world){
        const colours = [0x0A0A0A, 0xC8AD8D, 0x3B3845, 0x423D4D, 0x000000, 0x999999, 0x50545E, 0x706E3E ];

        super(scene, colours, true);

        this.coffin = new Coffin(this);
        this.coffin.visible = false;
        this.root.add(this.coffin);
        this.tmpVec = new THREE.Vector3();
        this.prevPos = new THREE.Vector3();
        
        this.STATES = { IDLE: 0, PATROL: 1, HONE: 2, ATTACK: 3, DEAD: 4 };
        const center = new THREE.Vector3(0,0,z);
        this.center = center;

        this.path = [
            new THREE.Vector3(-6, 0, -6),
            new THREE.Vector3(-6, 0, 6),
            new THREE.Vector3( 6, 0, 6),
            new THREE.Vector3( 6, 0, -6)
        ];
        this.pathV = new THREE.Vector3();
        this.path.forEach( node => {
            node.add(center);
        })

        this.world = world;
    }

    hit(amount=0.1){
        if (this.state == this.STATES.DEAD) return;
        this.life -= amount;
        if (this.life<=0){
            this.kill();
        }
    }

    respawn(){
        const offset = 40;
        this.path.forEach( node => {
            node.z += offset;
        });
        this.model.visible = true;
        this.coffin.visible = false;
        this.life = 1;
        this.body.position.set(0, 0, this.startPosition.z + offset);
        this.startPatrol();
    }

    kill(){
        this.model.visible = false;
        this.coffin.visible = true;
        this.coffin.animate();
        this.state = this.STATES.DEAD;
        this.stopAnims();
    }

    reset(){
        this.model.visible = true;
        this.coffin.visible = false;
        if (this.body && this.startPosition){
            this.body.position.copy(this.startPosition);
            this.body.velocity.set(0,0,0);
            this.root.position.copy(this.startPosition);
        }
        this.life = 1;
        this.startPatrol();
    }

    startPatrol(){
        this.stopAnims();
        this.pathIndex = 0;
        this.state = this.STATES.PATROL;
        this.root.getWorldPosition(this.tmpVec);
        this.tmpVec.sub(this.path[this.pathIndex]).normalize().multiplyScalar(3).negate();
        this.body.velocity.copy(this.tmpVec);
        this.pathV.copy(this.tmpVec);
        this.prevPos.copy(this.root.getWorldPosition(this.tmpVec));
    }

    updatePatrol(){
        const pos = this.path[this.pathIndex].clone();
        const d1 = this.prevPos.distanceTo(pos);
        this.root.getWorldPosition(this.tmpVec);
        const d2 = this.tmpVec.distanceTo(pos);
        this.prevPos.copy(this.tmpVec);
        if (d2>d1){
            this.pathIndex++;
            if (this.pathIndex>=this.path.length) this.pathIndex=0;
            //console.log(this.pathIndex);
            pos.copy(this.path[this.pathIndex]);
            this.tmpVec.sub(pos).normalize().multiplyScalar(3).negate();
            this.body.velocity.copy(this.tmpVec);
            this.pathV.copy(this.tmpVec);
        }else{
            //console.log('moving');
            this.body.velocity.copy(this.pathV);
        }
    }

    startAttack(app){
        this.state = this.STATES.ATTACK;
        this.playAnim('drawaction');
        if (app){
            app.knight.underAttack = true;
        }
    }

    startHone(app){
        if (this.state==this.STATES.HONE) return;
        //Check if player is visible
        if (app){
            app.tmpVec.copy(app.player.position).sub(this.body.position).normalize();
            app.raycaster.set(this.body.position, app.tmpVec);
            const intersects = app.raycaster.intersectObjects(app.scene.children);
            if (intersects.length>0){
                //If the first object found is not a child of the player then the player is behind an obstruction
                const obj = intersects[0].object;
                let found = false;
                app.knight.model.traverse( child => {
                    if (child == obj) found = true;
                });
                if (!found) return;
            }
        }
        this.stopAnims();
        this.state = this.STATES.HONE;
    }

    updateAttack(){
        if (this.attacking && this.world){
            this.bladeEnd.getWorldPosition(this.tmpVec);
            const intersects = this.world.getPointCollisions(this.tmpVec, this.body, 0.6);
            //console.log( 'checking intersects');
            if (intersects.length>0){
                const bodies = intersects.filter( intersect => intersect.mesh.name == 'Player' );
                if (bodies.length>0){
                    bodies[0].mesh.userData.player.hit();
                    //console.log( `Enemy Sword hit ${obj.name}`);
                }
            }
        }
    }

    update(dt, v){
        super.update(dt, v);
        switch(this.state){
            case this.STATES.IDLE:
                break;
            case this.STATES.PATROL:
                this.updatePatrol();
                break;
            case this.STATES.ATTACK:
                this.updateAttack();
                break;
            case this.STATES.DEAD:
                this.coffin.update(dt);
                break;
        }
    }
}

export { Enemy };