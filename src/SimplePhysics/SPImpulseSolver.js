class SPImpulseSolver{
    solve( collisions, dt ){
        
        collisions.forEach( collision => {
            const bodyA = ( collision.bodyA.mass>0 ) ? collision.bodyA : null;
            const bodyB = ( collision.bodyB.mass>0 ) ? collision.bodyB : null;

            const velA = bodyA ? bodyA.velocity : new THREE.Vector3();
            const velB = bodyB ? bodyB.velocity : new THREE.Vector3();
            let velR = new THREE.Vector3().copy(velB).sub(velA);
            let nSpd = velR.dot( collision.points.normal );

            const invMassA = ( bodyA ) ? 1 / bodyA.mass : 1;
            const invMassB = ( bodyB ) ? 1 / bodyB.mass : 1;

            if (nSpd < 0){
                const e = ( bodyA ? bodyA.restitution : 1 ) * ( bodyB ? bodyB.restitution : 1 );
                const j = -(1 + e) * nSpd / (invMassA + invMassB );

                const impulse = collision.points.normal.clone().multiplyScalar( j );

                if ( bodyA ){
                    velA.sub( impulse.clone().multiplyScalar( invMassA ));
                }
    
                if ( bodyB ){
                    velB.sub( impulse.clone().multiplyScalar( invMassB ));
                }

                //Friction
                velR = new THREE.Vector3().copy(velB).sub(velA);
                nSpd = velR.dot( collision.points.normal );

                const tangent = velR.clone().sub( collision.points.normal.clone().multiplyScalar( nSpd ));

                if ( tangent.length() > 0.0001 ){
                    tangent.normalize();
                }

                const fVel = rVel.dot( tangent );

                const aSF = bodyA ? bodyA.staticFriction : 0;
                const bSF = bodyB ? bodyB.staticFriction : 0;
                const aDF = bodyA ? bodyA.dynamicFriction : 0;
                const bDF = bodyB ? bodyB.dynamicFriction : 0;
                let mu = new THREE.Vector2( aSF, bSF).length();

                const f = -fVel/(invMassA + invMassB);

                const friction = new THREE.Vector3();

                if (Math.abs(f)> j * mu){
                    friction.copy(tangent).multiplyScalar(f);
                }else{
                    mu = new THREE.Vector2( aDF, bDF );
                    friction.copy(tangent).multiplyScalar( -j * mu );
                }

                if (bodyA.mass > 0){
                    bodyA.velocity = velA.sub( friction.clone().multiplyScalar( invMassA ));
                }

                if (bodyB.mass > 0){
                    bodyB.velocity = velB.add( friction.clone().multiplyScalar( invMassB ));
                }
            }
        });
    }
}

export { SPImpulseSolver };