import { Knight } from "./Knight.js";
import { Coffin } from "./Models.js";

class Enemy extends Knight{
    constructor(scene, z){
        const colours = [0x0A0A0A, 0xC8AD8D, 0x3B3845, 0x423D4D, 0x000000, 0x999999, 0x50545E, 0x706E3E ];

        super(scene, colours, true);

        this.coffin = new Coffin();
        this.coffin.visible = false;
        this.root.add(this.coffin);
        this.tmpVec = new THREE.Vector3();
        this.prevPos = new THREE.Vector3();
        
        this.STATES = { IDLE: 0, PATROL: 1, HONE: 2, ATTACK: 3, DEAD: 4 };
        const center = new THREE.Vector3(0,0,z);
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
    }



    kill(){
        this.model.visible = false;
        this.coffin.visible = true;
        this.coffin.animate();
        this.state = this.STATES.DEAD;
    }

    reset(){
        this.model.visible = true;
        this.coffin.visible = false;
        this.state = this.STATES.IDLE;
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

    startAttack(){
        this.state = this.STATES.ATTACK;
        this.playAnim('drawaction');
    }

    startHone(){
        this.state = this.STATES.HONE;
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
                break;
            case this.STATES.DEAD:
                this.coffin.update(dt);
                break;
        }
    }
}

export { Enemy };