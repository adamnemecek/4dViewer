/**
require math.js;

reserved:
	Obj2, Obj3, Obj4, Chunk4,
	Mesh2, Mesh3, Mesh4, Geom2, Geom3, Geom4,
	
Object: Obj (Obj2 || Obj3 || Obj4)
	
	Construct Obj:
	
		Obj2(Vec2 pos, Number rot);
		Obj3(Vec3 pos, Vec4 rot);
		Obj4(Vec4 pos, Vec4[2] rot);
	
	Methodes:
	
		Obj.move(Vec p):Obj;
		Obj.coord(Vec p): Vec; transform Point p
		Obj.coordMat(): Mat; affine Mat(n+1)*(n+1), only surpport n<4
		
		Obj2.rotate(Number s):Obj2;
		Obj3.rotate(Vec3 axis[, Number s]):Obj3;
		Obj3.rotate(Vec4 quanternion):Obj3;
		Obj4.rotate(Bivec axis[, Number s]):Obj4;
		Obj4.rotate(Vec4[2] quanternion):Obj4;

Geometry: Geom extends Obj (Geom2 || Geom3 || Geom4)
	
	Construct Geom:
	
		Geom2(Mesh2 m) extends Obj2;
		Geom3(Mesh3 m) extends Obj3;
		Geom4(Mesh4 m) extends Obj4;
	
Mesh: (Mesh2 || Mesh3 || Mesh4)
	
	Construct Mesh:
	
		Mesh2({V:Vec2[],E:int[][2]} data);
		Mesh3({V:Vec3[],E:int[][2],F:int[][]} data);
		Mesh4({V:Vec4[],E:int[][2],F:int[][],C:int[][]} data);
	
	Mesh Libraries:
	
		Mesh2.polygon(Number r, int n);
		Mesh2.rectangle(Number w, Number h);
		
		Mesh3.cube(Number r);
		Mesh3.cuboid(Number a,Number b,Number c);
		Mesh3.cylinder(Number r, int n,h);
		Mesh3.cone(Number r, int n, Number h);
		Mesh3.sphere(Number r, int u, int v);
		Mesh3.torus(Number r, Number R, int u, int v);
		
		Mesh4.tesseract(Number r);		Mesh4.glome(Number r, int u, int v, int w);		Mesh4.spherinder(Number r, int u, int v, Number h);		Mesh4.sphone(Number r, int u, int v, Number h);		Mesh4.duocylinder(Number R1, Number R2, int u, int v);		Mesh4.cubinder(Number r, int n, Number h1, Number h2);		Mesh4.cylindrone(Number r, int n, Number h, Number hc);		Mesh4.dicone(Number r, int n, Number h1, Number h2);		Mesh4.duocone(Number R1, Number R2, int u, int v);		Mesh4.coninder(Number r, int n, Number h, Number hc);		Mesh4.torinder(Number r, Number R, int u, int v, Number h);		Mesh4.spheritorus(Number r, Number R, int u, int v, int w);		Mesh4.torisphere(Number r, Number R, int u, int v, int w);		Mesh4.ditorus(Number r, Number Rr, Number R, int u, int v, int w);		Mesh4.tiger(Number r, Number R1, Number R2, int u, int v, int w);
		
		//todo: polytopes and polytwisters
	
	common operations:
		
		Note: flag===true -> insert face or cell; else: no insertion
	
		Mesh.clone():Mesh;
		Mesh.move(Vec v):Mesh; translate vertices
		Mesh.apply(function(Vec v) f):Mesh; apply function f to each vertex
		Mesh.join(Mesh m):Mesh;
	
		Mesh2.rotate(Number s):Mesh2;
		Mesh3.rotate(Vec3 axis[, Number s]):Mesh3;
		Mesh3.rotate(Vec4 quanternion):Mesh3;
		Mesh4.rotate(Bivec axis[, Number s]):Mesh4;
		Mesh4.rotate(Vec4[2] quanternion):Mesh4;
		
		Mesh2.embed(int d=3, bool flag[, Vec3 x, Vec3 y]):Mesh3;
		Mesh2.embed(int d=4, bool flag[, Vec4 x, Vec4 y]):Mesh4;
		Mesh3.embed(bool flag[, Vec4 x, Vec4 y, Vec4 z]):Mesh4;
		
	constructional operators:
		
		Note - flag for Mesh.loft:
			flag===true -> insert; flag===false -> loop; else: no insertion
		Note - flag for Mesh.turning:
			flag===false: half turing and form loop; else: full turing loop
		
		Mesh2.points(Vec2[] v, flag):Mesh2; flag decide whether close loop
		
		Mesh3.pyramid(Vec3 v):Mesh3;
		Mesh3.loft(function(int m, Vec3 v) f, int n, bool flag):Mesh3;
		Mesh3.extrude(Vec3 v, bool flag):Mesh3;
		Mesh3.turning(Vec3 axis, Number n, bool flag):Mesh3;
		Mesh3.crossSection(Number t, Vec3 n):Mesh3;
		
		Mesh4.pyramid(Vec3 v):Mesh3;
		Mesh4.loft(function(int m, Vec3 v) f, int n, bool flag):Mesh4;
		Mesh4.extrude(Vec4 v, bool flag):Mesh4;
		Mesh4.turning(Bivec b, Number n, bool flag):Mesh4;
		Mesh4.crossSection(Number t, Vec4 n):Mesh4;
		
		Mesh4.directProduct(Mesh4 m1, Mesh4 m2):Mesh4;
		Mesh4.duopyramid(Mesh4 m1, Mesh4 m2):Mesh4;
		
	output operations:
	
		Mesh3.smoothFlat():{v:Number[],n:int[],f:int[]};
		Mesh3.flat():{v:Number[],n:int[],f:int[]};
		Mesh3.triangulate():Mesh3; attention modify itself, no flag, use clone instead
		Mesh3.collapse():Mesh2;
		Mesh4.collapse():Mesh3;
		
Chunk4:
	
	Construct Chunk4:
	
		Chunk4(int x,y,z,t); size of the chunk
	
	operation:
	
		Chunk4.get(int x,y,z,t):int;
		Chunk4.set(int id, int x,y,z,t):int;
		Chunk4.setCuboid((int||function) id, int x,y,z,t):int;
		Chunk4.offset(int x,y,z,t);
		
		Chunk4.generateMesh():Mesh4;
		
	propriety:
	
		bool Chunk4.enableOffset; whether to use offset coord or absolute coord
**/
'use strict'

