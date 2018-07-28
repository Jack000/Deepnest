'use strict';


function clone(nfp){
	var newnfp = [];
	for(var i=0; i<nfp.length; i++){
		newnfp.push({
			x: nfp[i].x,
			y: nfp[i].y
		});
	}
	
	if(nfp.children && nfp.children.length > 0){
		newnfp.children = [];
		for(i=0; i<nfp.children.length; i++){
			var child = nfp.children[i];
			var newchild = [];
			for(var j=0; j<child.length; j++){
				newchild.push({
					x: child[j].x,
					y: child[j].y
				});
			}
			newnfp.children.push(newchild);
		}
	}
	
	return newnfp;
}

function cloneNfp(nfp, inner){
	if(!inner){
		return clone(nfp);
	}
	
	// inner nfp is actually an array of nfps
	var newnfp = [];
	for(var i=0; i<nfp.length; i++){
		newnfp.push(clone(nfp[i]));
	}
	
	return newnfp;
}

window.db = {
	has: function(obj){
		var key = 'A'+obj.A+'B'+obj.B+'Arot'+parseInt(obj.Arotation)+'Brot'+parseInt(obj.Brotation);
		if(window.nfpcache[key]){
			return true;
		}
		return false;
	},
	
	find : function(obj, inner){
		var key = 'A'+obj.A+'B'+obj.B+'Arot'+parseInt(obj.Arotation)+'Brot'+parseInt(obj.Brotation);
		//console.log('key: ', key);
		if(window.nfpcache[key]){
			return cloneNfp(window.nfpcache[key], inner);
		}
		/*var keypath = './nfpcache/'+key+'.json';
		if(fs.existsSync(keypath)){
			// could be partially written
			obj = null;
			try{
				obj = JSON.parse(fs.readFileSync(keypath).toString());
			}
			catch(e){
				return null;
			}
			var nfp = obj.nfp;
			nfp.children = obj.children;
			
			window.nfpcache[key] = clone(nfp);
			
			return nfp;
		}*/
		return null;
	},
	
	insert : function(obj, inner){
		var key = 'A'+obj.A+'B'+obj.B+'Arot'+parseInt(obj.Arotation)+'Brot'+parseInt(obj.Brotation);
		if(window.performance.memory.totalJSHeapSize < 0.8*window.performance.memory.jsHeapSizeLimit){
			window.nfpcache[key] = cloneNfp(obj.nfp, inner);
			//console.log('cached: ',window.cache[key].poly);
			//console.log('using', window.performance.memory.totalJSHeapSize/window.performance.memory.jsHeapSizeLimit);
		}
		
		/*obj.children = obj.nfp.children;
		
		var keypath = './nfpcache/'+key+'.json';
		fq.writeFile(keypath, JSON.stringify(obj), function (err) {
			if (err){
				console.log("couldn't write");
			}
		});*/
	}
}

