class CollisionPoints{
    constructor( A, B, normal ){
        this.A = A;
        this.B = B;
        this.normal = normal;
        this.depth = 0;
        this.hasCollision = false;
    }
}