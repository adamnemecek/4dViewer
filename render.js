/**
require math.js;
require shape.js;
require webgl.js;

reserved:
	Scene, Camera3, Camera4, Renderer4
**/
'use strict';

var Scene = function(){
	this.child = [];
}
Scene.prototype.add = function(s){
	this.child.push(s);
}
var Camera3 = function(fov,nz,fz){
	Obj3.call(this);
	this.setProjectMat(fov,nz,fz);
}
Camera3.prototype = Object.create(Obj3.prototype);
Camera3.prototype.setProjectMat = function(fov,nz,fz,w_h){
	if(!fov)return new Mat4(1,0,0,0,0,1,0,0,0,0,0.01,0,0,0,0,1);//Orthographic Camera
	w_h = w_h||1;
	var ctg = 1/Math.tan(Math.PI/360*fov);
	this.projectMat = new Mat4(
		ctg/w_h,0,0,0,
		0,ctg,0,0,
		0,0,(nz+fz)/(nz-fz),2*nz*fz/(nz-fz),
		0,0,-1,0
	);
}

var Camera4 = function(fov,nz,fz){
	Obj4.call(this);
	this.setProjectMat4(fov,nz,fz);
}
Camera4.prototype = Object.create(Obj4.prototype);
Camera4.prototype.setProjectMat4 = function(fov,nz,fz){
	this.fov = fov;
	if(fov){
		this.nz = nz;
		this.fz = fz;
		this.projectMat = {
			ctg : 1/Math.tan(Math.PI/360*fov),
			mtt : (nz+fz)/(nz-fz),
			mtw : 2*nz*fz/(nz-fz)
		}
	}
}
Camera4.prototype.project = function(p){
	if(!this.fov)return p;
	var m = this.projectMat;
	var a = -m.ctg/p.t;
	p.t = -m.mtt - m.mtw/p.t;
	p.x *= a;
	p.y *= a;
	p.z *= a;
}