var Obj2 = function(pos,rot){
	this.position = pos||new Vec2(0,0);
	this.rotation = rot||0;
}
var Obj3 = function(pos,rot){
	this.position = pos||new Vec3(0,0,0);
	this.rotation = rot||new Vec4(1,0,0,0);//quanternion[R,R*]
}
var Obj4 = function(pos,rot){
	this.position = pos||new Vec4(0,0,0,0);
	this.rotation = [new Vec4(1,0,0,0),new Vec4(1,0,0,0)];//quanternion[L,R]
}

Obj2.prototype.coord = function(p){
	var s = Math.sin(this.rotation),
		c = Math.cos(this.rotation);
	p.set(mat2(c,s,-s,c).mul(p).add(this.position));
	return p;
}
Obj3.prototype.coord = function(p){
	p.set(this.rotation.mul(p).add(this.position));
	return p;
}
Obj4.prototype.coord = function(p){
	p.set(this.rotation[0].mul(p).mul(this.rotation[1]).add(this.position));
	return p;
}
Obj2.prototype.coordMat = function(){//affine mat
	var s = Math.sin(this.rotation),
		c = Math.cos(this.rotation);
	return mat3(
		c,s,this.position.x,
		-s,c,this.position.y,
		0,0,1
	);
}
Obj3.prototype.coordMat = function(){//affine mat
	var r = this.rotation.toMatLR().array;
	return mat4(
		r[0],r[1],r[2],this.position.x,
		r[3],r[4],r[5],this.position.y,
		r[6],r[7],r[8],this.position.z,
		0,0,0,1
	);
}
Obj4.prototype.coordMat = function(){//affine mat not surpported
	console.warning("Affine matrix for 4D Obj is not surpported");
}
Obj2.prototype.move = Obj3.prototype.move = Obj4.prototype.move = function(p){
	this.position.add(p);
	return this;
}
Obj2.prototype.rotate = function(s){
	this.rotation += s;
	return this;
}
Obj3.prototype.rotate = function(axis,s){
	if(axis instanceof Vec4 && !s){//quanternion
		this.rotation = axis.mul(this.rotation,false);
		return this;
	}
	if(axis instanceof Vec3 && !s){
		this.rotation = axis.expQ().mul(this.rotation);
		return this;
	}
	this.rotation = axis.expQ(s).mul(this.rotation);
	return this;
}
Obj4.prototype.rotate = function(bivec,s){
	var R;
	if(bivec[1]){//quanternion [L,R]
		R = [bivec[0],bivec[1]];
	}
	if(typeof s=="number"){
		R = bivec.expQ(s);
	}else{
		R = bivec.expQ();
	}
	this.rotation[0] = R[0].mul(this.rotation[0]);
	this.rotation[1].mul(R[1]);
	return this;
}



var Geom2 = function(m,pos,rot,color){
	if(m instanceof Mesh2) this.mesh = m;
	else throw "Geom2(m): m must be instance of Mesh2";
	Obj2.call(this,pos,rot);
	this.scale = 1;
	this.color = color||0x0000FF;
}
Geom2.prototype = Object.create(Obj2.prototype);
var Geom3 = function(m,pos,rot,color){
	if(m instanceof Mesh3) this.mesh = m;
	else throw "Geom3(m): m must be instance of Mesh3";
	Obj3.call(this,pos,rot);
	this.scale = 1;
	this.color = color||0xFF0000;
}
Geom3.prototype = Object.create(Obj3.prototype);
var Geom4 = function(m,pos,rot,color){
	if(m instanceof Mesh4) this.mesh = m;
	else throw "Geom4(m): m must be instance of Mesh4";
	Obj4.call(this,pos,rot);
	this.scale = 1;
	this.color = color||0x00FF00;
}
Geom4.prototype = Object.create(Obj4.prototype);

/**
	Mesh
**/

var Mesh2 = function(data){
	data = data||{V:[],E:[]};
	this.V = data.V;
	this.E = data.E;
}
var Mesh3 = function(data){
	data = data||{V:[],E:[],F:[]};
	this.V = data.V;
	this.E = data.E;
	this.F = data.F;
}
var Mesh4 = function(data){
	data = data||{V:[],E:[],F:[],C:[]};
	this.V = data.V;
	this.E = data.E;
	this.F = data.F;
	this.C = data.C;
}
Mesh4._util = {
	copyPushArr : function(sour,dest,offset){
		offset = offset || 0;
		sour.forEach(function(a){
			if(a===false)dest.push(a);
			else{
			var a0 = [];
			a.forEach(function(a1){a0.push(a1 + offset);});
			if(a.info) a0.info = a.info;
			dest.push(a0);}
		});
		
	},
	uniqueArr: function(array){
		var r = [];
		for(var i = 0, l = array.length; i < l; i++) {
			for(var j = i + 1; j < l; j++){
				if (array[i] === array[j]) j = ++i;
			}
			r.push(array[i]);
		}
		return r;
	},
	calNorm3FromPoints: function(arr,threshold){
		var N;
		var foo = false;
		threshold = threshold || 0.000000000001;
		for(var i=0; i<arr.length && !foo;i++){
			for(var j=i+1; j<arr.length && !foo;j++){
				for(var k=j+1; k<arr.length && !foo;k++){
					N = arr[i].sub(arr[j],false).cross(arr[i].sub(arr[k],false));
					if(N.len(false)>threshold){
						N.norm();
						foo = true;
					}
				}
			}
		}
		return N;
	},
	calNorm4FromPoints: function(arr,threshold){
		var N;
		var foo = false;
		threshold = threshold || 0.0000000000000000001;
		for(var i=0; i<arr.length && !foo;i++){
			for(var j=i+1; j<arr.length && !foo;j++){
				for(var k=j+1; k<arr.length && !foo;k++){
					for(var l=k+1; l<arr.length && !foo;l++){
						N = arr[i].sub(arr[j],false).cross(arr[i].sub(arr[k],false)).cross(arr[i].sub(arr[l],false));
						if(N.len(false)>threshold){
							N.norm();
							foo = true;
						}
					}
				}
			}
		}
		if(foo) return N;
	}
};
Mesh2.prototype.clone = function(){
	var M = new Mesh2();
	this.V.forEach(function(a){M.V.push(a.clone());});
	Mesh4._util.copyPushArr(this.E,M.E);
	return M;
}
Mesh3.prototype.clone = function(){
	var M = new Mesh3();
	this.V.forEach(function(a){M.V.push(a.clone());});
	Mesh4._util.copyPushArr(this.E,M.E);
	Mesh4._util.copyPushArr(this.F,M.F);
	return M;
}
Mesh4.prototype.clone = function(){
	var M = new Mesh4();
	this.V.forEach(function(a){M.V.push(a.clone());});
	Mesh4._util.copyPushArr(this.E,M.E);
	Mesh4._util.copyPushArr(this.F,M.F);
	Mesh4._util.copyPushArr(this.C,M.C);
	return M;
}

