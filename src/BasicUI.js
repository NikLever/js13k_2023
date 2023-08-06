class BasicUI{
    constructor(parent, pos, w=256, h=32){
        const canvas = this.createOffscreenCanvas(w, h);
        this.context = canvas.getContext('2d');
        this.context.save();

        this.width = w;
        this.height = h;
		
        this.texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
		const geometry = new THREE.PlaneGeometry(w/100, h/100);
		
		this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(pos);

        parent.attach( this.mesh );

        this.style = {
            fontFamily:'Arial', 
            fontWeight:'bold',
            fontSize:30, 
            padding:20, 
            fontColor:'#f00', 
        }

        this.autoUpdate = true;
    }

    showText(left, bottom, txt, clear=true){
        if (clear) this.clear();
        this.context.font = `${this.style.fontSize}px '${this.style.fontFamily}'`;
        this.context.fillStyle = this.style.fontColor;
        this.context.fillText(txt, left, bottom);
        if (this.autoUpdate) this.texture.needsUpdate = true;
    }

    showLives(count, clear=true){
        if (clear) this.clear();
        this.context.fillStyle = 'red';
        this.context.beginPath();
        for(let i=0; i<count; i++){
            this.context.arc(10+i*25, 16, 10, 0, 2 * Math.PI);
        }
        this.context.fill();
        if (this.autoUpdate) this.texture.needsUpdate = true;
    }

    clear(area){
        if (area==null){
            this.context.clearRect(0, 0, this.width, this.height);
        }else{
            area.x = (area.x) ? area.x : 0;
            area.y = (area.y) ? area.y : 0;
            area.w = (area.w) ? area.w : this.width;
            area.h = (area.h) ? area.h : this.height;
            this.context.clearRect(area.x, area.y, area.w, area.h);
        }
    }

    createOffscreenCanvas(w, h) {
		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		return canvas;
	}

    update(){
        this.texture.needsUpdate = true;
    }
}

export { BasicUI };