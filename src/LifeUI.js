class LifeUI extends THREE.Mesh{
    constructor(parent, pos, s=128){
        const canvas = createOffscreenCanvas(s, s);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(0.7, 0.7);
        
        super(geometry, material);

        this.context = canvas.getContext('2d');
        this.context.save();

        this.width = s;
        this.height = s;
        this.texture = texture;

        this.position.copy(pos);

        this.showLife(1);

        parent.add( this );

        function createOffscreenCanvas(w, h) {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            return canvas;
        }
    }

    showLife(val=0.5){
        if (val>1) val = 1;
        if (val<0) val = 0;
        this.context.clearRect(0, 0, this.width, this.height)
        this.context.fillStyle = 'red';
        this.context.beginPath();
        this.context.arc(this.width/2, this.height/2, this.width/2, 0, 2 * Math.PI);
        this.context.fill();
        this.context.fillStyle = 'green';
        this.context.beginPath();
        this.context.moveTo(this.width/2,this.height/2);
        this.context.lineTo(this.width, this.height/2);
        this.context.arc(this.width/2, this.height/2, this.width/2, 0, 2 * Math.PI * val);
        this.context.fill();
        this.texture.needsUpdate = true;
    }
}

export { LifeUI };