window.onload = function () {
	const { ipcRenderer } = require('electron');
	window.ipcRenderer = ipcRenderer;
	window.addon = require('../minkowski/Release/addon');
	
	window.path = require('path')
	window.url = require('url')
	window.fs = require('graceful-fs');
	window.FileQueue = require('filequeue');
	window.fq = new FileQueue(500);
	
	window.nfpcache = {};
	  
	ipcRenderer.on('background-start', (event, data) => {
		var index = data.index;
	    var individual = data.individual;

	    var parts = individual.placement;
		var rotations = individual.rotation;
		var ids = data.ids;
		var sources = data.sources;
		var children = data.children;
		
		for(var i=0; i<parts.length; i++){
			parts[i].rotation = rotations[i];
			parts[i].id = ids[i];
			parts[i].source = sources[i];
			if(!data.config.simplify){
				parts[i].children = children[i];
			}
		}
		
		for(i=0; i<data.sheets.length; i++){
			data.sheets[i].id = data.sheetids[i];
			data.sheets[i].source = data.sheetsources[i];
			data.sheets[i].children = data.sheetchildren[i];
		}
		
		// preprocess
		var pairs = [];
		var inpairs = function(key, p){
			for(var i=0; i<p.length; i++){
				if(p[i].Asource == key.Asource && p[i].Bsource == key.Bsource && p[i].Arotation == key.Arotation && p[i].Brotation == key.Brotation){
					return true;
				}
			}
			return false;
		}
		for(var i=0; i<parts.length; i++){
			var B = parts[i];
			for(var j=0; j<i; j++){
				var A = parts[j];
				var key = {
					A: A,
					B: B,
					Arotation: A.rotation,
					Brotation: B.rotation,
					Asource: A.source,
					Bsource: B.source
				};
				var doc = {
					A: A.source,
					B: B.source,
					Arotation: A.rotation,
					Brotation: B.rotation
				}
				if(!inpairs(key, pairs) && !db.has(doc)){
					pairs.push(key);
				}
			}
		}
		
		console.log('pairs: ',pairs.length);
		  
		  var process = function(pair){
			
			var A = rotatePolygon(pair.A, pair.Arotation);
			var B = rotatePolygon(pair.B, pair.Brotation);
			
			var clipper = new ClipperLib.Clipper();
			
			var Ac = toClipperCoordinates(A);
			ClipperLib.JS.ScaleUpPath(Ac, 10000000);
			var Bc = toClipperCoordinates(B);
			ClipperLib.JS.ScaleUpPath(Bc, 10000000);
			for(var i=0; i<Bc.length; i++){
				Bc[i].X *= -1;
				Bc[i].Y *= -1;
			}
			var solution = ClipperLib.Clipper.MinkowskiSum(Ac, Bc, true);
			var clipperNfp;
		
			var largestArea = null;
			for(i=0; i<solution.length; i++){
				var n = toNestCoordinates(solution[i], 10000000);
				var sarea = -GeometryUtil.polygonArea(n);
				if(largestArea === null || largestArea < sarea){
					clipperNfp = n;
					largestArea = sarea;
				}
			}
			
			for(var i=0; i<clipperNfp.length; i++){
				clipperNfp[i].x += B[0].x;
				clipperNfp[i].y += B[0].y;
			}
			
			pair.A = null;
			pair.B = null;
			pair.nfp = clipperNfp;
			return pair;
			
			function toClipperCoordinates(polygon){
				var clone = [];
				for(var i=0; i<polygon.length; i++){
					clone.push({
						X: polygon[i].x,
						Y: polygon[i].y
					});
				}
	
				return clone;
			};
			
			function toNestCoordinates(polygon, scale){
				var clone = [];
				for(var i=0; i<polygon.length; i++){
					clone.push({
						x: polygon[i].X/scale,
						y: polygon[i].Y/scale
					});
				}
	
				return clone;
			};
			
			function rotatePolygon(polygon, degrees){
				var rotated = [];
				var angle = degrees * Math.PI / 180;
				for(var i=0; i<polygon.length; i++){
					var x = polygon[i].x;
					var y = polygon[i].y;
					var x1 = x*Math.cos(angle)-y*Math.sin(angle);
					var y1 = x*Math.sin(angle)+y*Math.cos(angle);
						
					rotated.push({x:x1, y:y1});
				}
	
				return rotated;
			};
		  }
		  
		  // run the placement synchronously
		  function sync(){
		  	//console.log('starting synchronous calculations', Object.keys(window.nfpCache).length);
		  	console.log('in sync');
		  	var c=0;
		  	for (var key in window.nfpcache) {
				c++;
			}
			console.log('nfp cached:', c);
		  	var placement = placeParts(data.sheets, parts, data.config, index);
	
			placement.index = data.index;
			ipcRenderer.send('background-response', placement);
		  }
		  
		  console.time('Total');
		  
		  
		  if(pairs.length > 0){
			  var p = new Parallel(pairs, {
				evalPath: 'util/eval.js',
				synchronous: false
			  });
			  
			  var spawncount = 0;
				
				p._spawnMapWorker = function (i, cb, done, env, wrk){
					// hijack the worker call to check progress
					ipcRenderer.send('background-progress', {index: index, progress: 0.5*(spawncount++/pairs.length)});
					return Parallel.prototype._spawnMapWorker.call(p, i, cb, done, env, wrk);
				}
			  
			  p.require('clipper.js');
			  p.require('geometryutil.js');
		  
			  p.map(process).then(function(processed){
			  	 function getPart(source){
					for(var k=0; k<parts.length; k++){
						if(parts[k].source == source){
							return parts[k];
						}
					}
					return null;
				  }
				// store processed data in cache
				for(var i=0; i<processed.length; i++){
					// returned data only contains outer nfp, we have to account for any holes separately in the synchronous portion
					// this is because the c++ addon which can process interior nfps cannot run in the worker thread					
					var A = getPart(processed[i].Asource);
					var B = getPart(processed[i].Bsource);
										
					var Achildren = [];
					
					var j;
					if(A.children){
						for(j=0; j<A.children.length; j++){
							Achildren.push(rotatePolygon(A.children[j], processed[i].Arotation));
						}
					}
					
					if(Achildren.length > 0){
						var Brotated = rotatePolygon(B, processed[i].Brotation);
						var bbounds = GeometryUtil.getPolygonBounds(Brotated);
						var cnfp = [];
						
						for(j=0; j<Achildren.length; j++){
							var cbounds = GeometryUtil.getPolygonBounds(Achildren[j]);
							if(cbounds.width > bbounds.width && cbounds.height > bbounds.height){
								var n = getInnerNfp(Achildren[j], Brotated, data.config);
								if(n && n.length > 0){
									cnfp = cnfp.concat(n);
								}
							}
						}
						
						processed[i].nfp.children = cnfp;
					}
					
					var doc = {
						A: processed[i].Asource,
						B: processed[i].Bsource,
						Arotation: processed[i].Arotation,
						Brotation: processed[i].Brotation,
						nfp: processed[i].nfp
					};
					window.db.insert(doc);
					
				}
				console.timeEnd('Total');
				console.log('before sync');
				sync();
			  });
		  }
		  else{
		  	sync();
		  }
	});
};