var Renderer4 = function(ctxtL,ctxtR,scene4,camera4,light4,camera3){
	this.glL = ctxtL;
	this.glR = ctxtR;
	this.scene4 = scene4;
	this.camera4 = camera4;
	this.camera3 = camera3 || new Camera3(15,1,20);//don't use position infomation, it's decided par eyeDistanceF/H;
	this.camera3.rotation = new Vec3(1,0,0).expQ(Math.PI/8).mul(new Vec3(0,1,0).expQ(Math.PI/6));
	this.bgColor4 = 0x33FFFF;//sky
	this.bgColor3 = 0xFFFFFF;//background
	this.light4 = light4.norm() || new Vec4(2,1,0.3,-5).norm();
	this.eyeDistanceF = 10;
	this.eyeDistanceH = 0.5;
	this.eyeDistance4 = 0.15;
	this.thickness = 0.08;
	this.width = this.glL.canvas.width;
	this.height = this.glL.canvas.height;
	this.aspect = this.width/this.height;
	this.center = new Vec2(this.width/2,this.height/2);
	this._initGL(this.glL);
	this._initGL(this.glR);
	this.opaqueColors = [
		{
			color: 0x33FFFF,
			tolerance: 0
		},
		{
			color: 0x004E00,
			tolerance: 0
		},
		{
			color: 0x000000,
			tolerance: 0
		},
		{
			color: 0x000000,
			tolerance: 0
		}
	]
}
Renderer4.ShaderProgram = {
	cross4D: {
		F: `
		precision highp float;
		varying vec3 vcolor;
		void main(void) {
			gl_FragColor=vec4(vcolor,1.0);
		}
		`,
		V: `
		attribute vec4 V, N;
		attribute vec3 color;
		varying vec3 vcolor;
		uniform mat4 mCamera, mN;
		uniform vec4 light;
		uniform float dx, dx4;
		uniform vec3 mCamera4;
		void main(void) {
			vec4 v = vec4(vec3(V.x+dx4,V.yz)*mCamera4.x,V.w*mCamera4.y+mCamera4.z);
			float Vt = -V.w;
			//vec5(v,vt) est gl_Position4
			vec4 pos = mCamera*vec4(v.xyz,-Vt);
			//drop vw, and get gl_Position3
			float angleCos = dot(N,mN*light);
			gl_Position = vec4(pos.x - dx*pos.w, pos.y, -0.2, pos.w);
			//but I can't explain why z = -0.2
			if(angleCos > 0.0){
				vcolor = color*angleCos; //Front
			}else{
				vcolor = -color*angleCos*0.3; //Behind
			}
		}
		`,
		attribute:{
			"vec4 V":{},
			"vec4 N":{},
			"vec3 color":{}
		},
		uniform:{
			"mat4 mCamera":{},
			"vec3 mCamera4":{},//vec3(ctg,mtt,mtw)
			"mat4 mN":{},
			"vec4 light":{},
			"float dx":{},//déplacement of eye3d
			"float dx4":{}//déplacement of eye4d
		}
	},
	fbo4D: {
		F: `
		precision highp float;
		varying vec4 coord;
		uniform sampler2D texture0;
		uniform float flow;
		uniform vec4 oC0;
		uniform vec4 oC1;
		uniform vec4 oC2;
		uniform vec4 oC3;
		float opacity(vec3 cc){
			return 1.0;
				- clamp(1.0-distance(oC0.rgb, cc)*oC0.a,0.0,1.0)*0.9
				- clamp(1.0-distance(oC1.rgb, cc)*oC1.a,0.0,1.0)*0.9
				- clamp(1.0-distance(oC2.rgb, cc)*oC2.a,0.0,1.0)*0.9
				- clamp(1.0-distance(oC3.rgb, cc)*oC3.a,0.0,1.0)*0.9;
		}
		void main(void) {
			vec3 color1 = texture2D(texture0, coord.xy/coord.w/2.0+vec2(0.5,0.5)).rgb;
			gl_FragColor=vec4(color1,clamp(flow*opacity(color1),0.0,1.0));
		}
		`,
		V: `
		attribute vec4 V;
		varying vec4 coord;
		uniform mat4 mCamera;
		uniform float dx;
		uniform vec3 mCamera4;
		void main(void) {
			vec4 v = vec4(V.xyz*mCamera4.x,V.w*mCamera4.y+mCamera4.z);
			vec4 pos = mCamera*vec4(v.xyz,1.0);
			coord = vec4(pos.x - dx*pos.w,pos.yzw); 
			gl_Position = coord;
		}
		`,
		attribute:{
			"vec4 V":{}
		},
		uniform:{
			"mat4 mCamera":{},
			"vec3 mCamera4":{},//vec3(ctg,mtt,mtw)
			"float dx":{},//déplacement of eye3d
			"float flow":{},//opacity per layer
			"vec4 oC0":{},//opaqueColor
			"vec4 oC1":{},//opaqueColor
			"vec4 oC2":{},//opaqueColor
			"vec4 oC3":{}//opaqueColor
		}
	}
}

