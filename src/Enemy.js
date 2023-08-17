import { Knight } from "./Knight.js";

class Enemy extends Knight{
    constructor(scene){
        const colours = [0x0A0A0A, 0xC8AD8D, 0x3B3845, 0x423D4D, 0x000000, 0x999999, 0x50545E, 0x706E3E ];

        super(scene, colours, true);
    }
}

export { Enemy };