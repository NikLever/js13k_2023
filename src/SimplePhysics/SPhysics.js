const SPCOLLIDERTYPES = {
    SPHERE: 1,
    PLANE: 2,
    AABB: 3
}

const Compass = [
    new THREE.Vector3( 1, 0, 0),//RIGHT
    new THREE.Vector3( -1, 0, 0),//LEFT
    new THREE.Vector3( 0, 1, 0),//UP
    new THREE.Vector3( 0, -1, 0),//DOWN
    new THREE.Vector3( 0, 0, 1),//IN
    new THREE.Vector3( 0, 0, -1),//OUT
]

class SPSphereCollider{
    constructor( radius=0.5 ){
        this.type = SPCOLLIDERTYPES.SPHERE;
        this.radius = radius;
    }
}

class SPPlaneCollider{
    constructor( normal, distance){
        this.type = SPCOLLIDERTYPES.PLANE;
        this.normal = normal;
        this.distance = distance;
    }
}

class SPAABBCollider{
    constructor( min, max){
        this.type = SPCOLLIDERTYPES.AABB;
        this.min = min;
        this.max = max;
    }

    testSphereCollision( min, max, center, radius ){
        if (min==null || max==null || center==null || radius==null){
            //console.warn( 'SPAABBCollider.testSphereCollision: no parameter can be null');
            return false;
        }
        // Compute squared distance between sphere center and AABB
        // the sqrt(dist) is fine to use as well, but this is faster.
        const sqDist = SqDistPointAABB( center, min, max );

        // Sphere and AABB intersect if the (squared) distance between them is
        // less than the (squared) sphere radius.
        return sqDist <= radius * radius;

        // Returns the squared distance between a point p and an AABB b
        function SqDistPointAABB( p, min, max )
        {
            let sqDist = 0.0;
            
            // for each axis count any excess distance outside box extents
            if( p.x < min.x ) sqDist += (min.x - p.x) * (min.x - p.x);
            if( p.x > max.x ) sqDist += (p.x - max.x) * (p.x - max.x);
            if( p.y < min.y ) sqDist += (min.y - p.y) * (min.y - p.y);
            if( p.y > max.y ) sqDist += (p.y - max.y) * (p.y - max.y);
            if( p.z < min.z ) sqDist += (min.z - p.z) * (min.z - p.z);
            if( p.z > max.z ) sqDist += (p.z - max.z) * (p.z - max.z);

            return sqDist;
        }
    }

    closestPoint( spherePos, aabbPos, radius=0.5, worldSpace=true ){
        //const normal = aabbPos.clone().sub( spherePos ).normalize();
        //const pt1 = normal.multiplyScalar(radius);

        //const pt = pt1.clamp( this.min, this.max );

        const normal = spherePos.clone().sub( aabbPos );
        const pt = normal.clamp( this.min, this.max )
        
        if (worldSpace) pt.add(aabbPos);

        return pt;
    }

    whichDirection( normal ){
        let max = 0.0;
        let best_match = -1;
        for (let i = 0; i < Compass.length; i++)
        {
            const dot_product = normal.dot(Compass[i]);
            if (dot_product > max)
            {
                max = dot_product;
                best_match = i;
            }
        }
        return best_match;
    }
}

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
            //console.log( 'SPWorld.removeBody: body not found');
        }else{
            this.bodies.splice( index, 1 );
        }
    }

    getPointCollisions( v, ignoreBody, radius = 0.1 ){
        const intersects = [];
        this.bodies.forEach( body => {
            if (body == ignoreBody ) return;
            switch(body.collider.type){
                case SPCOLLIDERTYPES.SPHERE:
                    if (v.distanceTo(body.position)<body.collider.radius){
                        intersects.push(body);
                    }
                    break;
                case SPCOLLIDERTYPES.AABB:
                    const min = body.collider.min.clone().add(body.position);
                    const max = body.collider.max.clone().add(body.position);
                    
                    if ( body.collider.testSphereCollision(min, max, v, radius)){
                        intersects.push(body);
                    }
                    break;
            }
        })
        return intersects;
    }

    step(dt){
        const deltaTime = dt / this.substeps;

        for( let i=0; i<this.substeps; i++){
            let index = 0;
            let collision = false;

            this.bodies.forEach( body => {
                if (body.mass!=0 && body.collider!=null && body.collider.type==SPCOLLIDERTYPES.SPHERE){
                    const pos = body.position.clone();
                    //const vel = body.velocity.clone();
                    //const log = [];
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
                        if (body == body2 || !body2.active ) continue;
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
                        
                                    if (body.onCollision){
                                        body.onCollision(body2.mesh.name);
                                    }
                                    
                                    const dir = body2.collider.whichDirection( normal.negate() );
                                    //RIGHT 0, LEFT 1, UP 2, DOWN 3, IN 4, OUT 5
                                    switch(dir){
                                    case 0://RIGHT
                                        //log.push("AABB collision>min.x");
                                        body.position.x = min.x - body.collider.radius;
                                        body.velocity.x = -body.velocity.x * body.restitution;
                                        break;
                                    case 1://LEFT
                                        //log.push("AABB collision<max.x");
                                        body.position.x = max.x + body.collider.radius;
                                        body.velocity.x = -body.velocity.x * body.restitution;
                                        break;
                                    case 2://UP
                                        //log.push("AABB collision>min.y");
                                        //if (min.y - body.collider.radius >= 0){
                                            body.position.y = min.y - body.collider.radius;
                                            body.velocity.y = -body.velocity.y * body.restitution;
                                        //}
                                        break;
                                    case 3://DOWN
                                        //log.push("AABB collision<max.y");
                                        body.position.y = max.y + body.collider.radius;
                                        body.velocity.y = -body.velocity.y * body.restitution;
                                        break;
                                    case 4://IN
                                        //log.push("AABB collision>min.z");
                                        body.position.z = min.z - body.collider.radius;
                                        body.velocity.z = -body.velocity.z * body.restitution;
                                        break;
                                    case 5://OUT
                                        //log.push("AABB collision<max.z");
                                        body.position.z = max.z + body.collider.radius;
                                        body.velocity.z = -body.velocity.z * body.restitution;
                                        break;
                                    }

                                    if (body.sfx) body.playSfx();
                                }

                                
                                break;
                            }
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

class SPBody{
    constructor(mesh=null, collider=null, mass=0){
        this.mass = mass;
        this.invMass = (mass!=0) ? 1/mass : 0;
        this.position = (mesh) ? mesh.position.clone() : new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.damping = 0.99;
        this.restitution = 0.9;
        this.collider = collider;
        this.active = true;
        this.mesh = mesh;
        if (mass>0 && collider.type != SPCOLLIDERTYPES.SPHERE){
            //console.warn( 'SPBody constructor: only Sphere dynamic bodies are supported' );
        }
        this.sfx = null;
        this.onCollision = null;
    }

    playSfx(){
        const elapsedTime = (this.sfxPlayTime) ? Date.now() - this.sfxPlayTime : 1000;
        if (this.sfx==null || this.sfx.isPlaying || this.velocity.length()<0.01 || elapsedTime<500) return;
        this.sfx.play();
        this.sfxPlayTime = Date.now();
    }
}

export { SPWorld, SPBody, SPCOLLIDERTYPES, SPSphereCollider, SPPlaneCollider, SPAABBCollider  };