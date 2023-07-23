class SPPositionSolver{
    solve( collisions, dt ){
        const deltas = [];

        collisions.forEach( collision => {
            const bodyA = ( collision.bodyA.mass>0 ) ? collision.bodyA : null;
            const bodyB = ( collision.bodyB.mass>0 ) ? collision.bodyB : null;

            const invMassA = ( bodyA ) ? 1 / bodyA.mass : 0;
            const invMassB = ( bodyB ) ? 1 / bodyB.mass : 0;

            const percent = 0.8;
            const slop = 0.1;

            const correction = new THREE.Vector3().copy( collision.points.normal )
            correction.multiplyScalar( percent * Math.max( collision.points.depth - slop, 0))
            correction.divideScalar( invMassA + invMassB );

            const deltaA = new THREE.Vector3().copy(correction).multiplyScalar( invMassA );
            const deltaB = new THREE.Vector3().copy(correction).multiplyScalar( invMassB );

            deltas.push({ A:deltaA, B:deltaB });
        });

        let index = 0;

        collisions.forEach( collision => {
            const bodyA = ( collision.bodyA.mass>0 ) ? collision.bodyA : null;
            const bodyB = ( collision.bodyB.mass>0 ) ? collision.bodyB : null;

            const delta = deltas[index++];

            if ( bodyA ){
                bodyA.position.add( delta.A );
                //bodyA.mesh.position.copy( bodyA.position );
            }

            if ( bodyB ){
                bodyB.position.sub( delta.B );
                //bodyB.mesh.position.copy( bodyB.position );
            }
        });
    }
}

export { SPPositionSolver };