Renderer4.prototype._initGL = function(gl){
	Webgl(gl);
	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, this.width, this.height);
	
	gl.crossProgram = new Webgl.ShaderProgram(gl,Renderer4.ShaderProgram.cross4D);
	gl.crossProgram.use();
	gl.crossProgram.uniform["vec4 light"].set(this.light4.flat());
	gl.VBuffer = new Webgl.ArrayBuffer(gl);
	gl.NBuffer = new Webgl.ArrayBuffer(gl);
	gl.CBuffer = new Webgl.ArrayBuffer(gl);
	gl.crossProgram.attribute["vec4 V"].bind(gl.VBuffer);
	gl.crossProgram.attribute["vec4 N"].bind(gl.NBuffer);
	gl.crossProgram.attribute["vec3 color"].bind(gl.CBuffer);
	gl.FBuffer = new Webgl.ElementBuffer(gl);
	
	gl.fboProgram = new Webgl.ShaderProgram(gl,Renderer4.ShaderProgram.fbo4D);
	gl.VfboBuffer = new Webgl.ArrayBuffer(gl);
	
	gl.fbo = gl.addFBO(this.width,this.height);
	gl.fbolink1 = gl.addFBOLink(gl.crossProgram.program,0);
	gl.fbolink2 = gl.addFBOLink(gl.fboProgram.program,1);
}
Renderer4.prototype.render = function(){
	var _this = this;
	this.glL.viewport(0, 0, this.width, this.height);
	this.glR.viewport(0, 0, this.width, this.height);
	this.glL.clearColor((_this.bgColor3 >> 16)/256,(_this.bgColor3>> 8 & 0xFF)/256,(_this.bgColor3 & 0xFF)/256, 1.0);
	this.glL.clear(this.glL.COLOR_BUFFER_BIT | this.glL.DEPTH_BUFFER_BIT);
	this.glR.clearColor((_this.bgColor3 >> 16)/256,(_this.bgColor3>> 8 & 0xFF)/256,(_this.bgColor3 & 0xFF)/256, 1.0);
	this.glR.clear(this.glR.COLOR_BUFFER_BIT | this.glR.DEPTH_BUFFER_BIT);
	this.MeshBuffer = new Mesh4();//empty MeshBuffer
	this.scene4.child.forEach(function(e){
		_this.transGeom(e); //join into MeshBuffer
	});
	this.dealMeshBuffer();
	var mt = 0.99/this.camera4.projectMat.ctg;
	this.viewport4 = Mesh3.cube(2/this.camera4.projectMat.ctg).embed(true).move(new Vec4(0,0,0,1));
	var r = this.camera3.rotation.toMatLR().array;
	
	_setEyeMatrix(this.glL,new Vec3(-this.eyeDistanceH,0,-this.eyeDistanceF));
	_setEyeMatrix(this.glR,new Vec3(this.eyeDistanceH,0,-this.eyeDistanceF));
	var oc = this.opaqueColors;
	this._opaqueColor = [
		[(oc[0].color>> 16)/256,(oc[0].color>>8 & 0xFF)/256,(oc[0].color & 0xFF)/256, oc[0].tolerance||1e10],
		[(oc[1].color>> 16)/256,(oc[1].color>>8 & 0xFF)/256,(oc[1].color & 0xFF)/256, oc[1].tolerance||1e10],
		[(oc[2].color>> 16)/256,(oc[2].color>>8 & 0xFF)/256,(oc[2].color & 0xFF)/256, oc[2].tolerance||1e10],
		[(oc[3].color>> 16)/256,(oc[3].color>>8 & 0xFF)/256,(oc[3].color & 0xFF)/256, oc[3].tolerance||1e10]
	];
	function _setEyeMatrix(gl,pos){
		var m = _this.camera3.projectMat;
		gl.Mat = _this.camera3.projectMat.mul(new Mat4(
			r[0],r[1],r[2],pos.x,
			r[3],r[4],r[5],pos.y,
			r[6],r[7],r[8],pos.z,
			0,0,0,1
		),false).t();
		var dx = _this.camera3.projectMat.mul(
			new Vec4(pos.x,pos.y,pos.z,1)
		);
		gl.dx = dx.x/dx.t;
		gl.dx4 = 0;
	}
	if(this.thickness>=1){
		this.renderCrossSection(new Vec4(0,0,1,mt*i),true,false);
	}else{
		for(var i = 0; i <= 1; i += this.thickness);
		while(i >= -1){
			this.renderCrossSection(new Vec4(0,0,1,mt*i),false,false);
			i -= this.thickness;
		}
		//thumbnail
		this.renderCrossSection(new Vec4(0,0,1,0),true,true);
	}
}

