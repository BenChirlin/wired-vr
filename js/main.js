/*
Setup Three.js WebGL renderer
*/
var renderer = new THREE.WebGLRenderer( { antialias: true } );

/*
Append the canvas element created by the renderer to document body element.
*/
document.body.appendChild( renderer.domElement );

/*
Create a Three.js scene
*/
var scene = new THREE.Scene();

/*
Create a Three.js camera
*/
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0, 10000 );

/*
Apply VR headset positional data to camera.
*/
var controls = new THREE.VRControls( camera );

/*
Apply VR stereo rendering to renderer
*/
var effect = new THREE.VREffect( renderer );
effect.setSize( window.innerWidth, window.innerHeight );


/*============= START OF SCENE SETUP CODE =============*/

/*
Create 3d objects
*/
var geometry = new THREE.BoxGeometry( 2, 2, 2 );

// Number of objects to place per row
var perRow = 12;
// Total objects
var totalObjects = 120;
// Total rows
var totalRows = Math.ceil( totalObjects / perRow );
// Get angle between objects
var angle = ( 2 * Math.PI ) / perRow;
// Current row
var currentRow = ( totalObjects / perRow ) - 1;

// Collection of covers
var covers = new Array();

for ( var i = 0; i < totalObjects; i++ ) {
    // Get objects row
    var row = Math.floor( i / perRow );
    // Calculate year based on row and index
    var coverYear = 1994 + row;
    var coverMonth = ( i % perRow ) + 1;
    // Pad cover month
    if ( coverMonth < 10 ) {
        coverMonth = '0' + coverMonth;
    }
    var material = new THREE.MeshBasicMaterial( {
        map: THREE.ImageUtils.loadTexture( '../covers/' + coverYear + '_' + coverMonth + '.jpg' )
    } );

    var object = new THREE.Mesh( geometry, material );

    // Set X and Z such that boxes make ring around origin
    object.position.x = Math.cos( angle * ( i % perRow ) ) * 6;
    object.position.z = Math.sin( angle * ( i % perRow ) ) * 6;
    // Offset Y so camera is staring at middle row
    object.position.y = ( ( row - totalRows ) * 4 ) + 4;

    // Compensate for position and rotate back towards origin
    object.rotation.y = ( Math.PI / 2 ) - ( angle * ( i % perRow ) );

    // Scale object to magaziney shape
    object.scale.x = 1;
    object.scale.y = 1.6;
    object.scale.z = 0.1;

    // Init year array in collection
    if ( i % perRow === 0 ) {
        covers[ row ] = new Array();
    }
    // Add object to covers array
    covers[ row ].push( object );
    // Add object to scene
    scene.add( object );

}

/*============= END OF MOCKUP-RELATED CODE =============*/

// Animation control object
var animator = {
    // Current animation callback
    active: null,
    // Direction of current animation
    direction: 0,
    // Limit of current animation
    limit: 0,
    // Last position of current animation
    last: 0,

    execute: function() {
        // If there is an active animation that is not past its limit, animate
        if ( this.active && this.last < this.limit ) {
            this.last += this.active( this.direction );
        } else {
            this.reset();
        }
    },

    changeRow: function( offset ) {
        // Set active animation callback
        this.active = function( dir ) {
            // Loop through all issues and animate along Y * offset (up or down)
            _.each( covers, function( year ) {
                _.each( year, function( issue ) {
                    issue.position.y += 0.02 * dir;
                } );
            } );

            return 0.02 * dir;
        };
        // Set direction
        this.direction = offset;
        // Set limit (i.e. how far to move)
        this.limit = 4.0;
    },

    rotateRow: function( offset ) {
        // Set active animation callback
        this.active = function( dir ) {
            // Loop through all issues and animate along Y * offset (up or down)
            _.each( covers, function( year ) {
                _.each( year, function( issue ) {
                    issue.position.y += 0.02 * dir;
                } );
            } );

            return 0.02 * dir;
        };
        // Set direction
        this.direction = offset;
        // Set limit (i.e. how far to move)
        this.limit = 4.0;
    },

    reset: function() {
        // Reset starting variables
        this.active = null;
        this.direction = this.limit = this.last = 0;
    }
}

/*
Request animation frame loop function
*/
function animate() {
    /*
    Apply animations
    */
    animator.execute();

    /*
    Update VR headset position and apply to camera.
    */
    controls.update();

    /*
    Render the scene through the VREffect.
    */
    effect.render( scene, camera );

    requestAnimationFrame( animate );
}

/*
Kick off animation loop
*/
animate();

/*
Listen for double click event to enter full-screen VR mode
*/
document.body.addEventListener( 'dblclick', function() {
    effect.setFullScreen( true );
});

/*
Listen for keyboard events to zero positional sensor or enter full-screen VR mode.
*/
function onkey(event) {

    if (!(event.metaKey || event.altKey || event.ctrlKey)) {
        event.preventDefault();
    }

    if (event.charCode == 'z'.charCodeAt(0)) { // z
        controls.zeroSensor();
    } else if (event.charCode == 'f'.charCodeAt(0)) { // f
        effect.setFullScreen( true );
    } else if (event.charCode == 'w'.charCodeAt(0)) { // w
        animator.changeRow( -1 );
    } else if (event.charCode == 's'.charCodeAt(0)) { // s
        animator.changeRow( 11 );
    }
};

window.addEventListener("keypress", onkey, true);

/*
Handle window resizes
*/
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );