//import { Vector3 } from "three";
//import { SPBody } from "./SPBody";
import { SPCollision } from "./SPCollider.js";
import { SPImpulseSolver } from "./SPImpulseSolver.js";
import { SPPositionSolver } from "./SPPositionSolver.js";

class SPWorld{
    constructor(){
        this.bodies = [];
        this.solvers = [];
        this.gravity = new THREE.Vector3( 0, -9.81, 0);
        this.tmpVector = new THREE.Vector3();
        this.addSolver( new SPPositionSolver() );
        this.addSolver( new SPImpulseSolver() );
    }
         
    addBody(body) {
        this.bodies.push( body ); 
    }

    removeBody(body) { 
        const index = this.bodies.indexOf( body );
        if (index>=0){
            this.bodies.splice(index, 1);
        }else{
            console.error( 'SPWorld.removeBody: body not found');
        }
    }

    addSolver( solver ){
        this.solvers.push( solver );
    }

    removeSolver( solver ){
        const index = this.solvers.indexOf( solver );
        if (index>=0){
            this.solvers.splice(index, 1);
        }else{
            console.error('SPWorld.removeSolver: solver not found');
        }
    }
         
    step(dt){
        this.resolveCollisions(dt);

        this.bodies.forEach( body => {
            if (body.mass > 0){
                this.tmpVector.copy( this.gravity ).multiplyScalar( body.mass );
                body.force.add( this.tmpVector ); 
                this.tmpVector.copy( body.force ).divideScalar( body.mass  ).multiplyScalar( dt );
                body.velocity.add( this.tmpVector );
                this.tmpVector.copy( body.velocity ).multiplyScalar( dt );
                body.position.add( this.tmpVector );
                body.force.set( 0, 0, 0 );
                if (body.mesh) body.mesh.position.copy( body.position );  
            }
        });
    }

    resolveCollisions(dt){
        const collisions = [];

        this.bodies.forEach( bodyA => {
            this.bodies.forEach( bodyB => {
                if (bodyA.mass>0 && bodyA!=bodyB){
                    if (bodyA.collider && bodyB.collider){
                        const points = bodyA.collider.testCollision( bodyA.mesh.matrix, bodyB.collider, bodyB.mesh.matrix);
                        if (points.hasCollision){
                            const collision = new SPCollision(bodyA, bodyB, points )
                            collisions.push( collision );
                        }
                    }
                }
            })
        });

        this.solvers.forEach( solver => { solver.solve( collisions, dt ) } );

    }
}

export { SPWorld };