Mesh2.prototype.move = Mesh3.prototype.move = Mesh4.prototype.move = function(p){
	this.V.forEach(function(a){a.add(p);});
	return this;
}
Mesh2.prototype.apply = Mesh3.prototype.apply = Mesh4.prototype.apply = function(f){
	this.V.forEach(function(a){f(a);});
	return this;
}
Mesh2.prototype.join = function(m){
	var V = this.V,
		E = this.E,
		v = V.length;
	m.V.forEach(function(a){V.push(a)});
	m.E.forEach(function(a){if(!a)E.push(a);else E.push([a[0]+v,a[1]+v])});
	return this;
}
Mesh3.prototype.join = function(m){
	var V = this.V,
		E = this.E,
		F = this.F,
		v = V.length,
		e = E.length;
	m.V.forEach(function(a){V.push(a)});
	m.E.forEach(function(a){if(!a)E.push(a);else E.push([a[0]+v,a[1]+v])});
	Mesh4._util.copyPushArr(m.F,this.F,e);
	return this;
}
Mesh4.prototype.join = function(m){
	var V = this.V,
		E = this.E,
		F = this.F,
		C = this.C,
		v = V.length,
		e = E.length,
		f = F.length;
	m.V.forEach(function(a){V.push(a)});
	m.E.forEach(function(a){if(!a)E.push(a);else E.push([a[0]+v,a[1]+v])});
	Mesh4._util.copyPushArr(m.F,this.F,e);
	Mesh4._util.copyPushArr(m.C,this.C,f);
	return this;
}
Mesh2.prototype.rotate = function(t){
	var c = Math.cos(t),
		s = Math.sin(t),
		M = mat2(c,s,-s,c);
	this.V.forEach(function(e){e.set(M.mul(e));});
	return this;
}
Mesh3.prototype.rotate = function(axis,t){
	if(axis instanceof Vec4){//axis is quanternion
		this.V.forEach(function(e){e.set(axis.mul(e));});
		return this;
	}
	else if(typeof t=="undefined"){
		var B = axis.exp();
	}else{
		var B = axis.exp(t);
	}
	this.V.forEach(function(e){e.set(B.mul(e));});
	return this;
}
Mesh4.prototype.rotate = function(axis,t){
	if(axis[1]){//axis is quanternion[L,R]
		this.V.forEach(function(e){e.set(axis[0].mul(e,false).mul(axis[1]))});
		return this;
	}
	if(typeof t=="undefined"){//axis is quanternion
		var B = axis.exp();
	}else{
		var B = axis.exp(t);
	}
	this.V.forEach(function(e){e.set(B.mul(e));});
	return this;
}
/** Geometry generators **/
Mesh2.points = function(v,flag){
	var E = (flag===false)?[]:[[0,v.length-1]];
	for(var i=1; i< v.length; i++){
		E.push([i,i-1]);
	}
	return new Mesh2({
		V: v,
		E: E
	});
}
Mesh2.prototype.embed = function(dimension,flag,x,y){//flag: yni insert face
	if(dimension == 3){
		x = x || new Vec3(1,0,0);
		y = y || new Vec3(0,1,0);
		var N = new Mesh3();
	}else if(dimension == 4){
		x = x || new Vec4(1,0,0,0);
		y = y || new Vec4(0,1,0,0);
		var N = new Mesh4();
	}else{
		throw "Mesh2 cannot be embedded in dimension "+ dimension;
	}
	this.V.forEach(function(a){
		N.V.push(x.mul(a.x,false).add(y.mul(a.y,false)));
	});
	Mesh4._util.copyPushArr(this.E,N.E);
	if(flag===true){
		N.F.push([]);
		for(var i=0; i<this.E.length;i++) N.F[0].push(i);
	}
	return N;
	
}
Mesh3.prototype.embed = function(flag,x,y,z){//flag: yni insert face
	if(flag==4) throw "soor Mesh3.embed(4)";
	x = x || new Vec4(1,0,0,0);
	y = y || new Vec4(0,1,0,0);
	z = z || new Vec4(0,0,1,0);
	var N = new Mesh4();
	this.V.forEach(function(a){
		N.V.push(x.mul(a.x,false).add(y.mul(a.y,false)).add(z.mul(a.z,false)));
	});
	Mesh4._util.copyPushArr(this.E,N.E);
	Mesh4._util.copyPushArr(this.F,N.F);
	if(flag===true){
		N.C.push([]);
		for(var i=0; i<this.F.length;i++) N.C[0].push(i);
	}
	return N;
}
Mesh3.prototype.pyramid = function(p){
	var v = this.V.length,
		e = this.E.length;
	this.V.push(p);
	for(var i=0; i< v; i++){
		this.E.push([i,v]);
	}
	for(var i=0; i< e; i++){
		this.F.push([i,e+this.E[i][0],e+this.E[i][1]]);
	}
	return this;
}
Mesh4.prototype.pyramid = function(p){
	var v = this.V.length,
		e = this.E.length,
		f = this.F.length;
	this.V.push(p);
	for(var i=0; i< f; i++){
		var NC = [i];
		this.F[i].forEach(function(a){
			NC.push(f+a);
		});
		this.C.push(NC);
	}
	for(var i=0; i< v; i++){
		this.E.push([i,v]);
	}
	for(var i=0; i< e; i++){
		this.F.push([i,e+this.E[i][0],e+this.E[i][1]]);
	}
	
	return this;
}
Mesh3.prototype.extrude = Mesh4.prototype.extrude = function(v,flag){
	var f = function(m,p){
		if(m==1) p.add(v);
	}
	return this.loft(f,2,flag===false?true:undefined);
}
Mesh3.prototype.turning = Mesh4.prototype.turning = function(B,n,flag){
	if(flag===false){
		var M = B.exp(Math.PI/n);
		var N = [mId((this instanceof Mesh3)?3:4)];
		for(var i=1;i<=n;i++){
			N[i] = N[i-1].mul(M,false);
		}
		var f = function(m,P){
			P.set(N[m].mul(P));
		}
		return this.loft(f,n+1);
	}
	var M = B.exp(Math.PI*2/n);
	var N = [mId((this instanceof Mesh3)?3:4)];
	for(var i=1;i<n;i++){
		N[i] = N[i-1].mul(M,false);
	}
	var f = function(m,P){
		P.set(N[m].mul(P));
	}
	return this.loft(f,n,false);
}
Mesh3.prototype.loft = function(f,n,flag){
	//f(m,p): der m der  crossection of p, total n der.
	//flag: yni ve faces au bout, par default: non, true: oui, false: loop
	var v = this.V.length,
		e = this.E.length;
	var M = new Mesh3();
	for(var i=0; i<n; i++){
		var N = this.clone().apply(f.bind(this,i));
		M.join(N);
	}
	for(var j=0; j<n-1; j++){
		for(var i=0; i<v; i++){
			M.E.push([i+j*v,i+j*v+v]);
		}
		for(var i=0; i<e; i++){
			M.F.push([i+j*e,i+j*e+e, e*n+this.E[i][0]+j*v, e*n+this.E[i][1]+j*v]);
		}
	}
	if(flag===true){
		var sia = [], sie = [];
		for(var i=0; i<e; i++){
			sia.push(i);
			sia.push(i+e*n);
		}
		M.F.push(sia);
		M.F.push(sie);
	}else if(flag===false){
		for(var i=0; i<v; i++){
			M.E.push([i,i+(n-1)*v]);
		}
		for(var i=0; i<e; i++){
			M.F.push([i,i+(n-1)*e, e*n+this.E[i][0]+(n-1)*v, e*n+this.E[i][1]+(n-1)*v]);
		}
	}
	return M;
}
Mesh4.prototype.loft = function(fn,n,flag){
	//f(m,p): der m der  crossection of p, total n der.
	//flag: yni ve faces au bout, par default: non, true: oui, false: loop
	var v = this.V.length,
		e = this.E.length,
		f = this.F.length;
	var M = new Mesh4();
	for(var i=0; i<n; i++){
		var N = this.clone().apply(fn.bind(this,i));
		M.join(N);
	}
	for(var j=0; j<n-1; j++){
		for(var i=0; i<v; i++){
			M.E.push([i+j*v,i+j*v+v]);
		}
		for(var i=0; i<e; i++){
			M.F.push([i+j*e,i+j*e+e, e*n+this.E[i][0]+j*v, e*n+this.E[i][1]+j*v]);
		}
		for(var i=0; i<f; i++){
			var arr = [i+j*f,i+j*f+f];
			for(var k=0; k<this.F[i].length; k++){
				arr.push(f*n+this.F[i][k]+j*e);
			}
			M.C.push(arr);
		}
	}
	if(flag===true){
		var sia = [], sie = [];
		for(var i=0; i<f; i++){
			sia.push(i);
			sia.push(i+f*n);
		}
		M.F.push(sia);
		M.F.push(sie);
	}else if(flag===false){
		for(var i=0; i<v; i++){
			M.E.push([i,i+(n-1)*v]);
		}
		for(var i=0; i<e; i++){
			M.F.push([i,i+(n-1)*e, e*n+this.E[i][0]+(n-1)*v, e*n+this.E[i][1]+(n-1)*v]);
		}
		for(var i=0; i<f; i++){
			var arr = [i,i+(n-1)*f];
			for(var k=0; k<this.F[i].length; k++){
				arr.push(f*n+this.F[i][k]+(n-1)*e);
			}
			M.C.push(arr);
		}
	}
	return M;
}
Mesh4.prototype.directProduct = function(M4){
	//this and M4: 2d new Mesh4
	var M = new Mesh4();
	for(var i=0; i<this.V.length; i++){
		var N = M4.clone().move(this.V[i]);
		M.join(N);
	}
	//each this.V has copy of M4
	var fa = M.F.length;
	var m = M4.V.length;
	var eall = M.E.length;
	for(var j=0; j<M4.V.length; j++){
		var f = [];
		for(var i=0; i<this.E.length; i++){
			f.push(M.E.length);
			M.E.push([j+this.E[i][0]*m, j+this.E[i][1]*m]);
			//add edge to connect each copy
		}
		M.F.push(f);
		//add face formed by edge loop
	}
	var fall = M.F.length;
	for(var j=0; j<M4.E.length; j++){
		for(var i=0; i<this.E.length; i++){
			M.F.push([
				j+this.E[i][0]*M4.E.length,
				j+this.E[i][1]*M4.E.length,
				i+M4.E[j][0]*this.E.length+eall,
				i+M4.E[j][1]*this.E.length+eall
			]);
			//facettes rectangulaires
		}
	}
	for(var j=0; j<M4.E.length; j++){
		//cellule: deux face grandes
		var c = [fa+M4.E[j][0],fa+M4.E[j][1]];
		for(var i=0; i<this.E.length; i++){
			c.push(fall+i+j*this.E.length);
		}
		M.C.push(c);
	}
	for(var j=0; j<this.E.length; j++){
		//cellule: deux face grandes
		var c = [this.E[j][0],this.E[j][1]];
		for(var i=0; i<M4.E.length; i++){
			c.push(fall+j+i*this.E.length);
		}
		M.C.push(c);
	}
	return M;
	
}
Mesh4.prototype.duopyramid = function(M4){
	var M = this.clone().join(M4);
	var mall = M.E.length;
	for(var j=0; j<M4.V.length; j++){
		for(var i=0; i<this.V.length; i++){
			M.E.push([i,j+this.V.length]);
		}
	}
	for(var j=0; j<M4.E.length; j++){
		for(var i=0; i<this.V.length; i++){
			var a = M4.E[j][0],
				b = M4.E[j][1],
				c = i;
			var ac = a*this.V.length+c,
				bc = b*this.V.length+c;
			M.F.push([j+this.E.length,ac+mall,bc+mall]);
		}
	}
	var eall = M.F.length;
	for(var j=0; j<this.E.length; j++){
		for(var i=0; i<M4.V.length; i++){
			var a = this.E[j][0],
				b = this.E[j][1],
				c = i;
			var ac = c*this.V.length+a,
				bc = c*this.V.length+b;
			M.F.push([j,ac+mall,bc+mall]);
		}
	}
	for(var j=0; j<this.E.length; j++){
		for(var i=0; i<M4.E.length; i++){
			M.C.push([
				this.E[j][0]+this.V.length*i,
				this.E[j][1]+this.V.length*i,
				eall+M4.E[i][0]+this.V.length*j,
				eall+M4.E[i][1]+this.V.length*j
			])
		}
	}
	return M;
}
Mesh3.prototype.weld = Mesh4.prototype.weld = function(threshold){
	function mapreduce(source, map, dest){
		/*example:
			source: this.V;
			map: map[i]=j : i -> j, if no img, mark map[i] with -1
			dest: this.E;
		*/
		for(var i=0; i<source.length; i++){
			var j = i;
			while(map[j] != j && map[j] != -1){
				j = map[j];
			}
			map[i] = map[j]; //find the end of the chain
		}
		//then del redundant sources and update a new map
		var offset = [];
		var count = 0;
		for(var i=0; i<map.length; i++){
			if(map[i]!=i || map[i] == -1){
				source.splice(i-count,1);
				count++;
			}
			offset.push(count);
		}
		for(var i=0; i<map.length; i++){
			if(map[i] != -1) map[i] -= offset[map[i]];
		}
		var t=0;
		for(var i of dest){
			//finally update dest dape map
			for(var j = 0; j<i.length; j++){
				i[j] = map[i[j]];
			}
			//but need to remove -1 elements
			var count = 0;
			var il = i.length;
			for(var j=0; j<il; j++){
				if(i[j-count] == -1){
					i.splice(j-count,1);
					count++;
				}
			}
			t ++;
		}
	}
	threshold = threshold || 0.0001;
	var threshold2 = threshold*threshold;
	var mapV = [];// chain: rv2[i]=j : i -> j, if no change rv2[i] undefined
	for(var i=0; i<this.V.length; i++){
		mapV[i] = i;
		for(var j=i+1; j<this.V.length; j++){
			if(this.V[i].sub(this.V[j],false).len(false)<threshold2){
				mapV[i] = j;
				break;
			}
		}
	}
	mapreduce(this.V, mapV, this.E);
	var mapE = [];
	for(var i=0; i<this.E.length; i++){
		var ei0 = this.E[i][0],
			ei1 = this.E[i][1];//acceleration
		mapE[i] = i;
		if(ei0 == ei1){
			mapE[i] = -1;
		}//mark the edge between single point whith -1, wait to remove
		for(var j=i+1; j<this.E.length; j++){
			if((ei0==this.E[j][0]&&ei1==this.E[j][1])||
				(ei0==this.E[j][1]&&ei1==this.E[j][0])){
				mapE[i] = j;
				break;
			}//edge chain
		}
	}
	mapreduce(this.E, mapE, this.F);
	var mapF = [];
	for(var i=0; i<this.F.length; i++){
		this.F[i] = Mesh4._util.uniqueArr(this.F[i]);
		if(this.F[i].length < 3){
			mapF[i] = -1;
		}else{
			mapF[i] = i;
		}
	}
	//if it's Mesh3, therefore C is undefined
	mapreduce(this.F, mapF, this.C||[]);
	return this;
}
Mesh3.prototype.crossSection = function(t,n){
	var M = new Mesh3();
	var V = [],
		E = [];
	for(var i=0; i<this.V.length; i++){
		//V.push(this.V[i].sub(p,false).dot(n));
		// (A-P).N
		V.push(this.V[i].dot(n)-t);
		//A.N - t  (t = P.N)
	}
	for(var i=0; i<this.E.length; i++){
		var a = this.E[i][0],
			b = this.E[i][1];
		if(!(V[a]<0 ^ V[b]<0)){
			E.push(-1);
			continue;
		}
		E.push(M.V.length);
		var BA = this.V[b].sub(this.V[a],false);
		var d = BA.dot(n);
		if(d==0){
			M.V.push(this.V[a].add(this.V[b],false).div(2));
		}else{
			M.V.push(this.V[a].sub(BA.mul(V[a]/d),false));
		}
		// A - ((A-P).N) (B-A) / ((B-A).N)
	}
	for(var i=0; i<this.F.length; i++){
		var arr = [];
		this.F[i].forEach(function(a){
			if(E[a]!=-1) arr.push(E[a]);
		});
		if(arr.length==2)
		M.E.push(arr);
	}
	return M;
}
Mesh4.prototype.crossSection = function(t,n){
	var dd = new Date().getTime();
	var M = new Mesh4();
	var V = [],
		E = [],
		F = [];
	for(var i=0; i<this.V.length; i++){
		V.push(this.V[i].dot(n)-t);
	}
	var MVlen = 0;
	for(var i=0; i<this.E.length; i++){
		var a = this.E[i][0],
			b = this.E[i][1];
		if(!(V[a]<0 ^ V[b]<0)){
			E.push(-1);
			continue;
		}
		var A = this.V[a],
			B = this.V[b];
		E.push(MVlen++);
		var BAx = B.x - A.x,
			BAy = B.y - A.y,
			BAz = B.z - A.z,
			BAt = B.t - A.t,
			d = BAx*n.x + BAy*n.y + BAz*n.z + BAt*n.t,
			k = V[a]/d;
		if(d==0){
			M.V.push(A.add(B,false).div(2));
		}else{
			M.V.push(new Vec4(A.x - BAx*k, A.y - BAy*k, A.z - BAz*k, A.t - BAt*k));
		}
		// A - ((A-P).N) (B-A) / ((B-A).N)
	}
	var MElen = 0;
	for(var f of this.F){
		var count = 0;
		var A, B;
		for(var a of f){
			if(E[a]!=-1){
				if(count==0)A = E[a];
				if(count==1)B = E[a];
				count++;
			}
		}
		if(count!=2){
			F.push(-1);
			continue;
		}
		F.push(MElen++);
		M.E.push([A,B]);
	}
	for(var c of this.C){
		var arr = [];
		for(var a of c){
			if(F[a]>=0) arr.push(F[a]);
		}
		if(c.info){
			arr.info = c.info;//record infos comme color, normal
		}
		if(arr.length>=3){
			M.F.push(arr);
		}
	}
	return M;
}
Mesh4.prototype.setInfo = function(info){
	for(var i=0; i<this.C.length; i++){
		this.C[i].info = info;//record infos comme color, normal
	}
	return this;
}
Mesh3.prototype.triangulate = function(){
	var F1 = [];
	var _this = this;
	for(var j=0; j<this.F.length; j++){
		var n = this.F[j].length,
			f = this.F[j];
		if(n==3) continue;
		var P = this.E[f[0]][0];//first point to be triangulate center
		var v = [],//tous les autres 
			v1 = [this.E[f[0]][1]];//adjacent ala P
		var e = [],
			e1 = [f[0]];
		for(var i=1; i<f.length; i++){
			if(this.E[f[i]][1]==P){
				v1.push(this.E[f[i]][0]);
				e1.push(f[i]);
			}else if(this.E[f[i]][0]==P){
				v1.push(this.E[f[i]][1]);
				e1.push(f[i]);
			}
		}
		for(var i=1; i<f.length; i++){
			var a = this.E[f[i]][0],
				b = this.E[f[i]][1];
			if(a!=P&&b!=P){
				if(v1.indexOf(a)==-1)v.push(a);
				if(v1.indexOf(b)==-1)v.push(b);
			}
		}
		v = Mesh4._util.uniqueArr(v);
		//v1:[p+1,p-1]
		//v:[....]/[p,p-1,p+1]
		v.forEach(function(a){
			e.push(_this.E.length);
			_this.E.push([a,P]);
		});
		//e=[....]
		//e1=[pp+1,pp-1]
		for(var i=1; i<f.length; i++){
			var a = v.indexOf(this.E[f[i]][0]),
				b = v.indexOf(this.E[f[i]][1]);
			if(a>-1&&b>-1) F1.push([f[i],e[a],e[b]]);
			else if(a==-1&&b!=-1){
				a = v1.indexOf(this.E[f[i]][0]);
				if(a>-1){
					F1.push([f[i],e1[a],e[b]])
				}
			}else if(b==-1&&a!=-1){
				b = v1.indexOf(this.E[f[i]][1]);
				if(a>-1){
					F1.push([f[i],e[a],e1[b]])
				}
			}
		}
	}
	this.F = F1;
	return this;
}
Mesh3.prototype.smoothFlat = function(){
	var m = {v:[],n:[],f:[]};
	var N = [];
	for(var j=0; j<this.V.length; j++){
		m.v.push(this.V[j].x,this.V[j].y,this.V[j].z);
		N.push([]);
	}
	for(var j=0; j<this.F.length; j++){
		var f = this.F[j];
		var p = this.E[f[0]][0];
		var v = [];
		for(var i=1; i<f.length; i++){
			var a = this.E[f[i]][0],
				b = this.E[f[i]][1];
			v.push(a,b);
			if(a!=p && b!=p) m.f.push(p,a,b);
		}
		v = Mesh4._util.uniqueArr(v);
		var n = this.V[v[2]].sub(this.V[v[1]],false).cross(this.V[v[2]].sub(this.V[v[0]],false)).norm();
		for(var i=0; i<v.length; i++){
			N[v[i]].push(n);
		}
	}
	for(var j=0; j<this.V.length; j++){
		var n = N[j][0];
		/*for(var i=1; i<N[j].length; i++){
			n.add(N[j][i]);
		}
		n.norm();*/
		m.n.push(n.x,n.y,n.z);
	}
	return m;
}

