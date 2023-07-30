import { SPCOLLIDERTYPES } from "./SPCollider.js";

class SPWorld{
    constructor(){
        this.bodies = [];
        this.substeps = 1;
        this.gravity = new THREE.Vector3(0, -9.81, 0);
    }

    addBody( body ){
        this.bodies.push(body);
    }

    removeBody( body ){
        const index = this.bodies.indexOf( body );

        if (index<0){
            console.log( 'SPWorld.removeBody: body not found');
        }else{
            this.bodies.splice( index, 1 );
        }
    }

    step(dt){
        const deltaTime = dt / this.substeps;

        for( let i=0; i<this.substeps; i++){
            let index = 0;
            let collision = false;

            this.bodies.forEach( body => {
                if (body.mass!=0 && body.collider!=null && body.collider.type==SPCOLLIDERTYPES.SPHERE){
                    const pos = body.position.clone();
                    const vel = body.velocity.clone();
                    const log = [];
                    //Move
                    body.position.add( body.velocity.clone().multiplyScalar( deltaTime ) );

                    //Collision check and resolve ground
                    if ( body.position.y < body.collider.radius ) {
                        body.position.y = body.collider.radius;
                        body.velocity.y = -body.velocity.y * body.restitution;
                        //log.push( 'ground hit' );
                    }

                    //Collision check and resolve colliders
                    for ( let n = 0; n < this.bodies.length; n ++ ) {
                        const body2 = this.bodies[ n ];
                        if (body == body2) continue;
                        switch (body2.collider.type){
                            case SPCOLLIDERTYPES.SPHERE:
                                const normal = body.position.clone().sub( body2.position );
                                const distance = normal.length();
                        
                                if ( distance < 2 * body.collider.radius ) {
                                    normal.multiplyScalar(0.5 * distance - body.collider.radius);
                                    body.position.sub(normal);
                                    normal.normalize();
                        
                                    const relativeVelocity = body.velocity.clone().sub(body2.velocity);
                                    normal.multiplyScalar( normal.dot( relativeVelocity, normal ) );
                        
                                    body.velocity.sub(normal);
                                    //log.push( 'sphere hit' );
                                }
                                break;
                            case SPCOLLIDERTYPES.AABB:
                                //min-max in world space
                                const min = body2.collider.min.clone().add(body2.position);
                                const max = body2.collider.max.clone().add(body2.position);
                                const magnitude = body.velocity.length();
                                const slop = 0;// magnitude/20;

                                if ( body2.collider.testSphereCollision(min, max, body.position, body.collider.radius)){
                                    //There is an intersection
                                    const pt = body2.collider.closestPoint( body.position, body2.position );
                                    const normal = body.position.clone().sub(pt).normalize();
                                    const offset = normal.clone().multiplyScalar(body.collider.radius + slop);
                                    body.position = pt.clone().add(offset);
                        
                                    /*const relativeVelocity = body.velocity.clone().sub(body2.velocity);
                                    normal.multiplyScalar( normal.dot( relativeVelocity, normal ) ).negate();
                                    body.velocity.sub(normal);//.normalize().multiplyScalar(magnitude * body.restitution );
                                    console.log(`SPWorld.step aabb collision posY${body.position.y.toFixed(2)} velY${body.velocity.y.toFixed(2)}`);*/
                                    
                                    //collision = true;
                                    //body.position.add(body.velocity.clone().multiplyScalar(deltaTime));
                                    //log.push( 'aabb hit' );

                                    /*const normal = new THREE.Vector3(0,1,0);
                                    if (body.velocity.length() > 0.001){
                                        normal.copy(body.velocity).normalize();
                                    }*/
                                    const dir = body2.collider.whichDirection( normal.negate() );
                                    //RIGHT 0, LEFT 1, UP 2, DOWN 3, IN 4, OUT 5
                                    switch(dir){
                                    case 0://RIGHT
                                        log.push("AABB collision>min.x");
                                        body.position.x = min.x - body.collider.radius;
                                        body.velocity.x = -body.velocity.x * body.restitution;
                                        break;
                                    case 1://LEFT
                                        log.push("AABB collision<max.x");
                                        body.position.x = max.x + body.collider.radius;
                                        body.velocity.x = -body.velocity.x * body.restitution;
                                        break;
                                    case 2://UP
                                        log.push("AABB collision>min.y");
                                        //if (min.y - body.collider.radius >= 0){
                                            body.position.y = min.y - body.collider.radius;
                                            body.velocity.y = -body.velocity.y * body.restitution;
                                        //}
                                        break;
                                    case 3://DOWN
                                        log.push("AABB collision<max.y");
                                        body.position.y = max.y + body.collider.radius;
                                        body.velocity.y = -body.velocity.y * body.restitution;
                                        break;
                                    case 4://IN
                                        log.push("AABB collision>min.z");
                                        body.position.z = min.z - body.collider.radius;
                                        body.velocity.z = -body.velocity.z * body.restitution;
                                        break;
                                    case 5://OUT
                                        log.push("AABB collision<max.z");
                                        body.position.z = max.z + body.collider.radius;
                                        body.velocity.z = -body.velocity.z * body.restitution;
                                        break;
                                    }

                                    if (body.sfx) body.playSfx();
                                }

                                
                                break;
                            }
                        }

                        if ( body.position.distanceTo( pos ) > 2){
                            //console.log('Big move\n'+ log.join("\n"));
                            //body.position.copy(pos);
                            //body.velocity.copy(vel);
                        }    
                    }
                
                    if (!collision) body.velocity.multiplyScalar( body.damping ).add( this.gravity.clone().multiplyScalar( deltaTime ) );

                    if (body.mesh){
                        body.mesh.position.copy( body.position );
                        //console.log("SPWorld.step: body.position update ", body.position)
                    }

                    index++;
                });
            }
    }
}
        /*Ball ball = ballsBuffer[id.x];

        ball.position += ball.velocity * deltaTime;
        
        // keep objects inside room
        if ( ball.position.x < LIMITS_MIN_X || ball.position.x > LIMITS_MAX_X ) {
    
            ball.position.x = clamp( ball.position.x, LIMITS_MIN_X, LIMITS_MAX_X );
            ball.velocity.x = - ball.velocity.x;
    
        }
    
        if ( ball.position.y < LIMITS_MIN_Y ) {
    
            ball.position.y = LIMITS_MIN_Y;
    
            ball.velocity.xz *= 0.96;
            ball.velocity.y = - ball.velocity.y * 0.8;
    
        }
    
        if ( ball.position.z < LIMITS_MIN_Z || ball.position.z > LIMITS_MAX_Z ) {
    
            ball.position.z = clamp( ball.position.z, LIMITS_MIN_Z, LIMITS_MAX_Z );
            ball.velocity.z = - ball.velocity.z;
    
        }
    
        float3 normal;
        float3 relativeVelocity;
    
        for ( int i = id.x + 1; i < ballsCount; i ++ ) {
            Ball ball2 = ballsBuffer[ (uint)i ];
    
            normal = ball.position - ball2.position;
            
            const float distance = length(normal);
    
            if ( distance < 2 * radius ) {
    
                normal *= 0.5 * distance - radius;
    
                ball.position -= normal;
                
                normal = normalize(normal);
    
                relativeVelocity = ball.velocity - ball2.velocity;
    
                normal *= dot( relativeVelocity, normal );
    
                ball.velocity -= normal;
            }
    
        }
    
        ball.velocity.xz *= 0.98;
        ball.velocity.y -= 9.8 * deltaTime;
    
        ballsBuffer[id.x] = ball;
    }
}*/

export { SPWorld };