// returns the square of the length of any merged lines
// filter out any lines less than minlength long
function mergedLength(parts, p, minlength, tolerance){
	var min2 = minlength*minlength;
	var totalLength = 0;
	var segments = [];
	
	for(var i=0; i<p.length; i++){
		var A1 = p[i];
		
		if(i+1 == p.length){
			A2 = p[0];
		}
		else{
			var A2 = p[i+1];
		}
		
		if(!A1.exact || !A2.exact){
			continue;
		}
		
		var Ax2 = (A2.x-A1.x)*(A2.x-A1.x);
		var Ay2 = (A2.y-A1.y)*(A2.y-A1.y);
		
		if(Ax2+Ay2 < min2){
			continue;
		}
		
		var angle = Math.atan2((A2.y-A1.y),(A2.x-A1.x));

		var c = Math.cos(-angle);
		var s = Math.sin(-angle);
		
		var c2 = Math.cos(angle);
		var s2 = Math.sin(angle);
		
		var relA2 = {x: A2.x-A1.x, y: A2.y-A1.y};
		var rotA2x = relA2.x * c - relA2.y * s;
				
		for(var j=0; j<parts.length; j++){
			var B = parts[j];
			if(B.length > 1){
				for(var k=0; k<B.length; k++){
					var B1 = B[k];
					
					if(k+1 == B.length){
						var B2 = B[0];
					}
					else{
						var B2 = B[k+1];
					}
					
					if(!B1.exact || !B2.exact){
						continue;
					}
					var Bx2 = (B2.x-B1.x)*(B2.x-B1.x);
					var By2 = (B2.y-B1.y)*(B2.y-B1.y);
					
					if(Bx2+By2 < min2){
						continue;
					}
					
					// B relative to A1 (our point of rotation)
					var relB1 = {x: B1.x - A1.x, y: B1.y - A1.y};
					var relB2 = {x: B2.x - A1.x, y: B2.y - A1.y};
					
					
					// rotate such that A1 and A2 are horizontal
					var rotB1 = {x: relB1.x * c - relB1.y * s, y: relB1.x * s + relB1.y * c};
					var rotB2 = {x: relB2.x * c - relB2.y * s, y: relB2.x * s + relB2.y * c};
					
					if(!GeometryUtil.almostEqual(rotB1.y, 0, tolerance) || !GeometryUtil.almostEqual(rotB2.y, 0, tolerance)){
						continue;
					}
					
					var min1 = Math.min(0, rotA2x);
					var max1 = Math.max(0, rotA2x);
					
					var min2 = Math.min(rotB1.x, rotB2.x);
					var max2 = Math.max(rotB1.x, rotB2.x);
					
					// not overlapping
					if(min2 >= max1 || max2 <= min1){
						continue;
					}
					
					var len = 0;
					var relC1x = 0;
					var relC2x = 0;
					
					// A is B
					if(GeometryUtil.almostEqual(min1, min2) && GeometryUtil.almostEqual(max1, max2)){
						len = max1-min1;
						relC1x = min1;
						relC2x = max1;
					}
					// A inside B
					else if(min1 > min2 && max1 < max2){
						len = max1-min1;
						relC1x = min1;
						relC2x = max1;
					}
					// B inside A
					else if(min2 > min1 && max2 < max1){
						len = max2-min2;
						relC1x = min2;
						relC2x = max2;
					}
					else{
						len = Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
						relC1x = Math.min(max1, max2);
						relC2x = Math.max(min1, min2);		
					}
					
					if(len*len > min2){
						totalLength += len;
						
						var relC1 = {x: relC1x * c2, y: relC1x * s2};
						var relC2 = {x: relC2x * c2, y: relC2x * s2};
						
						var C1 = {x: relC1.x + A1.x, y: relC1.y + A1.y};
						var C2 = {x: relC2.x + A1.x, y: relC2.y + A1.y};
						
						segments.push([C1, C2]);
					}
				}
			}
			
			if(B.children && B.children.length > 0){
				var child = mergedLength(B.children, p, minlength, tolerance);
				totalLength += child.totalLength;
				segments = segments.concat(child.segments);
			}
		}
	}
	
	return {totalLength: totalLength, segments: segments};
}

