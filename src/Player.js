import { Knight } from "./Knight.js";

class Player extends Knight{
    constructor(scene){
        const colours = [ 15991041, 16373422, 0xC7C7C7, 16777215, 12615993, 16777215, 6458346, 16774938 ];

        super(scene, colours);
    }
}

export { Player };