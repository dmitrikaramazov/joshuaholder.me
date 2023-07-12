// Misc Globals
var maxAmount = 5;
var recAmount = 0;
var whichSurf = 7;
var triangles = [];
var size = 0.5;
var drawBase = 1;

// Helper math functions 
function midpt(u,v){
	var w = [0,0,0];
	for( i=0; i<3; i++) {
		w[i] = 0.5 * (u[i] + v[i]);
	}
	return w;
};
function dist(u,v){
	var d = Math.sqrt(Math.pow(u[0]-v[0],2)+Math.pow(u[1]-v[1],2)+Math.pow(u[2]-v[2],2));
	return d;
};
function normalize(a){
	magnitude = Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2));
	e = [a[0]/magnitude, a[1]/magnitude, a[2]/magnitude];
	return e;
};
function cross(u,v) {
	w = [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
	return w;
};

// Initial Octahedron  coordinates and dimensions
var w = 1;
var x = 1;
var y = 1;
var z =  (Math.sqrt(2));
var height = Math.sqrt(6.0)/3.0;
var vv = [[0.0,0.0,size*z],
		  [0.0,0.0,-1*size*z],
		  [size*x,size*y,0.0],
		  [-1*size*x,size*y,0.0],
		  [size*x,-1*size*y,0.0],
		  [-1*size*x,-1*size*y,0.0]];

// Extrude according to the crossproduct 
// u is the point where the peak will appear above 
// v, w are the nearest neighbor corners
function extrudeCross(u,v,w) {
	var tmpsize = 1;
	var peak=[];
    var center=[(u[0]+v[0]+w[0])/3,(u[1]+v[1]+w[1])/3,(u[2]+v[2]+w[2])/3];
    var line1=[u[0]-v[0],u[1]-v[1],u[2]-v[2]];
    var line2=[u[0]-w[0],u[1]-w[1],u[2]-w[2]];
    var n=normalize(cross(line1,line2));
    var realHeight=height*dist(u,v);
	
    var peak=[center[0]+realHeight*n[0]*tmpsize,center[1]+realHeight*n[1]*tmpsize,center[2]+realHeight*n[2]*tmpsize];
    return peak;
};

// Calculate mini triangles of extruding tetrahedra 
function calcTris(v1,v2,v3,recDepth=0) {
	if(recDepth==whichSurf){ return; }
	
	var c1 = midpt(v1,v2);
	var c2 = midpt(v1,v3);
	var c3 = midpt(v2,v3);
	
	var peak1 = extrudeCross(c1,c2,c3);
	
	recDepth += 1;
	
	if( recDepth <= recAmount){
		calcTris(c2, c1, peak1, recDepth);
		
		triangles.push(c1);
		triangles.push(c2);
		triangles.push(peak1);
		
		calcTris(c1,c3,peak1,recDepth);
		triangles.push(c1);
		triangles.push(c3);
		triangles.push(peak1);
		
		calcTris(c3,c2,peak1,recDepth);
		triangles.push(c2);
		triangles.push(c3);
		triangles.push(peak1);
		
		// Outter Triangles 
		calcTris(c1,c2,v1,recDepth);
		calcTris(c3,c1,v2,recDepth);
		calcTris(c2,c3,v3,recDepth);
		
	}
};

// Load positions extruding tetrahedra
function minitetra(){
	triangles=[];
   calcTris(vv[0],vv[3],vv[2]); //xy,-xy,z
   calcTris(vv[0],vv[5],vv[3]); //-xy,-x-y,z
   calcTris(vv[0],vv[4],vv[5]); //-x-y,x-y,z
   calcTris(vv[0],vv[2],vv[4]); //x-y,xy,z
   
   
   // -z 
   calcTris(vv[1],vv[2],vv[3]); //xy,-xy,z
   calcTris(vv[1],vv[3],vv[5]); //-xy,-x-y,z
   calcTris(vv[1],vv[5],vv[4]); //-x-y,x-y,z
   calcTris(vv[1],vv[4],vv[2]); //x-y,xy,
   
};

// Draw extruding tetrahedron
function drawfractal() {
	glBegin(GL_TRIANGLES);
	for(i=0; i < triangles.length ; i++){
		var colorIndex = i%3;
		var color = colors[colorIndex];
		glColor3f(color[0],color[1],color[2]);
		glVertex3fv(triangles[i]);
		
	}
	glEnd();
}

// Draw initial polyhedron
function drawocta() {
	glBegin(GL_TRIANGLES);
	glColor3f(1,1,1); // xy,-xy,z
	glVertex3fv(vv[2]);
	glVertex3fv(vv[3]);
	glVertex3fv(vv[0]);
	glColor3f(.33,1,0); //xy,-xy,-z
	glVertex3fv(vv[2]);
	glVertex3fv(vv[3]);
	glVertex3fv(vv[1]);
	
	glColor3f(0,.2,1); //-xy,-x-y,z
	glVertex3fv(vv[3]);
	glVertex3fv(vv[5]);
	glVertex3fv(vv[0]);
	
	glColor3f(0.5,1,1); // -xy,-x-y,-z
	glVertex3fv(vv[3]);
	glVertex3fv(vv[5]);
	glVertex3fv(vv[1]);
	
	glColor3f(.04,0.5,1);// -x-y, x-y,z
	glVertex3fv(vv[5]);
	glVertex3fv(vv[4]);
	glVertex3fv(vv[0]);
	glColor3f(.1,.7,0.5);// -x-y, x-y,z
	glVertex3fv(vv[5]);
	glVertex3fv(vv[4]);
	glVertex3fv(vv[1]);
	
	glColor3f(.1,1,0.5);// x-y, xy,z
	glVertex3fv(vv[4]);
	glVertex3fv(vv[2]);
	glVertex3fv(vv[0]);
	glColor3f(1,.25,0.5);// x-y, xy-z
	glVertex3fv(vv[4]);
	glVertex3fv(vv[2]);
	glVertex3fv(vv[1]);
	
	glEnd();
}
function resize(canvas) {
	var displayWidth = canvas.clientWidth;
	var displayHeight = canvas.clientHeight;
	if(canvas.width != displayWidth || canvas.height != displayHeight) {
		wd = displayWidth;
		ht = displayHeight;
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}
}
// Main display loop
function display(){
	resize(canvas);
	jazztrack();
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glClearColor(0,0,0,1);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
    glFrustum(-mysiz*wd/ht, mysiz*wd/ht, -mysiz, mysiz, mysiz*focal, far);
	glMatrixMode(GL_MODELVIEW);
	glEnable(GL_DEPTH_TEST);
	glLoadIdentity();
	glMulMatrix(affmat);
	if(drawBase==1){drawocta();}
	minitetra();
	drawfractal();
	glViewport(0,0,wd,ht);
	requestAnimationFrame(display);
}

// Keyboard and Mouse Input
function doKeyDown(evt) {
	var keyCode = evt.keyCode;
	if(keyCode >= 34 && keyCode <= 40){
		evt.preventDefault();
	}
	if(keyCode == 72 || keyCode == 73){
		if(recAmount == maxAmount){
			recAmount = 0;
		} else {
			recAmount += 1;
		}
	}
	if(keyCode == 74 || keyCode == 68){
		if(recAmount == 0){
			recAmount = maxAmount;
		} else {
			recAmount -= 1;
		}
		
	}
	
    if (keyCode == 70){fore=1-fore;} //fly (f)ore
    if (keyCode == 65){aft=1-aft;}  //fly (a)ft
	if(keyCode == 79 || keyCode == 83){
			// rotate 
			rot = 1 - rot;
			
	}
	if(keyCode == 82){
		drawBase = 1 - drawBase;
	}
	if(keyCode == 90){
		resetGlobals(); 
	}
	 
}
function buttons(keyCode){
	
    if (keyCode == 70){fore=1-fore;} //fly (f)ore
    if (keyCode == 65){aft=1-aft;}  //fly (a)ft
	if(keyCode == 72 || keyCode == 73){
		if(recAmount == maxAmount){
			recAmount = 0;
		} else {
			recAmount += 1;
		}
	}
	if(keyCode == 74 || keyCode == 68){
		if(recAmount == 0){
			recAmount = maxAmount;
		} else {
			recAmount -= 1;
		}
		
	}
	if(keyCode == 79 || keyCode == 83){
			rot = 1 - rot;
	}
	if(keyCode == 82){
		drawBase = 1 - drawBase;
	}
	if(keyCode == 90){
		resetGlobals();
		
	}
}

// drawing globals
var plant = -2.2; // Size of drawings
var affmat = [1,0,0,0, 
              0,1,0,0, 
              0,0,1,0, 
              0,0,plant,1]; 
var canvas = document.getElementById('glCanvas');
var colors = [[1,0,.05], [1,.5,1], [0,0,.5]];

//jazz globals
var rect = canvas.getBoundingClientRect();
var wd = rect['width']; 
var ht = rect['height'];
var MouseX = rect['left'] + wd/2;  //initial mouse x-position 
var MouseY = rect['top'] + ht/2 ;  
var brake = .0001;  // mouse torque factor 
var flymode = 0; // toggle (f)ly/turn
var rot=0; //toggle st(o)p
var fore = 0;  //  fly (f)oreward
var aft = 0;   //  fly backward
var forB=1; //keybutt kludge
var aftB=1; //keybutt kludge
var focal = 2; // frustum parameter
var far = 13; // rear clipping plane
var mysiz = .01; // frustum parameter
var speed = 0.0033; //  of fore/aft camera propagation

function resetGlobals(){
	recAmount = 0;
	plant = -2.2; // Size of drawings
	affmat = [1,0,0,0, 
				0,1,0,0, 
				0,0,1,0, 
				0,0,plant,1]; 	
	brake = .0001;  // mouse torque factor 
	flymode = 0; // toggle (f)ly/turn
	rot=0; //toggle st(o)p
	fore = 0;  //  fly (f)oreward
	aft = 0;   //  fly backward
	forB=1; //keybutt kludge
	aftB=1; //keybutt kludge
	focal = 2; // frustum parameter
	far = 13; // rear clipping plane
	mysiz = .01; // frustum parameter
	speed = 0.0033; //  of fore/aft camera propagation
	drawBase = 1;
}

//////////////////MINIMOUSER//////////////////
function  doMouseMove(evt) { MouseX= evt.clientX; MouseY= evt.clientY; }
canvas.addEventListener('mousemove', 
                         function(evt){doMouseMove(evt);}, 
                         false); 

/////////////////////////  JAZZTRACK ///////////////////// 
function jazztrack(){
        var dx,dy,m0,m1,m2,tmp;
        dx= (MouseX - ( rect['x'] + wd/2))*brake; 
        dy= (MouseY - ( rect['y'] + ht/2))*brake; 
        //console.log(dx,dy);
        m0=affmat[12]; var m1=affmat[13]; var m2=affmat[14];
        tmp=mat4.create();
        if(flymode==0)mat4.translate(tmp, tmp,[m0,m1,m2]);
        if(rot==0){
          mat4.rotate(tmp,tmp,dx,[0,1,0]);
          mat4.rotate(tmp,tmp,dy,[1,0,0]);
        };
        if(fore==1){mat4.translate(tmp,tmp,[0,0,speed]); fore=forB?1:0;}
        if(aft==1){mat4.translate(tmp,tmp,[0,0,-speed]); aft =aftB?1:0;}
        if(flymode==0)mat4.translate(tmp,tmp,[-m0,-m1,-m2]);
        mat4.mul(affmat,tmp,affmat);
} //END jazztrack

function init(){
	var slider = document.getElementById("myRange");
	// Update the current slider value (each time you drag the slider handle)
	slider.oninput = function() {
		height = this.value /100;
	}
	glsimUse('glCanvas');
	glClearColor(0.0,0.0,0.0,1.0);
	glEnable(GL_DEPTH_TEST);
	window.addEventListener('keydown',doKeyDown,false);	
	display();
}

function main(){
	init();
}