Mesh3.prototype.flat = function(){
	var m = {v:[],n:[],f:[]};
	var _this = this;
	for(var j=0; j<this.F.length; j++){
		var f = this.F[j];
		var v = [];
		for(var i=1; i<f.length; i++){
			var a = this.E[f[i]][0],
				b = this.E[f[i]][1];
			v.push(a,b);
		}
		v = Mesh4._util.uniqueArr(v);// all vertices of face F[j]
		var N = Mesh4._util.calNorm3FromPoints(v.map(function(e){
			return _this.V[e];
		}));
		var va = Math.round(m.v.length/3);
		for(var i=0; i<v.length; i++){
			var vp = this.V[v[i]];//for each vertex vp of F[j]
			m.v.push(vp.x,vp.y,vp.z);
			m.n.push(N.x,N.y,N.z);
			var a = v.indexOf(this.E[f[i]][0]),
				b = v.indexOf(this.E[f[i]][1]);
			if(a && b) m.f.push(a+va,b+va,0+va);
		}	
	}
	return m;
}
Mesh4.prototype.flat = function(){//just used for rendering 3d section but not collapsed in 3d
	var m = {v:[],n:[],f:[],c:[]};
	var _this = this;
	for(var j=0; j<this.F.length; j++){
		var f = this.F[j];
		var v = [];
		for(var i=1; i<f.length; i++){
			var a = this.E[f[i]][0],
				b = this.E[f[i]][1];
			v.push(a,b);
		}
		v = Mesh4._util.uniqueArr(v);// all vertices of face F[j]
		var N;
		if(f.info) N = f.info.normal;//Normalement we have calulé N in crossSection from cell
		N = N || new Vec4(1,0,0,0);
		if(!f.info){f.info = {color: 0xEEEEEE}}
		var va = Math.round(m.v.length/4);
		for(var i=0; i<v.length; i++){
			var vp = this.V[v[i]];//for each vertex vp of F[j]
			m.v.push(vp.x,vp.y,vp.z,vp.t);
			m.n.push(N.x,N.y,N.z,N.t);
			m.c.push((f.info.color >> 16)/256,(f.info.color>> 8 & 0xFF)/256,(f.info.color & 0xFF)/256);
			if(f[i]>=0){
				var a = v.indexOf(this.E[f[i]][0]),
					b = v.indexOf(this.E[f[i]][1]);
				if(a && b) m.f.push(a+va,b+va,0+va);
			}
		}	
	}
	return m;
}
Mesh3.prototype.collapse = function(){
	var a = new Mesh2();
	this.V.forEach(function(e){a.V.push(new Vec2(e.x,e.y));});
	Mesh4._util.copyPushArr(this.E,a.E);
	return a;
}
Mesh4.prototype.collapse = function(){
	var a = new Mesh3();
	this.V.forEach(function(e){a.V.push(new Vec3(e.x,e.y,e.z));});
	Mesh4._util.copyPushArr(this.E,a.E);
	Mesh4._util.copyPushArr(this.F,a.F);
	return a;
}
/*******Lib********/
Mesh2.polygon = function(radius,n){
	var step = Math.PI*2/n,
		M = new Mesh2();
	for(var i=0;i<n;i++){
		var t = i*step;
		M.V.push(new Vec2(Math.cos(t)*radius,Math.sin(t)*radius));
		M.E.push([i,(i)?(i-1):(n-1)]);
	}
	return M;
}
Mesh2.rectangle = function(w,h){
	w /= 2;
	h /= 2;
	return new Mesh2({
		V: [new Vec2(-w,-h),new Vec2(-w,h),new Vec2(w,h),new Vec2(w,-h)],
		E: [[0,1],[1,2],[2,3],[3,0]]
	});
}
/**lib3d**/
Mesh3.cube = function(r){
	return Mesh2.rectangle(r,r).embed(3,true).extrude(new Vec3(0,0,r)).move(new Vec3(0,0,-r/2));
}
Mesh3.cuboid = function(a,b,c){
	return Mesh2.rectangle(a,b).embed(3,true).extrude(new Vec3(0,0,c)).move(new Vec3(0,0,-c/2));
}
Mesh3.cylinder = function(r,n,h){
	return Mesh2.polygon(r,n).embed(3,true).extrude(new Vec3(0,0,h)).move(new Vec3(0,0,-h/2));
}
Mesh3.cone = function(r,n,h){
	return Mesh2.polygon(r,n).embed(3,true).pyramid(new Vec3(0,0,h)).move(new Vec3(0,0,-h/2));
}
Mesh3.sphere = function(r,u,v){
	return Mesh2.polygon(r,u*2).embed(3).turning(new Vec3(1,0,0),v,false).weld();
}
Mesh3.torus = function(r,R,u,v){
	return Mesh2.polygon(r,u).move(new Vec2(R,0)).embed(3,false,new Vec3(1,0,0),new Vec3(0,0,1)).turning(new Vec3(0,0,1),v);
}
/**lib4d**/
Mesh4.tesseract = function(r){
	return Mesh3.cube(r).embed(true).extrude(new Vec4(0,0,0,r)).move(new Vec4(0,0,0,-r/2));
}
Mesh4.glome = function(r,u,v,w){
	return Mesh3.sphere(r,u,v).embed().turning(bivec(0,0,1,0,0,0),w,false).weld();
}
Mesh4.spherinder = function(r,u,v,h){
	return Mesh3.sphere(r,u,v).embed(true).extrude(new Vec4(0,0,0,h)).move(new Vec4(0,0,0,-h/2));
}
Mesh4.sphone = function(r,u,v,h){
	return Mesh3.sphere(r,u,v).embed(true).pyramid(new Vec4(0,0,0,h)).move(new Vec4(0,0,0,-h/2));
}
Mesh4.duocylinder = function(R1,R2,u,v){
	return Mesh2.polygon(R1,u).embed(4,true).directProduct(Mesh2.polygon(R2,v).embed(4,true,new Vec4(0,0,1,0),new Vec4(0,0,0,1)));
}
Mesh4.cubinder = function(R,n,h1,h2){
	return Mesh2.polygon(R,n).embed(4,true).directProduct(Mesh2.rectangle(h1,h2).embed(4,true,new Vec4(0,0,1,0),new Vec4(0,0,0,1)));
}
Mesh4.cylindrone = function(r,n,h,hc){
	return Mesh3.cylinder(r,n,h).embed(true).pyramid(new Vec4(0,0,0,hc)).move(new Vec4(0,0,0,-hc/2));
}
Mesh4.dicone = function(r,n,h1,h2){
	return Mesh3.cone(r,n,h1).embed(true).pyramid(new Vec4(0,0,0,h2)).move(new Vec4(0,0,0,-h2/2));
}
Mesh4.duocone = function(R1,R2,u,v){
	return Mesh2.polygon(R1,u).embed(4).duopyramid(Mesh2.polygon(R2,v).embed(4,false,new Vec4(0,0,1,0),new Vec4(0,0,0,1)));
} 
Mesh4.coninder = function(r,n,h,hc){
	return Mesh3.cone(r,n,h).embed(true).extrude(new Vec4(0,0,0,hc)).move(new Vec4(0,0,0,-hc/2));
}
Mesh4.torinder = function(r,R,u,v,h){
	return Mesh3.cylinder(r,u,h).move(new Vec3(R,0,0)).embed().turning(bivec(0,0,1,0,0,0),v);
}
Mesh4.spheritorus = function(r,R,u,v,w){
	return Mesh3.sphere(r,u,v).move(new Vec3(R,0,0)).embed(false).turning(bivec(0,0,1,0,0,0),w);//.weld();
}
Mesh4.torisphere = function(r,R,u,v,w){
	return Mesh3.torus(r,R,u,v).embed(false,new Vec4(1,0,0,0),new Vec4(0,1,0,0),new Vec4(0,0,0,1)).turning(bivec(0,1,0,0,0,0),w,false).weld();
}
Mesh4.ditorus = function(r,R,RR,u,v,w){
	return Mesh3.torus(r,R,u,v).embed(false,new Vec4(0,1,0,0),new Vec4(0,0,0,1),new Vec4(0,0,1,0)).move(new Vec4(0,RR,0,0)).turning(bivec(1,0,0,0,0,0),w);
}
Mesh4.tiger = function(r,R1,R2,u,v,w){
	return Mesh4.torus(r,R1,u,v).move(new Vec4(0,0,R2,0)).turning(bivec(0,0,0,0,0,1),w);
}
Mesh4.torus = function(r,R,u,v){
	return Mesh2.polygon(r,u).move(new Vec2(R,0)).embed(4,true,new Vec4(1,0,0,0),new Vec4(0,0,1,0)).turning(bivec(1,0,0,0,0,0),v);
}

