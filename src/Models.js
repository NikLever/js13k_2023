const rock = `
v -4.180146 -0.044282 1.313072
v -3.293453 -0.011464 2.331719
v -4.087380 0.200443 2.241611
v -3.497983 0.406422 2.116049
v -4.180146 -0.044282 1.879304
v -3.878069 -0.044282 2.306324
v -3.315006 -0.024495 1.511920
v -3.547826 -0.044282 1.411918
v -3.822651 0.440060 1.508486
v -4.140570 0.294414 1.464704
v -4.140570 0.367704 1.760017
v -3.307498 0.469637 1.685393
v -3.864416 0.625029 1.873667
vn 0.7231 0.5615 0.4023
vn 0.3408 0.3660 -0.8659
vn 0.9996 -0.0060 -0.0262
vn -0.0805 0.6766 0.7319
vn 0.0246 0.4680 0.8834
vn -0.9958 0.0892 -0.0221
vn -0.7167 -0.4789 0.5070
vn -0.5121 0.7412 -0.4340
vn 0.3456 0.8943 0.2841
vn 0.0176 -0.9998 -0.0124
vn 0.1000 0.8922 -0.4405
vn 0.1422 0.3906 -0.9095
vn 0.0359 0.2150 -0.9760
vn 0.2924 0.3128 -0.9037
vn -0.0543 0.2116 0.9758
vn -0.7135 0.6337 0.2989
vn -0.9932 0.1161 -0.0000
vn -0.9778 0.1392 0.1563
vn -0.3805 0.8975 -0.2228
vn -0.0000 -1.0000 -0.0000
vn 0.0535 -0.9959 0.0724
vn 0.0554 -0.9984 0.0144
s 0
f 4//1 2//1 12//1
f 8//2 9//2 7//2
f 7//3 12//3 2//3
f 3//4 4//4 13//4
f 4//5 3//5 2//5
f 11//6 10//6 5//6
f 5//7 6//7 3//7
f 9//8 11//8 13//8
f 4//9 12//9 13//9
f 5//10 7//10 6//10
f 13//11 12//11 9//11
f 8//12 1//12 10//12
f 10//13 9//13 8//13
f 9//14 12//14 7//14
f 2//15 3//15 6//15
f 3//16 13//16 11//16
f 1//17 5//17 10//17
f 11//18 5//18 3//18
f 9//19 10//19 11//19
f 5//20 1//20 8//20
f 8//21 7//21 5//21
f 7//22 2//22 6//22
`;

class Tree extends THREE.Group{
    constructor(type=Math.floor(Math.random()*0)){
        super();

        switch(type){
            case 0:
                this.treeA();
                break;
            case 1:
                this.treeB();
                break;
            case 2:
                this.treeC();
                break;
            case 3:
                this.treeD();
                break;
        }
    }

    treeA(){
        const height = 6;
        const maxBend = Math.PI/10;
        const geometry = new THREE.CylinderGeometry( 0.3, 0.6, height, 8, 4, true );
        geometry.translate(0, 2, 0);
        //const vertex = new THREE.Vector3();
        const vertices = geometry.getAttribute('position');
        for( let i=0; i<=vertices.array.length; i+=3){
            //vertex.set(vertices.array[i], vertices.array[i+1], vertices.array[i+2]);
            const vY = vertices.array[i+1];
            const strength = vY/height;
            const theta = strength * maxBend;
            const oX = Math.sin(theta)*vY;
            const y = Math.cos(theta)*vY;
            //vertex.sub(offset);
            vertices.array[i] -= oX;
            vertices.array[i+1] = y;
        }
        vertices.needsUpdate = true;
        const material = new THREE.MeshPhongMaterial({color: 0xbebbb6 });
        const trunk = new THREE.Mesh(geometry, material);
        this.add(trunk);

        const geo2 = new THREE.SphereGeometry(1.5);
        const mat2 = new THREE.MeshPhongMaterial({color: 0xdd9c22 });
        const leaves = new THREE.Mesh( geo2, mat2 );
        leaves.position.x -= Math.sin(maxBend)*height;
        leaves.position.y = Math.cos(maxBend)*height
        this.add(leaves);
    }

    treeB(){
        const height = 5;

        const geometry = new THREE.ConeGeometry(1.3, height/2, 10, 1, true);
        geometry.translate(0, height/2, 0);
        const material = new THREE.MeshPhongMaterial({color: 0x365cb3 });
        const cone1 = new THREE.Mesh(geometry, material);
        const cone2 = new THREE.Mesh(geometry, material);
        const cone3 = new THREE.Mesh(geometry, material);

        cone2.position.y = height/3;
        let scale = (height-height/3)/height
        cone2.scale.y = scale;
        cone2.scale.x = cone2.scale.z = scale * 1.2;

        cone3.position.y = (height/3) * 2;
        scale = (height-(height/3)*2)/height;
        cone3.scale.y = scale;
        cone3.scale.x = cone3.scale.z = scale * 1.2;

        this.add(cone1);
        this.add(cone2);
        this.add(cone3);
    }

    treeC(){
        const height = 2;

        const material = new THREE.MeshPhongMaterial({color: 0x365cb3 });
        const cone1 = new THREE.Mesh(geometry, material);
    }

    treeD(){
        const height = 2;

        const material = new THREE.MeshPhongMaterial({color: 0x365cb3 });
        const cone1 = new THREE.Mesh(geometry, material);
    }
}

