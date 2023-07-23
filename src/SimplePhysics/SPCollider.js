const SPCOLLIDERTYPE = {
    SPHERE: 1,
    PLANE: 2,
    AABB: 3
}

class SPCollisionPoints{
    constructor(){
        this.A = new THREE.Vector3();
        this.B = new THREE.Vector3();
        this.normal = new THREE.Vector3();
        this.depth = 0;
        this.hasCollision = false;
    }
}

class SPCollision{
    constructor( bodyA, bodyB, points ){
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.points = points;
    }
}

class SPCollider{
    constructor( type ){
        this.type = type;
    }
}

class SPSphereCollider extends SPCollider{
    constructor( radius, center = new THREE.Vector3() ){
        super( SPCOLLIDERTYPE.SPHERE );
        this.radius = radius;
        this.center = center;
    }

    testCollision( transA, collider, transB ){
        let result = [];
        switch( collider.type ){
            case SPCOLLIDERTYPE.SPHERE:
                result = this.findSphereSphereCollisionPoints( transA, collider, transB );
                break;
            case SPCOLLIDERTYPE.PLANE:
                result = this.findSpherePlaneCollisionPoints( transA, collider, transB );
                break;
            case SPCOLLIDERTYPE.AABB:
                result = this.findSphereAABCollisionPoints( transA, collider, transB );
                break;   
        }
        return result;
    }

    findSphereSphereCollisionPoints( transA, collider, transB ){

    }

    findSpherePlaneCollisionPoints( transA, collider, transB ){
        //ground y=0
        const points = new SPCollisionPoints();

        const posA = new THREE.Vector3().setFromMatrixPosition( transA );

        if ( posA.y - this.radius < 0 ){
            points.A.set( posA.x, posA.y - this.radius, posA.z );
            points.B.set( posA.x, 0, posA.z );
            points.normal.copy( points.B ).sub( points.A );
            points.depth = points.normal.length();
            points.normal.normalize();
            points.hasCollision = true;
        }

        return points;
    }

    findSphereAABBCollisionPoints( transA, collider, transB ){
        
    }
}

class SPPlaneCollider extends SPCollider{
    constructor( plane, distance ){
        super( SPCOLLIDERTYPE.PLANE );

        this.plane = plane;
        this.distance = distance;
    }
}

class SPAABBCollider extends SPCollider{
    constructor( min, max ){
        super( SPCOLLIDERTYPE.AABB );
        this.min = min;
        this.max = max;
    }
}

export { SPSphereCollider, SPPlaneCollider, SPAABBCollider, SPCollision };