var Chunk4 = function(x,y,z,t){
	this.size = {x:x||8, y:y||8, z:z||8, t:t||8};
	this.data = [];
	for(var x = 0; x<this.size.x; x++){
		this.data.push([]);
		for(var y = 0; y<this.size.y; y++){
			this.data[x].push([]);
			for(var z = 0; z<this.size.z; z++){
				this.data[x][y].push([]);
				for(var t = 0; t<this.size.t; t++){
					this.data[x][y][z].push(0);
				}
			}
		}
	}
	this._offset = {x:0, y:0, z:0, t:0};//operation coord offset
	this.enableOffset = true;
	this.colorTable = [
		null,	//air
		0xAAAAAA,//stone
		0x00FF00,//grass
		0x996600,//dirt
		0xFFFFFF,
		0xFFAA00,
		0xFFFF00,
		0xAAFF00,
		0x00FF00,
		0x00FFFF,
		0x0000FF,
		0xBB00FF,
	]
}
Chunk4.prototype.offset = function(x, y, z, t){
	if(this.enableOffset){
		this._offset.x += x;
		this._offset.y += y;
		this._offset.z += z;
		this._offset.t += t;
	}else{
		this._offset.x = x;
		this._offset.y = y;
		this._offset.z = z;
		this._offset.t = t;
	}
}
Chunk4.prototype.isInside = function(x, y, z, t){
	return (
		x>=0 && x<this.size.x &&
		y>=0 && y<this.size.y &&
		z>=0 && z<this.size.z &&
		t>=0 && t<this.size.t );
}
Chunk4.prototype.setCuboid = function(id,x1,y1,z1,t1,x2,y2,z2,t2){//id can be int or function
	var ox = 0;
	var oy = 0;
	var oz = 0;
	var ot = 0;
	if(this.enableOffset){
		ox = this._offset.x;
		oy = this._offset.y;
		oz = this._offset.z;
		ot = this._offset.t;
	}
	var xm = Math.max(0,Math.min(x1,x2)+ox), xp = Math.min(this.size.x,Math.max(x1,x2)+1+ox);
	var ym = Math.max(0,Math.min(y1,y2)+oy), yp = Math.min(this.size.y,Math.max(y1,y2)+1+oy);
	var zm = Math.max(0,Math.min(z1,z2)+oz), zp = Math.min(this.size.z,Math.max(z1,z2)+1+oz);
	var tm = Math.max(0,Math.min(t1,t2)+ot), tp = Math.min(this.size.t,Math.max(t1,t2)+1+ot);
	var enableOffset = this.enableOffset;
	this.enableOffset = false;
	for(var x = xm; x<xp; x++){
		for(var y = ym; y<yp; y++){
			for(var z = zm; z<zp; z++){
				for(var t = tm; t<tp; t++){
					if(typeof id == "number"){
						this.set(id, x,y,z,t);
					}else{
						this.set(id(x-ox,y-oy,z-oz,t-ot), x,y,z,t);
					}
				}
			}
		}
	}
	this.enableOffset = enableOffset;
}
Chunk4.prototype.get = function(x,y,z,t){
	if(!this.isInside(x,y,z,t)) return 0;
	if(this.enableOffset){
		x += this._offset.x;
		y += this._offset.y;
		z += this._offset.z;
		t += this._offset.t;
	}
	return this.data[x][y][z][t];
}
Chunk4.prototype.set = function(id, x,y,z,t){
	if(!this.isInside(x,y,z,t)) return 0;
	if(this.enableOffset){
		x += this._offset.x;
		y += this._offset.y;
		z += this._offset.z;
		t += this._offset.t;
	}
	this.data[x][y][z][t] = id;
	return id;
}