function shiftPolygon(p, shift){
	var shifted = [];
	for(var i=0; i<p.length; i++){
		shifted.push({x: p[i].x+shift.x, y:p[i].y+shift.y, exact: p[i].exact});
	}
	if(p.children && p.children.length){
		shifted.children = [];
		for(i=0; i<p.children.length; i++){
			shifted.children.push(shiftPolygon(p.children[i], shift));
		}
	}
	
	return shifted;
}
// jsClipper uses X/Y instead of x/y...
function toClipperCoordinates(polygon){
	var clone = [];
	for(var i=0; i<polygon.length; i++){
		clone.push({
			X: polygon[i].x,
			Y: polygon[i].y
		});
	}
	
	return clone;
};

// returns clipper nfp. Remember that clipper nfp are a list of polygons, not a tree!
function nfpToClipperCoordinates(nfp, config){
	var clipperNfp = [];
	
	// children first
	if(nfp.children && nfp.children.length > 0){
		for(var j=0; j<nfp.children.length; j++){
			if(GeometryUtil.polygonArea(nfp.children[j]) < 0){
				nfp.children[j].reverse();
			}
			var childNfp = toClipperCoordinates(nfp.children[j]);
			ClipperLib.JS.ScaleUpPath(childNfp, config.clipperScale);
			clipperNfp.push(childNfp);
		}
	}
	
	if(GeometryUtil.polygonArea(nfp) > 0){
		nfp.reverse();
	}
	
	var outerNfp = toClipperCoordinates(nfp);
	
	// clipper js defines holes based on orientation

	ClipperLib.JS.ScaleUpPath(outerNfp, config.clipperScale);
	//var cleaned = ClipperLib.Clipper.CleanPolygon(outerNfp, 0.00001*config.clipperScale);
	
	clipperNfp.push(outerNfp);
	//var area = Math.abs(ClipperLib.Clipper.Area(cleaned));
	
	return clipperNfp;
}

// inner nfps can be an array of nfps, outer nfps are always singular
function innerNfpToClipperCoordinates(nfp, config){
	var clipperNfp = [];
	for(var i=0; i<nfp.length; i++){
		var clip = nfpToClipperCoordinates(nfp[i], config);
		clipperNfp = clipperNfp.concat(clip);
	}
	
	return clipperNfp;
}

function toNestCoordinates(polygon, scale){
	var clone = [];
	for(var i=0; i<polygon.length; i++){
		clone.push({
			x: polygon[i].X/scale,
			y: polygon[i].Y/scale
		});
	}
	
	return clone;
};

function getHull(polygon){
	// convert to hulljs format
	/*var hull = new ConvexHullGrahamScan();
	for(var i=0; i<polygon.length; i++){
		hull.addPoint(polygon[i].x, polygon[i].y);
	}
	
	return hull.getHull();*/
	var points = [];
	for(var i=0; i<polygon.length; i++){
		points.push([polygon[i].x, polygon[i].y]);
	}
	var hullpoints = d3.polygonHull(points);
	
	if(!hullpoints){
		return polygon;
	}
	
	var hull = [];
	for(i=0; i<hullpoints.length; i++){
		hull.push({x: hullpoints[i][0], y: hullpoints[i][1]});
	}
	
	return hull;
}

function rotatePolygon(polygon, degrees){
	var rotated = [];
	var angle = degrees * Math.PI / 180;
	for(var i=0; i<polygon.length; i++){
		var x = polygon[i].x;
		var y = polygon[i].y;
		var x1 = x*Math.cos(angle)-y*Math.sin(angle);
		var y1 = x*Math.sin(angle)+y*Math.cos(angle);
						
		rotated.push({x:x1, y:y1, exact: polygon[i].exact});
	}
	
	if(polygon.children && polygon.children.length > 0){
		rotated.children = [];
		for(var j=0; j<polygon.children.length; j++){
			rotated.children.push(rotatePolygon(polygon.children[j], degrees));
		}
	}
	
	return rotated;
};

