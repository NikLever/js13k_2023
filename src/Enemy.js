import { Knight } from "./Knight.js";
import { Coffin } from "./Models.js";

class Enemy extends Knight{
    constructor(scene){
        const colours = [0x0A0A0A, 0xC8AD8D, 0x3B3845, 0x423D4D, 0x000000, 0x999999, 0x50545E, 0x706E3E ];

        super(scene, colours, true);

        this.coffin = new Coffin();
        this.coffin.visible = false;
        this.root.add(this.coffin);

        this.dead = false;
    }

    kill(){
        this.model.visible = false;
        this.coffin.visible = true;
        this.coffin.animate();
        this.dead = true;
    }

    reset(){
        this.model.visible = true;
        this.coffin.visible = false;
        this.dead = false;
    }

    update(dt, v){
        super.update(dt, v)
        if (this.dead) this.coffin.update(dt);
    }
}

export { Enemy };