Renderer4.prototype.renderCrossSection = function(frustum,mode3d,thumbnail){
	var _this = this;
	var m = this.camera4.projectMat;
	var G = _this.MeshBuffer.crossSection(0,frustum).flat();
	var mN = this.camera4.rotation[0].toMatL().mul(this.camera4.rotation[1].toMatR());
	var viewport4 = this.viewport4.crossSection(0,frustum).flat();
	if(mode3d){
		this.glL.dx4 = -this.eyeDistance4;
		this.glR.dx4 = this.eyeDistance4;
	}
	_renderCrossEye(this.glL);
	_renderCrossEye(this.glR);
	function _renderCrossEye(gl){
		gl.crossProgram.use();
		gl.crossProgram.attribute["vec3 color"].bind(gl.CBuffer);
		gl.crossProgram.attribute["vec4 V"].bind(gl.VBuffer);
		gl.crossProgram.attribute["vec4 N"].bind(gl.NBuffer);
		gl.VBuffer.set(G.v,true);
		gl.NBuffer.set(G.n,true);
		gl.FBuffer.set(G.f,true);
		gl.CBuffer.set(G.c,true);
		gl.crossProgram.uniform["float dx"].set(gl.dx);
		gl.crossProgram.uniform["float dx4"].set(gl.dx4);
		gl.crossProgram.uniform["mat4 mCamera"].set(gl.Mat.array);
		gl.crossProgram.uniform["vec3 mCamera4"].set([m.ctg,m.mtt,m.mtw]);
		gl.crossProgram.uniform["mat4 mN"].set(mN.array);
		
		gl.fbolink1.use([],gl.fbo);
		gl.clearColor((_this.bgColor4 >> 16)/256,(_this.bgColor4>> 8 & 0xFF)/256,(_this.bgColor4 & 0xFF)/256, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawFaces(gl.FBuffer);
		gl.fboProgram.use();
		gl.fboProgram.uniform["float dx"].set(gl.dx);
		gl.fboProgram.uniform["mat4 mCamera"].set(gl.Mat.array);
		gl.fboProgram.uniform["vec3 mCamera4"].set([m.ctg,m.mtt,m.mtw]);
		gl.fboProgram.uniform["float flow"].set(_this.thickness);
		gl.fboProgram.uniform["vec4 oC0"].set(_this._opaqueColor[0]);
		gl.fboProgram.uniform["vec4 oC1"].set(_this._opaqueColor[1]);
		gl.fboProgram.uniform["vec4 oC2"].set(_this._opaqueColor[2]);
		gl.fboProgram.uniform["vec4 oC3"].set(_this._opaqueColor[3]);
		gl.fboProgram.attribute["vec4 V"].bind(gl.VfboBuffer);
		gl.VfboBuffer.set(viewport4.v,true);
		gl.FBuffer.set(viewport4.f,true);
		gl.fbolink2.use([gl.fbo],null);
		if(!thumbnail){
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.drawFaces(gl.FBuffer);
			gl.disable(gl.BLEND);
		}else{
			gl.disable(gl.DEPTH_TEST);
			gl.viewport(0, 0, _this.width/4, _this.height/4);
			gl.drawFaces(gl.FBuffer);
			gl.enable(gl.DEPTH_TEST);
		}
		
		gl.fbolink2.release();
	}
}

Renderer4.prototype.transGeom = function(e){
	var _this = this;
	var M = e.mesh.clone().rotate(e.rotation).move(e.position.sub(this.camera4.position,false)).rotate([this.camera4.rotation[0].conj(false),this.camera4.rotation[1].conj(false)]);
	for(var c of M.C){
		
		c.info = c.info || {color: e.color};
	}
	this.MeshBuffer.join(M);
}
Renderer4.prototype.dealMeshBuffer = function(){
	var _this = this;
	var M = this.MeshBuffer;
	for(var e of this.MeshBuffer.E){
		e.centerMul2 = (M.V[e[0]].add(M.V[e[1]],false));
			//e:[i,j] have attribute center, todo : performace problem
	}
	for(var f of this.MeshBuffer.F){
		var sum = 0;
		var O = new Vec4(0,0,0,0);
		var centers = [];//vec3[]
		for(var i=0; i<f.length; i++){
			var e = this.MeshBuffer.E[f[i]];
			O.add(e.centerMul2);
			centers.push(e.centerMul2);
		}
		f.center = O.div(centers.length*2);//before edge center is mul by 2
		if(!centers.length) continue;//this face is not visible
		centers.push(new Vec4(0,0,0,0));
		//f.n = $$._Mesh._calNorm4FromPoints(centers);
	}
	for(var c of this.MeshBuffer.C){
		var sum = 0;
		var O = new Vec4(0,0,0,0);
		var centers = [];
		c.E = [];//store edge index to avoid clip
		for(var i=0; i<c.length; i++){
			var f = this.MeshBuffer.F[c[i]];
			O.add(f.center);
			centers.push(f.center);
		}
		c.center = O.div(centers.length);
		if(!centers.length) continue;//this face is not visible
		var cn = Mesh4._util.calNorm4FromPoints(centers);
		if(!cn){
			continue;
		}
		var ct = c.center.dot(cn);
		if (ct == 0){
			c.length = 0;
			continue;
		}if(ct>0){
			cn.sub();
			ct = -ct;
		}
		c.info.normal = cn;
	}
}