function getOuterNfp(A, B, inside){
	var nfp;
	
	/*var numpoly = A.length + B.length;
	if(A.children && A.children.length > 0){
		A.children.forEach(function(c){
			numpoly += c.length;
		});
	}
	if(B.children && B.children.length > 0){
		B.children.forEach(function(c){
			numpoly += c.length;
		});
	}*/
	
	// try the file cache if the calculation will take a long time
	var doc = window.db.find({ A: A.source, B: B.source, Arotation: A.rotation, Brotation: B.rotation });
	
	if(doc){
		return doc;
	}

	// not found in cache
	if(inside || (A.children && A.children.length > 0)){
	//console.log('computing minkowski: ',A.length, B.length);
	//console.time('addon');
	nfp = addon.calculateNFP({A: A, B: B});
	//console.timeEnd('addon');
	}
	else{
		console.log('minkowski', A.length, B.length, A.source, B.source);
		console.time('clipper');
	
		var Ac = toClipperCoordinates(A);
		ClipperLib.JS.ScaleUpPath(Ac, 10000000);
		var Bc = toClipperCoordinates(B);
		ClipperLib.JS.ScaleUpPath(Bc, 10000000);
		for(var i=0; i<Bc.length; i++){
			Bc[i].X *= -1;
			Bc[i].Y *= -1;
		}
		var solution = ClipperLib.Clipper.MinkowskiSum(Ac, Bc, true);
		//console.log(solution.length, solution);
		//var clipperNfp = toNestCoordinates(solution[0], 10000000);
		var clipperNfp;
		
		var largestArea = null;
		for(i=0; i<solution.length; i++){
			var n = toNestCoordinates(solution[i], 10000000);
			var sarea = -GeometryUtil.polygonArea(n);
			if(largestArea === null || largestArea < sarea){
				clipperNfp = n;
				largestArea = sarea;
			}
		}
		
		for(var i=0; i<clipperNfp.length; i++){
			clipperNfp[i].x += B[0].x;
			clipperNfp[i].y += B[0].y;
		}
		
		nfp = [clipperNfp];
		//console.log('clipper nfp', JSON.stringify(nfp));
		console.timeEnd('clipper');
	}
	
	if(!nfp || nfp.length == 0){
		//console.log('holy shit', nfp, A, B, JSON.stringify(A), JSON.stringify(B));
		return null
	}
	
	nfp = nfp.pop();
	
	if(!nfp || nfp.length == 0){
		return null;
	}
	
	if(!inside && typeof A.source !== 'undefined' && typeof B.source !== 'undefined'){
		// insert into db
		doc = {
			A: A.source,
			B: B.source,
			Arotation: A.rotation,
			Brotation: B.rotation,
			nfp: nfp
		};
		window.db.insert(doc);
	}
	
	return nfp;
}

function getFrame(A){
	var bounds = GeometryUtil.getPolygonBounds(A);
	
	// expand bounds by 10%
	bounds.width *= 1.1; 
	bounds.height *= 1.1;
	bounds.x -= 0.5*(bounds.width - (bounds.width/1.1));
	bounds.y -= 0.5*(bounds.height - (bounds.height/1.1));
	
	var frame = [];
	frame.push({ x: bounds.x, y: bounds.y });
	frame.push({ x: bounds.x+bounds.width, y: bounds.y });
	frame.push({ x: bounds.x+bounds.width, y: bounds.y+bounds.height });
	frame.push({ x: bounds.x, y: bounds.y+bounds.height });
	
	frame.children = [A];
	frame.source = A.source;
	frame.rotation = 0;
	
	return frame;
}

