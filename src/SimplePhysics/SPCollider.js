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
            console.warn( 'SPAABBCollider.testSphereCollision: no parameter can be null');
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

export { SPCOLLIDERTYPES, SPSphereCollider, SPPlaneCollider, SPAABBCollider };