Chunk4.prototype.generateMesh = function(){
	var Cellx = Mesh3.cube(1).embed(true, new Vec4(0,1,0,0),new Vec4(0,0,1,0),new Vec4(0,0,0,1));
	var Celly = Mesh3.cube(1).embed(true, new Vec4(1,0,0,0),new Vec4(0,0,1,0),new Vec4(0,0,0,1));
	var Cellz = Mesh3.cube(1).embed(true, new Vec4(0,1,0,0),new Vec4(1,0,0,0),new Vec4(0,0,0,1));
	var Cellt = Mesh3.cube(1).embed(true, new Vec4(0,1,0,0),new Vec4(0,0,1,0),new Vec4(1,0,0,0));
	var slope = Mesh2.points([new Vec2(0,0),new Vec2(0,1),new Vec2(1,0)]).embed(4,true).directProduct(Mesh2.rectangle(1,1).embed(4,true,new Vec4(0,0,1,0),new Vec4(0,0,0,1)));
	//var slope = Mesh2.points([new Vec2(0,0),new Vec2(0,1),new Vec2(1,0)]).embed(3,true).extrude(new Vec3(0,0,1)).embed(true).extrude(new Vec4(0,0,0,1));
	var hyxelMesh = new Mesh4();
	var enableOffset = this.enableOffset;
	this.enableOffset = false;
	for(var x = 0; x<this.size.x; x++){
		for(var y = 0; y<this.size.y; y++){
			for(var z = 0; z<this.size.z; z++){
				for(var t = 0; t<this.size.t; t++){
					var datavalue = this.get(x,y,z,t);
					if(datavalue>0){
						var color = this.colorTable[datavalue];
						if(this.get(x,y,z,t+1)<=0) // air:0, -x:slope
							hyxelMesh.join(Cellt.clone().move(new Vec4(x,y,z,t+0.5)).setInfo({color: color}));
						if(this.get(x,y,z+1,t)<=0)
							hyxelMesh.join(Cellz.clone().move(new Vec4(x,y,z+0.5,t)).setInfo({color: color}));
						if(this.get(x,y+1,z,t)<=0)
							hyxelMesh.join(Celly.clone().move(new Vec4(x,y+0.5,z,t)).setInfo({color: color}));
						if(this.get(x+1,y,z,t)<=0)
							hyxelMesh.join(Cellx.clone().move(new Vec4(x+0.5,y,z,t)).setInfo({color: color}));
						
						if(this.get(x,y,z,t-1)<=0)
							hyxelMesh.join(Cellt.clone().move(new Vec4(x,y,z,t-0.5)).setInfo({color: color}));
						if(this.get(x,y,z-1,t)<=0)
							hyxelMesh.join(Cellz.clone().move(new Vec4(x,y,z-0.5,t)).setInfo({color: color}));
						if(this.get(x,y-1,z,t)<=0)
							hyxelMesh.join(Celly.clone().move(new Vec4(x,y-0.5,z,t)).setInfo({color: color}));
						if(this.get(x-1,y,z,t)<=0)
							hyxelMesh.join(Cellx.clone().move(new Vec4(x-0.5,y,z,t)).setInfo({color: color}));
					}else if(datavalue <0){
						
						switch(datavalue){
							case -1:
								hyxelMesh.join(slope.clone().move(new Vec4(x,y,z,t-0.5)).setInfo({color: 0xFFFFFF}));
								//unter konstruktion
							break;
						}
					}
				}
			}
		}
	}
	this.enableOffset = enableOffset;
	return hyxelMesh.weld();
}