function getInnerNfp(A, B, config){
	if(typeof A.source !== 'undefined' && typeof B.source !== 'undefined'){
		var doc = window.db.find({ A: A.source, B: B.source, Arotation: 0, Brotation: B.rotation }, true);
	
		if(doc){
			//console.log('fetch inner', A.source, B.source, doc);
			return doc;
		}
	}
	
	var frame = getFrame(A);
	
	var nfp = getOuterNfp(frame, B, true);
		
	if(!nfp || !nfp.children || nfp.children.length == 0){
		return null;
	}
	
	var holes = [];
	if(A.children && A.children.length > 0){
		for(var i=0; i<A.children.length; i++){
			var hnfp = getOuterNfp(A.children[i], B);
			if(hnfp){
				holes.push(hnfp);
			}
		}
	}
		
	if(holes.length == 0){
		return nfp.children;
	}
	
	var clipperNfp = innerNfpToClipperCoordinates(nfp.children, config);
	var clipperHoles = innerNfpToClipperCoordinates(holes, config);
	
	var finalNfp = new ClipperLib.Paths();
	var clipper = new ClipperLib.Clipper();
	
	clipper.AddPaths(clipperHoles, ClipperLib.PolyType.ptClip, true);
	clipper.AddPaths(clipperNfp, ClipperLib.PolyType.ptSubject, true);
	
	if(!clipper.Execute(ClipperLib.ClipType.ctDifference, finalNfp, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)){
		return nfp.children;
	}
	
	if(finalNfp.length == 0){
		return null;
	}
	
	var f = [];
	for(var i=0; i<finalNfp.length; i++){
		f.push(toNestCoordinates(finalNfp[i], config.clipperScale));
	}
	
	if(typeof A.source !== 'undefined' && typeof B.source !== 'undefined'){
		// insert into db
		console.log('inserting inner: ',A.source, B.source, B.rotation, f);
		var doc = {
			A: A.source,
			B: B.source,
			Arotation: 0,
			Brotation: B.rotation,
			nfp: f
		};
		window.db.insert(doc, true);
	}
	
	return f;
}