/*class Rock extends THREE.Mesh{
    constructor(){
        const radius = Math.random()*1.25;
        const geometry = new THREE.SphereGeometry(radius, 8, 6);
        geometry.translate( 0, radius, 0 );
        const vertices = geometry.getAttribute('position');
        for(let i=0; i<vertices.array.length; i++){
            vertices.array[i] += (Math.random()-0.5) * 0.35;
        }
        vertices.needsUpdate = true;
        const material = new THREE.MeshPhongMaterial( {color: 0xaaaaaa } );//, flatShading: true });
        super(geometry, material);
    }
}*/

class OBJParser{
    constructor(txt){
        const lines = txt.split('\n');
        const vertices = [];
        const normals = [];
        const faces = [];
        let chunk;

        lines.forEach( line => {
            if (line.startsWith('v ')){
                vertices.push(this.readVector3(line.substring(2)));
            }else if (line.startsWith('vn ')){
                normals.push(this.readVector3(line.substring(3)));
            }else if (line.startsWith('f ')){
                faces.push(this.readFace(line.substring(2)));
            }
        });

        const count = faces.length * 3 * 3;
        const verticesB = new Float32Array(count);
        const normalsB = new Float32Array(count);
        let index = 0, v, n;

        faces.forEach( face => {
            for(let i=0; i<3; i++){
                try{
                v = vertices[face[i].vertex];
                n = normals[face[i].normal];
                verticesB[index] = v.x;
                verticesB[index+1] = v.y;
                verticesB[index+2] = v.z;
                normalsB[index] = n.x;
                normalsB[index+1] = n.y;
                normalsB[index+2] = n.z;
                }catch(e){
                    console.log(`OBJParser v=${v} n=${n} index=${index} face:${face}`);
                }
                index += 3;
            }
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.BufferAttribute( verticesB, 3 ) );
        geometry.setAttribute( 'normal', new THREE.BufferAttribute( normalsB, 3 ) );

        this.geometry = geometry;
    }

    readVector3(txt){
        const words = txt.split(' ');
        const x = parseFloat(words[0]);
        const y = parseFloat(words[1]);
        const z = parseFloat(words[2]);
        return new THREE.Vector3(x,y,z);
    }

    readFace(txt){
        const words = txt.split(' ');
        const face = [];
        words.forEach( word => {
            const tokens = word.split('/');
            const vertex = parseInt(tokens[0])-1;
            const uv = parseInt(tokens[1])-1;
            const normal = parseInt(tokens[2])-1;
            face.push({vertex, uv, normal});
        });
        return face;
    }
}

class Rock extends THREE.Mesh{
    constructor(){
        const geometry = new OBJParser(rock).geometry;
        geometry.center();
        geometry.translate(0, 0.5, 0);
        const material = new THREE.MeshPhongMaterial( {color: 0xaaaaaa } );//, flatShading: true });
        super(geometry, material);
    }
}

class RockFace extends THREE.Mesh{
    constructor(){
        const geometry = new THREE.PlaneGeometry(2000, 20, 300, 10);
        //geometry.rotateY( -Math.PI );
        //geometry.translate( 1000, 50, 0 );
        const vertices = geometry.getAttribute('position');
        for(let i=0; i<vertices.array.length; i++){
            vertices.array[i] += (Math.random()-0.5) * 0.95;
        }
        vertices.needsUpdate = true;
        const material = new THREE.MeshPhongMaterial( {color: 0xaaaaaa, flatShading: true });
        super(geometry, material);
    }
}

class Tower{
    constructor(width=3, height=1.5, depth=3, rampartHeight=0.5){
        this.root = new THREE.Group();

        this.root.userData.bounds = { width, height, depth };
        
        if (width<0.25){
            const tmp = width;
            width = depth;
            depth = tmp;
        }

        const rampartCount = Math.floor(width/rampartHeight);
        const shape = new THREE.Shape();

        shape.moveTo( width/2, height );
        shape.lineTo( width/2, 0 );
        shape.lineTo( -width/2, 0 );
        shape.lineTo( -width/2, height );

        const inc = width/((rampartCount*2)+1);

        shape.lineTo(inc-width/2, height);

        for(let i=0; i<rampartCount; i++){
            let orgX = inc*(1 + 2*i)-width/2;
            shape.lineTo( orgX, height-rampartHeight);
            shape.lineTo( orgX + inc, height-rampartHeight);
            shape.lineTo( orgX + inc, height);
            shape.lineTo( orgX + 2*inc, height);
        }

        shape.lineTo( width/2, height );
        
        const extrudeSettings = {
            steps: 1,
            depth: 0.25,
            bevelEnabled: false
        }; 

        const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        if (this.root.userData.bounds.width<0.25){
            geometry.rotateY(Math.PI/2);
        }
        const material = new THREE.MeshStandardMaterial( { color: 0xaaaaaa } );
        const wall1 = new THREE.Mesh( geometry, material ) ;
        wall1.position.z = -depth/2-0.1;

        this.root.add(wall1);

        if (depth>0.25 && width>0.25){
            const wall2 = wall1.clone();
            wall2.position.z = depth/2-0.2;
            const wall3 = wall1.clone();
            wall3.rotateY(Math.PI/2);
            wall3.position.set(-width/2-0.1, 0, 0);
            const wall4 = wall3.clone();
            wall4.position.x = width/2-0.2;

            const gFloor = new THREE.BoxGeometry(width*1.1, 0.1, depth*1.1);
            const floor = new THREE.Mesh( gFloor, material );
            floor.position.y = height - rampartHeight * 2;
            this.root.add(floor);
            this.root.add(wall2);
            this.root.add(wall2);
            this.root.add(wall3);
            this.root.add(wall4);
        }
    }
    
}

export { Tree, Rock, RockFace, Tower };