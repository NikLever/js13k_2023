const svg = "data:image/svg+xml, %3Csvg fill='%23ffffff' width='100%' height='auto' viewBox='0 40 700 700' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M608 64H32C14.33 64 0 78.33 0 96v320c0 17.67 14.33 32 32 32h160.22c25.19 0 48.03-14.77 58.36-37.74l27.74-61.64C286.21 331.08 302.35 320 320 320s33.79 11.08 41.68 28.62l27.74 61.64C399.75 433.23 422.6 448 447.78 448H608c17.67 0 32-14.33 32-32V96c0-17.67-14.33-32-32-32zM160 304c-35.35 0-64-28.65-64-64s28.65-64 64-64 64 28.65 64 64-28.65 64-64 64zm320 0c-35.35 0-64-28.65-64-64s28.65-64 64-64 64 28.65 64 64-28.65 64-64 64z'/%3E%3C/svg%3E";

class VRButton{

	constructor( renderer, options ) {
        this.renderer = renderer;
        if (options !== undefined){
            this.onSessionStart = options.onSessionStart;
            this.onSessionEnd = options.onSessionEnd;
            this.sessionInit = options.sessionInit;
            this.sessionMode = ( options.inline !== undefined && options.inline ) ? 'inline' : 'immersive-vr';
        }else{
            this.sessionMode = 'immersive-vr';
        }
        
       if (this.sessionInit === undefined ) this.sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
        
        if ( 'xr' in navigator ) {

			const button = document.createElement( 'button' );
			button.style.display = 'none';
            button.style.height = '40px';
            
			navigator.xr.isSessionSupported( this.sessionMode ).then( ( supported ) => {

				supported ? this.showEnterVR( button ) : this.showWebXRNotFound( button );
                if (options && options.vrStatus) options.vrStatus( supported );
                
			} );
            
            document.body.appendChild( button );

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; 

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = '0px';
			message.style.width = '100%';
			message.style.textDecoration = 'none';

			this.stylizeElement( message, false );
            message.style.bottom = '0px';
            message.style.opacity = '1';
            
            document.body.appendChild ( message );
            
            if (options.vrStatus) options.vrStatus( false );

		}

    } 

	showEnterVR( button ) {

        let currentSession = null;
        const self = this;
        
        this.stylizeElement( button, true, 30, true );
        
        function onSessionStarted( session ) {

            session.addEventListener( 'end', onSessionEnded );

            self.renderer.xr.setSession( session );
            self.stylizeElement( button, false, 12, true );
            
            button.textContent = 'END GAME';

            currentSession = session;
            
            if (self.onSessionStart !== undefined) self.onSessionStart();

        }

        function onSessionEnded( ) {

            currentSession.removeEventListener( 'end', onSessionEnded );

            self.stylizeElement( button, true, 12, true );
            button.style.display = '';
            button.style.right = '50%';
            button.style.width = '100px';
            button.style.transform = 'translateX(50%)';
            button.style.cursor = 'pointer';
            button.innerHTML = `<img src = "${svg}" alt="VR Cardboard" style="margin-left: 6px"/>`;

            currentSession = null;
            
            if (self.onSessionEnd !== undefined) self.onSessionEnd();

        }

        //

        button.style.display = '';
        button.style.right = '50%';
        button.style.width = '100px';
        button.style.height = '56px';
        button.style.bottom = '30px';
        button.style.transform = 'translateX(50%)';
        button.style.cursor = 'pointer';
        button.innerHTML = `<img src = "${svg}" alt="VR Cardboard" style="margin-left: 6px"/>`;
        

        button.onmouseenter = function () {
            
            button.style.fontSize = '12px'; 
            button.textContent = (currentSession===null) ? 'PLAY GAME' : 'EXIT GAME';
            button.style.opacity = '1.0';

        };

        button.onmouseleave = function () {
            
            button.style.fontSize = '30px'; 
            button.innerHTML = `<img src = "${svg}" alt="VR Cardboard" style="margin-left: 6px"/>`;
            button.style.opacity = '0.5';

        };

        button.onclick = function () {

            if ( currentSession === null ) {

                // WebXR's requestReferenceSpace only works if the corresponding feature
                // was requested at session creation time. For simplicity, just ask for
                // the interesting ones as optional features, but be aware that the
                // requestReferenceSpace call will fail if it turns out to be unavailable.
                // ('local' is always available for immersive sessions and doesn't need to
                // be requested separately.)

                navigator.xr.requestSession( self.sessionMode, self.sessionInit ).then( onSessionStarted );

            } else {

                currentSession.end();

            }

            if (self.onClick) self.onClick();

        };

    }

    disableButton(button) {

        button.style.cursor = 'auto';
        button.style.opacity = '0.5';
        
        button.onmouseenter = null;
        button.onmouseleave = null;

        button.onclick = null;

    }

    showWebXRNotFound( button ) {
        this.stylizeElement( button, false );
        
        this.disableButton(button);

        button.style.display = '';
        button.style.width = '100%';
        button.style.right = '0px';
        button.style.bottom = '0px';
        button.style.border = '';
        button.style.opacity = '1';
        button.style.fontSize = '13px';
        button.textContent = 'VR NOT SUPPORTED';
        
        

    }

    stylizeElement( element, active = true, fontSize = 13, ignorePadding = false ) {

        element.style.position = 'absolute';
        element.style.bottom = '20px';
        if (!ignorePadding) element.style.padding = '12px 6px';
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = (active) ? 'rgba(20,150,80,1)' : 'rgba(180,20,20,1)';
        element.style.color = '#fff';
        element.style.font = `normal ${fontSize}px sans-serif`;
        element.style.textAlign = 'center';
        element.style.opacity = '0.5';
        element.style.outline = 'none';
        element.style.zIndex = '999';

    }
};

export { VRButton };