function placeParts(sheets, parts, config, nestindex){

	if(!sheets){
		return null;
	}
	
	var i, j, k, m, n, part;
	
	var totalnum = parts.length;
	var totalsheetarea = 0;
	
	// total length of merged lines
	var totalMerged = 0;
		
	// rotate paths by given rotation
	var rotated = [];
	for(i=0; i<parts.length; i++){
		var r = rotatePolygon(parts[i], parts[i].rotation);
		r.rotation = parts[i].rotation;
		r.source = parts[i].source;
		r.id = parts[i].id;
		
		rotated.push(r);
	}
	
	parts = rotated;
	
	var allplacements = [];
	var fitness = 0;
	//var binarea = Math.abs(GeometryUtil.polygonArea(self.binPolygon));
	
	var key, nfp;
	var part;
	
	while(parts.length > 0){
		
		var placed = [];
		var placements = [];
		
		// open a new sheet
		var sheet = sheets.shift();
		var sheetarea = Math.abs(GeometryUtil.polygonArea(sheet));
		totalsheetarea += sheetarea;
		
		fitness += sheetarea; // add 1 for each new sheet opened (lower fitness is better)
		
		var clipCache = [];
		//console.log('new sheet');
		for(i=0; i<parts.length; i++){
			console.time('placement');
			part = parts[i];
			
			// inner NFP
			var sheetNfp = null;				
			// try all possible rotations until it fits
			// (only do this for the first part of each sheet, to ensure that all parts that can be placed are, even if we have to to open a lot of sheets)
			for(j=0; j<(360/config.rotations); j++){
				sheetNfp = getInnerNfp(sheet, part, config);
				
				if(sheetNfp){
					break;
				}
				
				var r = rotatePolygon(part, 360/config.rotations);
				r.rotation = part.rotation + (360/config.rotations);
				r.source = part.source;
				r.id = part.id;
				
				// rotation is not in-place
				part = r;
				parts[i] = r;
				
				if(part.rotation > 360){
					part.rotation = part.rotation%360;
				}
			}
			// part unplaceable, skip
			if(!sheetNfp || sheetNfp.length == 0){
				continue;
			}
						
			var position = null;
			
			if(placed.length == 0){
				// first placement, put it on the top left corner
				for(j=0; j<sheetNfp.length; j++){
					for(k=0; k<sheetNfp[j].length; k++){
						if(position === null || sheetNfp[j][k].x-part[0].x < position.x || (GeometryUtil.almostEqual(sheetNfp[j][k].x-part[0].x, position.x) && sheetNfp[j][k].y-part[0].y < position.y ) ){
							position = {
								x: sheetNfp[j][k].x-part[0].x,
								y: sheetNfp[j][k].y-part[0].y,
								id: part.id,
								rotation: part.rotation,
								source: part.source
							}
						}
					}
				}
				if(position === null){
					console.log(sheetNfp);
				}
				placements.push(position);
				placed.push(part);
				
				continue;
			}
			
			var clipperSheetNfp = innerNfpToClipperCoordinates(sheetNfp, config);
			
			var clipper = new ClipperLib.Clipper();
			var combinedNfp = new ClipperLib.Paths();
			
			var error = false;
			
			// check if stored in clip cache
			//var startindex = 0;
			var clipkey = 's:'+part.source+'r:'+part.rotation;
			var startindex = 0;
			if(clipCache[clipkey]){
				var prevNfp = clipCache[clipkey].nfp;
				clipper.AddPaths(prevNfp, ClipperLib.PolyType.ptSubject, true);
				startindex = clipCache[clipkey].index;
			}
			
			for(j=startindex; j<placed.length; j++){
				nfp = getOuterNfp(placed[j], part);
				// minkowski difference failed. very rare but could happen
				if(!nfp){
					error = true;
					break;
				}
				// shift to placed location
				for(m=0; m<nfp.length; m++){
					nfp[m].x += placements[j].x;
					nfp[m].y += placements[j].y;
				}
				
				if(nfp.children && nfp.children.length > 0){
					for(n=0; n<nfp.children.length; n++){
						for(var o=0; o<nfp.children[n].length; o++){
							nfp.children[n][o].x += placements[j].x;
							nfp.children[n][o].y += placements[j].y;
						}
					}
				}
				
				var clipperNfp = nfpToClipperCoordinates(nfp, config);
				
				clipper.AddPaths(clipperNfp, ClipperLib.PolyType.ptSubject, true);
			}
			
			if(error || !clipper.Execute(ClipperLib.ClipType.ctUnion, combinedNfp, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)){
				console.log('clipper error', error);
				continue;
			}
			
			/*var converted = [];
			for(j=0; j<combinedNfp.length; j++){
				converted.push(toNestCoordinates(combinedNfp[j], config.clipperScale));
			}*/
			
			clipCache[clipkey] = {
				nfp: combinedNfp,
				index: placed.length-1
			};
			
			console.log('save cache', placed.length-1);
			
			// difference with sheet polygon
			var finalNfp = new ClipperLib.Paths();
			clipper = new ClipperLib.Clipper();
			
			clipper.AddPaths(combinedNfp, ClipperLib.PolyType.ptClip, true);
			
			clipper.AddPaths(clipperSheetNfp, ClipperLib.PolyType.ptSubject, true);
			
			if(!clipper.Execute(ClipperLib.ClipType.ctDifference, finalNfp, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftNonZero)){
				continue;
			}
			
			if(!finalNfp || finalNfp.length == 0){
				continue;
			}
			
			var f = [];
			for(j=0; j<finalNfp.length; j++){
				// back to normal scale
				f.push(toNestCoordinates(finalNfp[j], config.clipperScale));
			}
			finalNfp = f;
						
			// choose placement that results in the smallest bounding box/hull etc
			// todo: generalize gravity direction
			var minwidth = null;
			var minarea = null;
			var minx = null;
			var miny = null;
			var nf, area, shiftvector;
			
			var allpoints = [];
			for(m=0; m<placed.length; m++){
				for(n=0; n<placed[m].length; n++){
					allpoints.push({x:placed[m][n].x+placements[m].x, y: placed[m][n].y+placements[m].y});
				}
			}
			
			var allbounds;
			var partbounds;
			if(config.placementType == 'gravity' || config.placementType == 'box'){
				allbounds = GeometryUtil.getPolygonBounds(allpoints);
				
				var partpoints = [];
				for(m=0; m<part.length; m++){
					partpoints.push({x: part[m].x, y:part[m].y});
				}
				partbounds = GeometryUtil.getPolygonBounds(partpoints);
			}
			else{
				allpoints = getHull(allpoints);
			}
			for(j=0; j<finalNfp.length; j++){
				nf = finalNfp[j];
				//console.log('evalnf',nf.length);
				for(k=0; k<nf.length; k++){
					
					shiftvector = {
						x: nf[k].x-part[0].x,
						y: nf[k].y-part[0].y,
						id: part.id,
						source: part.source,
						rotation: part.rotation
					};
					
					
					/*for(m=0; m<part.length; m++){
						localpoints.push({x: part[m].x+shiftvector.x, y:part[m].y+shiftvector.y});
					}*/
					//console.time('evalbounds');
					
					if(config.placementType == 'gravity' || config.placementType == 'box'){
						var rectbounds = GeometryUtil.getPolygonBounds([
							// allbounds points
							{x: allbounds.x, y:allbounds.y},
							{x: allbounds.x+allbounds.width, y:allbounds.y},
							{x: allbounds.x+allbounds.width, y:allbounds.y+allbounds.height},
							{x: allbounds.x, y:allbounds.y+allbounds.height},
							
							// part points
							{x: partbounds.x+shiftvector.x, y:partbounds.y+shiftvector.y},
							{x: partbounds.x+partbounds.width+shiftvector.x, y:partbounds.y+shiftvector.y},
							{x: partbounds.x+partbounds.width+shiftvector.x, y:partbounds.y+partbounds.height+shiftvector.y},
							{x: partbounds.x+shiftvector.x, y:partbounds.y+partbounds.height+shiftvector.y}
						]);
						
						// weigh width more, to help compress in direction of gravity
						if(config.placementType == 'gravity'){
							area = rectbounds.width*2 + rectbounds.height;
						}
						else{
							area = rectbounds.width * rectbounds.height;
						}
					}
					else{
						// must be convex hull
						var localpoints = clone(allpoints);
						
						for(m=0; m<part.length; m++){
							localpoints.push({x: part[m].x+shiftvector.x, y:part[m].y+shiftvector.y});
						}
						
						area = Math.abs(GeometryUtil.polygonArea(getHull(localpoints)));
						shiftvector.hull = getHull(localpoints);
						shiftvector.hullsheet = getHull(sheet);
					}
					
					//console.timeEnd('evalbounds');
					//console.time('evalmerge');
					
					if(config.mergeLines){
						// if lines can be merged, subtract savings from area calculation						
						var shiftedpart = shiftPolygon(part, shiftvector);
						var shiftedplaced = [];
						
						for(m=0; m<placed.length; m++){
							shiftedplaced.push(shiftPolygon(placed[m], placements[m]));
						}
						
						// don't check small lines, cut off at about 1/2 in
						var minlength = 0.5*config.scale;
						var merged = mergedLength(shiftedplaced, shiftedpart, minlength, 0.1*config.curveTolerance);
						area -= merged.totalLength*config.timeRatio;
					}
					
					//console.timeEnd('evalmerge');
					
					if(
					minarea === null || 
					area < minarea || 
					(GeometryUtil.almostEqual(minarea, area) && (minx === null || shiftvector.x < minx)) ||
					(GeometryUtil.almostEqual(minarea, area) && (minx !== null && GeometryUtil.almostEqual(shiftvector.x, minx) && shiftvector.y < miny))
					){
						minarea = area;
						minwidth = rectbounds ? rectbounds.width : 0;
						position = shiftvector;
						if(minx === null || shiftvector.x < minx){
							minx = shiftvector.x;
						}
						if(miny === null || shiftvector.y < miny){
							miny = shiftvector.y;
						}
						
						if(config.mergeLines){
							position.mergedLength = merged.totalLength;
							position.mergedSegments = merged.segments;
						}
					}
				}
			}
			
			if(position){
				placed.push(part);
				placements.push(position);
				if(position.mergedLength){
					totalMerged += position.mergedLength;
				}
			}
			
			// send placement progress signal
			var placednum = placed.length;
			for(j=0; j<allplacements.length; j++){
				placednum += allplacements[j].sheetplacements.length;
			}
			//console.log(placednum, totalnum);
			ipcRenderer.send('background-progress', {index: nestindex, progress: 0.5 + 0.5*(placednum/totalnum)});
			console.timeEnd('placement');
		}
		
		//if(minwidth){
		fitness += (minwidth/sheetarea) + minarea;
		//}
		
		for(i=0; i<placed.length; i++){
			var index = parts.indexOf(placed[i]);
			if(index >= 0){
				parts.splice(index,1);
			}
		}
		
		if(placements && placements.length > 0){
			allplacements.push({sheet: sheet.source, sheetid: sheet.id, sheetplacements: placements});
		}
		else{
			break; // something went wrong
		}
		
		if(sheets.length == 0){
			break;
		}
	}
	
	// there were parts that couldn't be placed
	// scale this value high - we really want to get all the parts in, even at the cost of opening new sheets
	for(i=0; i<parts.length; i++){
		fitness += 100000000*(Math.abs(GeometryUtil.polygonArea(parts[i]))/totalsheetarea);
	}
	// send finish progerss signal
	ipcRenderer.send('background-progress', {index: nestindex, progress: -1});
	
	return {placements: allplacements, fitness: fitness, area: sheetarea, mergedLength: totalMerged };
}

// clipperjs uses alerts for warnings
function alert(message) { 
    console.log('alert: ', message);
}