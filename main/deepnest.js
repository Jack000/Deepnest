/*!
 * Deepnest
 * Licensed under GPLv3
 */
 
(function(root){
	'use strict';
	
	const { ipcRenderer } = require('electron');
	const path = require('path')
	const url = require('url')
	
	root.DeepNest = new DeepNest();
	
	function DeepNest(){
		var self = this;
		
		var svg = null;
		
		var config = {
			clipperScale: 10000000,
			curveTolerance: 0.3, 
			spacing: 0,
			rotations: 4,
			populationSize: 10,
			mutationRate: 10,
			threads: 4,
			placementType: 'gravity',
			mergeLines: true,
			timeRatio: 0.5,
			scale: 72,
			simplify: false
		};
		
		// list of imported files
		// import: {filename: 'blah.svg', svg: svgroot}
		this.imports = [];
		
		// list of all extracted parts
		// part: {name: 'part name', quantity: ...}
		this.parts = [];
		
		// a pure polygonal representation of parts that lives only during the nesting step
		this.partsTree = [];
		
		this.working = false;
		
		var GA = null;
		var best = null;
		var workerTimer = null;
		var progress = 0;
		
		var progressCallback = null;
		var displayCallback = null;
		// a running list of placements
		this.nests = [];
		
		this.importsvg = function(filename, dirpath, svgstring, scalingFactor, dxfFlag){
			// parse svg
			// config.scale is the default scale, and may not be applied
			// scalingFactor is an absolute scaling that must be applied regardless of input svg contents
			svg = SvgParser.load(dirpath, svgstring, config.scale, scalingFactor);
			svg = SvgParser.clean(dxfFlag);
			
			if(filename){
				this.imports.push({
					filename: filename,
					svg: svg
				});
			}
			
			var parts = this.getParts(svg.children);
			for(var i=0; i<parts.length; i++){
				this.parts.push(parts[i]);
			}
			
			// test simplification
			/*for(i=0; i<parts.length; i++){
				var part = parts[i];
				this.renderPolygon(part.polygontree, svg);
				var simple = this.simplifyPolygon(part.polygontree);
				this.renderPolygon(simple, svg, 'active');
				if(part.polygontree.children){
					for(var j=0; j<part.polygontree.children.length; j++){
						var schild = this.simplifyPolygon(part.polygontree.children[j], true);
						//this.renderPolygon(schild, svg, 'active');
					}
				}
				//this.renderPolygon(simple.exterior, svg, 'error');
			}*/
		}
		
		// debug function
		this.renderPolygon = function(poly, svg, highlight){
			if(!poly || poly.length == 0){
				return;
			}
			var polyline = window.document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				
			for(var i=0; i<poly.length; i++){
				var p = svg.createSVGPoint();
				p.x = poly[i].x;
				p.y = poly[i].y;
				polyline.points.appendItem(p);
			}
			if(highlight){
				polyline.setAttribute('class', highlight);
			}
			svg.appendChild(polyline);
		}
		
		// debug function
		this.renderPoints = function(points, svg, highlight){
			for(var i=0; i<points.length; i++){
				var circle = window.document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				circle.setAttribute('r', '5');
				circle.setAttribute('cx', points[i].x);
				circle.setAttribute('cy', points[i].y);
				circle.setAttribute('class', highlight);
				
				svg.appendChild(circle);
			}
		}
		
		this.getHull = function(polygon){
			var points = [];
			for(var i=0; i<polygon.length; i++){
				points.push([polygon[i].x, polygon[i].y]);
			}
			var hullpoints = d3.polygonHull(points);
			
			if(!hullpoints){
				return null;
			}
			
			var hull = [];
			for(i=0; i<hullpoints.length; i++){
				hull.push({x: hullpoints[i][0], y: hullpoints[i][1]});
			}
			
			return hull;
		}
		
		// use RDP simplification, then selectively offset
		this.simplifyPolygon = function(polygon, inside){
			var tolerance = 4*config.curveTolerance;
			
			// give special treatment to line segments above this length (squared)
			var fixedTolerance = 40*config.curveTolerance*40*config.curveTolerance;
			var i,j,k;
			var self = this;
			
			if(config.simplify){
				/*
				// use convex hull
				var hull = new ConvexHullGrahamScan();
				for(var i=0; i<polygon.length; i++){
					hull.addPoint(polygon[i].x, polygon[i].y);
				}
			
				return hull.getHull();*/
				var hull = this.getHull(polygon);
				if(hull){
					return hull;
				}
				else{
					return polygon;
				}
			}
			
			var cleaned = this.cleanPolygon(polygon);
			if(cleaned && cleaned.length > 1){
				polygon = cleaned;
			}
			else{
				return polygon;
			}
			
			// polygon to polyline
			var copy = polygon.slice(0);
			copy.push(copy[0]);
			
			// mark all segments greater than ~0.25 in to be kept
			// the PD simplification algo doesn't care about the accuracy of long lines, only the absolute distance of each point
			// we care a great deal
			for(i=0; i<copy.length-1; i++){
				var p1 = copy[i];
				var p2 = copy[i+1];
				var sqd = (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y);
				if(sqd > fixedTolerance){
					p1.marked = true;
					p2.marked = true;
				}
			}
			
			var simple = window.simplify(copy, tolerance, true);
			// now a polygon again
			simple.pop();
			
			// could be dirty again (self intersections and/or coincident points)
			simple = this.cleanPolygon(simple);
			
			// simplification process reduced poly to a line or point
			if(!simple){
				simple = polygon;
			}
			
			
			
			var offsets = this.polygonOffset(simple, inside ? -tolerance : tolerance);
			
			var offset = null;
			var offsetArea = 0;
			var holes = [];
			for(i=0; i<offsets.length; i++){
				var area = GeometryUtil.polygonArea(offsets[i]);
				if(offset == null || area < offsetArea){
					offset = offsets[i];
					offsetArea = area;
				}
				if(area > 0){
					holes.push(offsets[i]);
				}
			}
						
			// mark any points that are exact
			for(i=0; i<simple.length; i++){
				var seg = [simple[i], simple[i+1 == simple.length ? 0 : i+1]];
				var index1 = find(seg[0], polygon);
				var index2 = find(seg[1], polygon);
				
				if(index1 + 1 == index2 || index2+1 == index1 || (index1 == 0 && index2 == polygon.length-1) || (index2 == 0 && index1 == polygon.length-1)){
					seg[0].exact = true;
					seg[1].exact = true;
				}
			}
			
			var numshells = 4;
			var shells = [];
			
			for(j=1; j<numshells; j++){
				var delta = j*(tolerance/numshells);
				delta = inside ? -delta : delta;
				var shell = this.polygonOffset(simple, delta);
				if(shell.length > 0){
					shell = shell[0];
				}
				shells[j] = shell;
			}
						
			if(!offset){
				return polygon;
			}
			
			// selective reversal of offset
			for(i=0; i<offset.length; i++){
				var o = offset[i];
				var target = getTarget(o, simple, 2*tolerance);
				
				// reverse point offset and try to find exterior points
				var test = clone(offset);
				test[i] = {x: target.x, y: target.y};
				
				if(!exterior(test, polygon, inside)){
					o.x = target.x;
					o.y = target.y;
				}
				else{
					// a shell is an intermediate offset between simple and offset
					for(j=1; j<numshells; j++){
						if(shells[j]){
							var shell = shells[j];
							var delta = j*(tolerance/numshells);
							target = getTarget(o, shell, 2*delta);
							var test = clone(offset);
							test[i] = {x: target.x, y: target.y};
							if(!exterior(test, polygon, inside)){
								o.x = target.x;
								o.y = target.y;
								break;
							}
						}
					}
				}
			}
			
			
			// straighten long lines
			// a rounded rectangle would still have issues at this point, as the long sides won't line up straight
			
			var straightened = false;
			
			for(i=0; i<offset.length; i++){
				var p1 = offset[i];
				var p2 = offset[i+1 == offset.length ? 0 : i+1];
				
				var sqd = (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y);
				
				if(sqd < fixedTolerance){
					continue;
				}
				for(j=0; j<simple.length; j++){
					var s1 = simple[j];
					var s2 = simple[j+1 == simple.length ? 0 : j+1];
					
					var sqds = (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y);
				
					if(sqds < fixedTolerance){
						continue;
					}
					
					if((GeometryUtil.almostEqual(s1.x, s2.x) || GeometryUtil.almostEqual(s1.y, s2.y)) && // we only really care about vertical and horizontal lines
					GeometryUtil.withinDistance(p1, s1, 2*tolerance) && 
					GeometryUtil.withinDistance(p2, s2, 2*tolerance) && 
					(!GeometryUtil.withinDistance(p1, s1, config.curveTolerance/1000) ||
					!GeometryUtil.withinDistance(p2, s2, config.curveTolerance/1000))){
						p1.x = s1.x;
						p1.y = s1.y;
						p2.x = s2.x;
						p2.y = s2.y;
						straightened = true;
					}
				}
			}
			
			//if(straightened){
				var Ac = toClipperCoordinates(offset);
				ClipperLib.JS.ScaleUpPath(Ac, 10000000);
				var Bc = toClipperCoordinates(polygon);
				ClipperLib.JS.ScaleUpPath(Bc, 10000000);
				
				var combined = new ClipperLib.Paths();
				var clipper = new ClipperLib.Clipper();
				
				clipper.AddPath(Ac, ClipperLib.PolyType.ptSubject, true);
				clipper.AddPath(Bc, ClipperLib.PolyType.ptSubject, true);
			
				// the line straightening may have made the offset smaller than the simplified
				if(clipper.Execute(ClipperLib.ClipType.ctUnion, combined, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)){
					var largestArea = null;
					for(i=0; i<combined.length; i++){
						var n = toNestCoordinates(combined[i], 10000000);
						var sarea = -GeometryUtil.polygonArea(n);
						if(largestArea === null || largestArea < sarea){
							offset = n;
							largestArea = sarea;
						}
					}
				}
			//}
			
			cleaned = this.cleanPolygon(offset);
			if(cleaned && cleaned.length > 1){
				offset = cleaned;
			}
			
			// mark any points that are exact (for line merge detection)
			for(i=0; i<offset.length; i++){
				var seg = [offset[i], offset[i+1 == offset.length ? 0 : i+1]];
				var index1 = find(seg[0], polygon);
				var index2 = find(seg[1], polygon);
				
				if(index1 + 1 == index2 || index2+1 == index1 || (index1 == 0 && index2 == polygon.length-1) || (index2 == 0 && index1 == polygon.length-1)){
					seg[0].exact = true;
					seg[1].exact = true;
				}
			}
			
			if(!inside && holes && holes.length > 0){
				offset.children = holes;
			}
			
			return offset;
			
			function getTarget(point, simple, tol){
				var inrange = [];
				// find closest points within 2 offset deltas
				for(var j=0; j<simple.length; j++){
					var s = simple[j];
					var d2 = (o.x-s.x)*(o.x-s.x) + (o.y-s.y)*(o.y-s.y);
					if(d2 < tol*tol){
						inrange.push({point: s, distance: d2});
					}
				}
				
				var target;
				if(inrange.length > 0){
					var filtered = inrange.filter(function(p){
						return p.point.exact;
					});
					
					// use exact points when available, normal points when not
					inrange = filtered.length > 0 ? filtered : inrange;
					
					inrange.sort(function(a, b){
						return a.distance - b.distance;
					});
					
					target = inrange[0].point;
				}
				else{
					var mind = null;
					for(j=0; j<simple.length; j++){
						var s = simple[j];
						var d2 = (o.x-s.x)*(o.x-s.x) + (o.y-s.y)*(o.y-s.y);
						if(mind === null || d2 < mind){
							target = s;
							mind = d2;
						}
					}
				}
				
				return target;
			}
			
			// returns true if any complex vertices fall outside the simple polygon
			function exterior(simple, complex, inside){
				// find all protruding vertices
				for(var i=0; i<complex.length; i++){
					var v = complex[i];
					if(!inside && !self.pointInPolygon(v, simple) && find(v, simple) === null){
						return true;
					}
					if(inside && self.pointInPolygon(v, simple) && !find(v, simple) === null){
						return true;
					}
				}
				return false;
			}
			
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
			
			function find(v, p){
				for(var i=0; i<p.length; i++){
					if(GeometryUtil.withinDistance(v, p[i], config.curveTolerance/1000)){
						return i;
					}
				}
				return null;
			}
			
			function clone(p){
				var newp = [];
				for(var i=0; i<p.length; i++){
					newp.push({
						x: p[i].x,
						y: p[i].y
					});
				}
	
				return newp;
			}
		}
		
		this.config = function(c){
			// clean up inputs
			
			if(!c){
				return config;
			}
			
			if(c.curveTolerance && !GeometryUtil.almostEqual(parseFloat(c.curveTolerance), 0)){
				config.curveTolerance =  parseFloat(c.curveTolerance);
			}
			
			if('spacing' in c){
				config.spacing = parseFloat(c.spacing);
			}
			
			if(c.rotations && parseInt(c.rotations) > 0){
				config.rotations = parseInt(c.rotations);
			}
			
			if(c.populationSize && parseInt(c.populationSize) > 2){
				config.populationSize = parseInt(c.populationSize);
			}
			
			if(c.mutationRate && parseInt(c.mutationRate) > 0){
				config.mutationRate = parseInt(c.mutationRate);
			}
			
			if(c.threads && parseInt(c.threads) > 0){
				// max 8 threads
				config.threads = Math.min(parseInt(c.threads), 8);
			}
			
			if(c.placementType){
				config.placementType = String(c.placementType);
			}
			
			if(c.mergeLines === true || c.mergeLines === false){
				config.mergeLines = !!c.mergeLines;
			}
			
			if(c.simplify === true || c.simplify === false){
				config.simplify = !!c.simplify;
			}
			
			var n = Number(c.timeRatio);
			if(typeof n == 'number' && !isNaN(n) && isFinite(n)){
				config.timeRatio = n;
			}
			
			if(c.scale && parseInt(c.scale) > 0){
				config.scale = parseInt(c.scale);
			}

			SvgParser.config({ tolerance: config.curveTolerance, endpointTolerance: c.endpointTolerance});
			
			best = null;
			//nfpCache = {};
			//binPolygon = null;
			GA = null;
						
			return config;
		}
		
		this.pointInPolygon = function(point, polygon){
			// scaling is deliberately coarse to filter out points that lie *on* the polygon
			var p = this.svgToClipper(polygon, 1000);
			var pt = new ClipperLib.IntPoint(1000*point.x,1000*point.y);
			
			return ClipperLib.Clipper.PointInPolygon(pt, p) > 0;
		}
		
		/*this.simplifyPolygon = function(polygon, concavehull){
			function clone(p){
				var newp = [];
				for(var i=0; i<p.length; i++){
					newp.push({
						x: p[i].x,
						y: p[i].y
						//fuck: p[i].fuck
					});
				}
				return newp;
			}
			if(concavehull){
				var hull = concavehull;
			}
			else{
				var hull = new ConvexHullGrahamScan();
				for(var i=0; i<polygon.length; i++){
					hull.addPoint(polygon[i].x, polygon[i].y);
				}
			
				hull = hull.getHull();
			}
			
			var hullarea = Math.abs(GeometryUtil.polygonArea(hull));
			
			var concave = [];
			var detail = [];
			
			// fill concave[] with convex points, ensuring same order as initial polygon
			for(i=0; i<polygon.length; i++){
				var p = polygon[i];
				var found = false;
				for(var j=0; j<hull.length; j++){
					var hp = hull[j];
					if(GeometryUtil.almostEqual(hp.x, p.x) && GeometryUtil.almostEqual(hp.y, p.y)){
						found = true;
						break;
					}
				}
				
				if(found){
					concave.push(p);
					//p.fuck = i+'yes';
				}
				else{
					detail.push(p);
					//p.fuck = i+'no';
				}
			}
			
			var cindex = -1;
			var simple = [];
			
			for(i=0; i<polygon.length; i++){
				var p = polygon[i];
				if(concave.indexOf(p) > -1){
					cindex = concave.indexOf(p);
					simple.push(p);
				}
				else{
					
					var test = clone(concave);
					test.splice(cindex < 0 ? 0 : cindex+1,0,p);
					
					var outside = false;
					for(var j=0; j<detail.length; j++){
						if(detail[j] == p){
							continue;
						}
						if(!this.pointInPolygon(detail[j], test)){
							//console.log(detail[j], test);
							outside = true;
							break;
						}
					}
					
					if(outside){
						continue;
					}
					
					var testarea =  Math.abs(GeometryUtil.polygonArea(test));
					//console.log(testarea, hullarea);
					if(testarea/hullarea < 0.98){
						simple.push(p);
					}
				}
			}
			
			return simple;
		}*/
		
		// assuming no intersections, return a tree where odd leaves are parts and even ones are holes
		// might be easier to use the DOM, but paths can't have paths as children. So we'll just make our own tree.
		this.getParts = function(paths){
			
			var i, j;
			var polygons = [];
			
			var numChildren = paths.length;
			for(i=0; i<numChildren; i++){
			
				if(SvgParser.polygonElements.indexOf(paths[i].tagName) < 0){
					continue;
				}
				
				// don't use open paths
				if(!SvgParser.isClosed(paths[i], 2*config.curveTolerance)){
					continue;
				}
				
				var poly = SvgParser.polygonify(paths[i]);
				poly = this.cleanPolygon(poly);
				
				// todo: warn user if poly could not be processed and is excluded from the nest
				if(poly && poly.length > 2 && Math.abs(GeometryUtil.polygonArea(poly)) > config.curveTolerance*config.curveTolerance){
					poly.source = i;
					polygons.push(poly);
				}
			}
						
			// turn the list into a tree
			// root level nodes of the tree are parts
			toTree(polygons);
						
			function toTree(list, idstart){
				function svgToClipper(polygon){
					var clip = [];
					for(var i=0; i<polygon.length; i++){
						clip.push({X: polygon[i].x, Y: polygon[i].y});
					}
			
					ClipperLib.JS.ScaleUpPath(clip, config.clipperScale);
			
					return clip;
				}
				function pointInClipperPolygon(point, polygon){
					var pt = new ClipperLib.IntPoint(config.clipperScale*point.x,config.clipperScale*point.y);
					
					return ClipperLib.Clipper.PointInPolygon(pt, polygon) > 0;
				}
				var parents = [];
				var i,j,k;
				
				// assign a unique id to each leaf
				var id = idstart || 0;
				
				for(i=0; i<list.length; i++){
					var p = list[i];
					
					var ischild = false;
					for(j=0; j<list.length; j++){
						if(j==i){
							continue;
						}
						if(p.length < 2){
							continue;
						}
						var inside = 0;
						var fullinside = Math.min(10, p.length);
						
						// sample about 10 points
						var clipper_polygon = svgToClipper(list[j]);
						
						for(k=0; k<fullinside; k++){
							if(pointInClipperPolygon(p[k], clipper_polygon) === true){
								inside++;
							}
						}
						
						//console.log(inside, fullinside);
						
						if(inside > 0.5*fullinside){
							if(!list[j].children){
								list[j].children = [];
							}
							list[j].children.push(p);
							p.parent = list[j];
							ischild = true;
							break;
						}
					}
					
					if(!ischild){
						parents.push(p);
					}
				}
				
				for(i=0; i<list.length; i++){
					if(parents.indexOf(list[i]) < 0){
						list.splice(i, 1);
						i--;
					}
				}
				
				for(i=0; i<parents.length; i++){
					parents[i].id = id;
					id++;
				}
				
				for(i=0; i<parents.length; i++){
					if(parents[i].children){
						id = toTree(parents[i].children, id);
					}
				}
								
				return id;
			};
			
			// construct part objects with metadata
			var parts = [];
			var svgelements = Array.prototype.slice.call(paths);
			var openelements = svgelements.slice(); // elements that are not a part of the poly tree but may still be a part of the part (images, lines, possibly text..)
			
			for(i=0; i<polygons.length; i++){
				var part = {};
				part.polygontree = polygons[i];
				part.svgelements = [];
				
				var bounds = GeometryUtil.getPolygonBounds(part.polygontree);
				part.bounds = bounds;
				part.area = bounds.width*bounds.height;
				part.quantity = 1;
				
				// load root element
				part.svgelements.push(svgelements[part.polygontree.source]);
				var index = openelements.indexOf(svgelements[part.polygontree.source]);
				if(index > -1){
					openelements.splice(index,1);
				}
				
				// load all elements that lie within the outer polygon
				for(j=0; j<svgelements.length; j++){
					if(j != part.polygontree.source && findElementById(j, part.polygontree)){
						part.svgelements.push(svgelements[j]);
						index = openelements.indexOf(svgelements[j]);
						if(index > -1){
							openelements.splice(index,1);
						}
					}
				}
				
				parts.push(part);
			}
			
			function findElementById(id, tree){
				if(id == tree.source){
					return true;
				}
				
				if(tree.children && tree.children.length > 0){
					for(var i=0; i<tree.children.length; i++){
						if(findElementById(id, tree.children[i])){
							return true;
						}
					}
				}
				
				return false;
			}
						
			for(i=0; i<parts.length; i++){
				var part = parts[i];
				// the elements left are either erroneous or open
				// we want to include open segments that also lie within the part boundaries
				for(j=0; j<openelements.length; j++){
					var el = openelements[j];
					if(el.tagName == 'line'){
						var x1 = Number(el.getAttribute('x1'));
						var x2 = Number(el.getAttribute('x2'));
						var y1 = Number(el.getAttribute('y1'));
						var y2 = Number(el.getAttribute('y2'));
						var start = {x: x1, y: y1};
						var end = {x: x2, y: y2};
						var mid = {x: ((start.x+end.x)/2), y: ((start.y+end.y)/2)};

						if(this.pointInPolygon(start, part.polygontree) === true || 
							this.pointInPolygon(end, part.polygontree) === true ||
							this.pointInPolygon(mid, part.polygontree) === true ){
							part.svgelements.push(el);
							openelements.splice(j,1);
							j--;
						}
					}
					else if(el.tagName == 'image'){
						var x = Number(el.getAttribute('x'));
						var y = Number(el.getAttribute('y'));
						var width = Number(el.getAttribute('width'));
						var height = Number(el.getAttribute('height'));
						
						var mid = {x:x+(width/2) , y:y+(height/2)};
						
						var transformString = el.getAttribute('transform')
						if(transformString){
							var transform = SvgParser.transformParse(transformString);
							if(transform){
								var transformed = transform.calc(mid.x, mid.y);
								mid.x = transformed[0];
								mid.y = transformed[1];
							}
						}
						// just test midpoint for images
						if(this.pointInPolygon(mid, part.polygontree) === true){
							part.svgelements.push(el);
							openelements.splice(j,1);
							j--;
						}
					}
					else if(el.tagName == 'path' || el.tagName == 'polyline'){
						var k;
						if(el.tagName == 'path'){
							var p = SvgParser.polygonifyPath(el);
						}
						else{
							var p = [];
							for(k=0; k<el.points.length; k++){
								p.push({
									x: el.points[k].x,
									y: el.points[k].y
								});
							}
						}
						
						if(p.length < 2){
							continue;
						}
						
						var found = false;
						var next = p[1];
						for(k=0; k<p.length; k++){
							if(this.pointInPolygon(p[k], part.polygontree) === true){
								found = true;
								break;
							}
							
							if(k >= p.length-1){
								next = p[0];
							}
							else{
								next = p[k+1];
							}
							
							// also test for midpoints in case of single line edge case
							var mid = {
								x: (p[k].x+next.x)/2,
								y: (p[k].y+next.y)/2
							};
							if(this.pointInPolygon(mid, part.polygontree) === true){
								found = true;
								break;
							}
							
						}
						if(found){
							part.svgelements.push(el);
							openelements.splice(j,1);
							j--;
						}
					}
					else{
						// something went wrong
						//console.log('part not processed: ',el);
					}
				}
			}
			
			for(j=0; j<openelements.length; j++){
				var el = openelements[j];
				if(el.tagName == 'line' || el.tagName == 'polyline' || el.tagName == 'path'){
					el.setAttribute('class', 'error');
				}
			}
			
			return parts;
		};
		
		this.cloneTree = function(tree){
			var newtree = [];
			tree.forEach(function(t){
				newtree.push({x: t.x, y: t.y, exact: t.exact});
			});
			
			var self = this;
			if(tree.children && tree.children.length > 0){
				newtree.children = [];
				tree.children.forEach(function(c){
					newtree.children.push(self.cloneTree(c));
				});
			}
			
			return newtree;
		}
		
		// progressCallback is called when progress is made
		// displayCallback is called when a new placement has been made
		this.start = function(p, d){						
			progressCallback = p;
			displayCallback = d;
			
			var parts = [];
			
			/*while(this.nests.length > 0){
				this.nests.pop();
			}*/
			
			// send only bare essentials through ipc
			for(var i=0; i<this.parts.length; i++){
				parts.push({
					quantity: this.parts[i].quantity,
					sheet: this.parts[i].sheet,
					polygontree: this.cloneTree(this.parts[i].polygontree)
				});
			}
			
			for(i=0; i<parts.length; i++){
				if(parts[i].sheet){
					offsetTree(parts[i].polygontree, -0.5*config.spacing, this.polygonOffset.bind(this), this.simplifyPolygon.bind(this), true);
				}
				else{
					offsetTree(parts[i].polygontree, 0.5*config.spacing, this.polygonOffset.bind(this), this.simplifyPolygon.bind(this));
				}
			}
						
			// offset tree recursively
			function offsetTree(t, offset, offsetFunction, simpleFunction, inside){
				var simple = t;
				if(simpleFunction){
					simple = simpleFunction(t, !!inside);
				}
				
				var offsetpaths = [simple];
				if(offset > 0){
					offsetpaths = offsetFunction(simple, offset);
				}
				
				if(offsetpaths.length > 0){
					//var cleaned = cleanFunction(offsetpaths[0]); 
					
					// replace array items in place
					Array.prototype.splice.apply(t, [0, t.length].concat(offsetpaths[0]));
				}
				
				if(simple.children && simple.children.length > 0){
					if(!t.children){
						t.children = [];
					}
					
					for(var i=0; i<simple.children.length; i++){
						t.children.push(simple.children[i]);
					}
				}
				
				if(t.children && t.children.length > 0){
					for(var i=0; i<t.children.length; i++){
						offsetTree(t.children[i], -offset, offsetFunction, simpleFunction, !inside);
					}
				}
			}
			
			var self = this;
			this.working = true;
			
			if(!workerTimer){
				workerTimer = setInterval(function(){
					self.launchWorkers.call(self, parts, config, progressCallback, displayCallback);
					//progressCallback(progress);
				}, 100);
			}
		}
		
		ipcRenderer.on('background-response', (event, payload) => {
			console.log('ipc response',payload);
			if(!GA){
				// user might have quit while we're away
				return;
			}
			GA.population[payload.index].processing = false;
			GA.population[payload.index].fitness = payload.fitness;
			
			// render placement
			if(this.nests.length == 0 || this.nests[0].fitness > payload.fitness ){
				this.nests.unshift(payload);
				
				if(this.nests.length > 10){
					this.nests.pop();
				}
				if(displayCallback){
					displayCallback();
				}
			}
		});
		
		this.launchWorkers = function(parts, config, progressCallback, displayCallback){
			function shuffle(array) {
			  var currentIndex = array.length, temporaryValue, randomIndex ;

			  // While there remain elements to shuffle...
			  while (0 !== currentIndex) {

				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			  }

			  return array;
			}
			
			var i,j;
			
			if(GA === null){
				// initiate new GA
				
				var adam = [];
				var id = 0;
				for(i=0; i<parts.length; i++){
					if(!parts[i].sheet){
						
						for(j=0; j<parts[i].quantity; j++){
							var poly = this.cloneTree(parts[i].polygontree); // deep copy
							poly.id = id; // id is the unique id of all parts that will be nested, including cloned duplicates
							poly.source = i; // source is the id of each unique part from the main part list
							
							adam.push(poly);
							id++;
						}
					}
				}

				// seed with decreasing area
				adam.sort(function(a, b){
					return Math.abs(GeometryUtil.polygonArea(b)) - Math.abs(GeometryUtil.polygonArea(a));
				});
				
				GA = new GeneticAlgorithm(adam, config);
				//console.log(GA.population[1].placement);				
			}
									
			// check if current generation is finished
			var finished = true;
			for(i=0; i<GA.population.length; i++){
				if(!GA.population[i].fitness){
					finished = false;
					break;
				}
			}
			
			if(finished){
				console.log('new generation!');
				// all individuals have been evaluated, start next generation
				GA.generation();
			}
			
			var running = GA.population.filter(function(p){
				return !!p.processing;
			}).length;
			
			
			var sheets = [];
			var sheetids = [];
			var sheetsources = [];
			var sheetchildren = [];
			var sid = 0;
			for(i=0; i<parts.length; i++){
				if(parts[i].sheet){
					var poly = parts[i].polygontree;
					for(j=0; j<parts[i].quantity; j++){
						sheets.push(poly);
						sheetids.push(sid);
						sheetsources.push(i);
						sheetchildren.push(poly.children);
						sid++;
					}
				}
			}
			
			
			for(i=0; i<GA.population.length; i++){
				//if(running < config.threads && !GA.population[i].processing && !GA.population[i].fitness){
				// only one background window now...
				if(running < 1 && !GA.population[i].processing && !GA.population[i].fitness){
					GA.population[i].processing = true;
										
					// hash values on arrays don't make it across ipc, store them in an array and reassemble on the other side....
					var ids = [];
					var sources = [];
					var children = [];
					
					for(j=0; j<GA.population[i].placement.length; j++){
						var id = GA.population[i].placement[j].id;
						var source = GA.population[i].placement[j].source;
						var child = GA.population[i].placement[j].children;
						ids[j] = id;
						sources[j] = source;
						children[j] = child;
					}
					
					ipcRenderer.send('background-start', {index: i, sheets: sheets, sheetids: sheetids, sheetsources: sheetsources, sheetchildren: sheetchildren, individual: GA.population[i], config: config, ids: ids, sources: sources, children: children});
					running++;					
				}
			}
		}
		
		// use the clipper library to return an offset to the given polygon. Positive offset expands the polygon, negative contracts
		// note that this returns an array of polygons
		this.polygonOffset = function(polygon, offset){
			if(!offset || offset == 0 || GeometryUtil.almostEqual(offset, 0)){
				return polygon;
			}
			
			var p = this.svgToClipper(polygon);
			
			var miterLimit = 4;
			var co = new ClipperLib.ClipperOffset(miterLimit, config.curveTolerance*config.clipperScale);
			co.AddPath(p, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
			
			var newpaths = new ClipperLib.Paths();
			co.Execute(newpaths, offset*config.clipperScale);
			
			var result = [];
			for(var i=0; i<newpaths.length; i++){
				result.push(this.clipperToSvg(newpaths[i]));
			}
			
			return result;
		};
		
		// returns a less complex polygon that satisfies the curve tolerance
		this.cleanPolygon = function(polygon){
			var p = this.svgToClipper(polygon);
			// remove self-intersections and find the biggest polygon that's left
			var simple = ClipperLib.Clipper.SimplifyPolygon(p, ClipperLib.PolyFillType.pftNonZero);
			
			if(!simple || simple.length == 0){
				return null;
			}
			
			var biggest = simple[0];
			var biggestarea = Math.abs(ClipperLib.Clipper.Area(biggest));
			for(var i=1; i<simple.length; i++){
				var area = Math.abs(ClipperLib.Clipper.Area(simple[i]));
				if(area > biggestarea){
					biggest = simple[i];
					biggestarea = area;
				}
			}

			// clean up singularities, coincident points and edges
			var clean = ClipperLib.Clipper.CleanPolygon(biggest, 0.01*config.curveTolerance*config.clipperScale);
			
			if(!clean || clean.length == 0){
				return null;
			}
			
			var cleaned = this.clipperToSvg(clean);
			
			// remove duplicate endpoints
			var start = cleaned[0];
			var end = cleaned[cleaned.length-1];
			if(start == end || (GeometryUtil.almostEqual(start.x,end.x) && GeometryUtil.almostEqual(start.y,end.y))){
				cleaned.pop();
			}
						
			return cleaned;
		}
		
		
		// converts a polygon from normal float coordinates to integer coordinates used by clipper, as well as x/y -> X/Y
		this.svgToClipper = function(polygon, scale){
			var clip = [];
			for(var i=0; i<polygon.length; i++){
				clip.push({X: polygon[i].x, Y: polygon[i].y});
			}
			
			ClipperLib.JS.ScaleUpPath(clip, scale || config.clipperScale);
			
			return clip;
		}
		
		this.clipperToSvg = function(polygon){
			var normal = [];
			
			for(var i=0; i<polygon.length; i++){
				normal.push({x: polygon[i].X/config.clipperScale, y: polygon[i].Y/config.clipperScale});
			}
			
			return normal;
		}
		
		// returns an array of SVG elements that represent the placement, for export or rendering
		this.applyPlacement = function(placement){
			var i, j, k;
			var clone = [];
			for(i=0; i<parts.length; i++){
				clone.push(parts[i].cloneNode(false));
			}
			
			var svglist = [];

			for(i=0; i<placement.length; i++){
				var newsvg = svg.cloneNode(false);
				newsvg.setAttribute('viewBox', '0 0 '+binBounds.width+' '+binBounds.height);
				newsvg.setAttribute('width',binBounds.width + 'px');
				newsvg.setAttribute('height',binBounds.height + 'px');
				var binclone = bin.cloneNode(false);
				
				binclone.setAttribute('class','bin');
				binclone.setAttribute('transform','translate('+(-binBounds.x)+' '+(-binBounds.y)+')');
				newsvg.appendChild(binclone);

				for(j=0; j<placement[i].length; j++){
					var p = placement[i][j];
					var part = tree[p.id];
					
					// the original path could have transforms and stuff on it, so apply our transforms on a group
					var partgroup = document.createElementNS(svg.namespaceURI, 'g');
					partgroup.setAttribute('transform','translate('+p.x+' '+p.y+') rotate('+p.rotation+')');
					partgroup.appendChild(clone[part.source]);
					
					if(part.children && part.children.length > 0){
						var flattened = _flattenTree(part.children, true);
						for(k=0; k<flattened.length; k++){
							
							var c = clone[flattened[k].source];
							if(flattened[k].hole){
								c.setAttribute('class','hole');
							}
							partgroup.appendChild(c);
						}
					}
					
					newsvg.appendChild(partgroup);
				}
				
				svglist.push(newsvg);
			}
			
			// flatten the given tree into a list
			function _flattenTree(t, hole){
				var flat = [];
				for(var i=0; i<t.length; i++){
					flat.push(t[i]);
					t[i].hole = hole;
					if(t[i].children && t[i].children.length > 0){
						flat = flat.concat(_flattenTree(t[i].children, !hole));
					}
				}
				
				return flat;
			}
			
			return svglist;
		}
		
		this.stop = function(){
			this.working = false;
			if(GA && GA.population && GA.population.length > 0){
				GA.population.forEach(function(i){
					i.processing = false;
				});
			}
			if(workerTimer){
				clearInterval(workerTimer);
				workerTimer = null;
			}
		};
		
		this.reset = function(){
			GA = null;
			while(this.nests.length > 0){
				this.nests.pop();
			}
			progressCallback = null;
			displayCallback = null;
		}
	}
	
	function GeneticAlgorithm(adam, config){
	
		this.config = config || { populationSize: 10, mutationRate: 10, rotations: 4 };
				
		// population is an array of individuals. Each individual is a object representing the order of insertion and the angle each part is rotated
		var angles = [];
		for(var i=0; i<adam.length; i++){
			var angle = Math.floor(Math.random()*this.config.rotations)*(360/this.config.rotations);
			angles.push(angle);
		}
		
		this.population = [{placement: adam, rotation: angles}];
		
		while(this.population.length < config.populationSize){
			var mutant = this.mutate(this.population[0]);
			this.population.push(mutant);
		}
	}
	
	// returns a mutated individual with the given mutation rate
	GeneticAlgorithm.prototype.mutate = function(individual){
		var clone = {placement: individual.placement.slice(0), rotation: individual.rotation.slice(0)};
		for(var i=0; i<clone.placement.length; i++){
			var rand = Math.random();
			if(rand < 0.01*this.config.mutationRate){
				// swap current part with next part
				var j = i+1;
				
				if(j < clone.placement.length){
					var temp = clone.placement[i];
					clone.placement[i] = clone.placement[j];
					clone.placement[j] = temp;
				}
			}
			
			rand = Math.random();
			if(rand < 0.01*this.config.mutationRate){
				clone.rotation[i] = Math.floor(Math.random()*this.config.rotations)*(360/this.config.rotations);
			}
		}
		
		return clone;
	}
	
	// single point crossover
	GeneticAlgorithm.prototype.mate = function(male, female){
		var cutpoint = Math.round(Math.min(Math.max(Math.random(), 0.1), 0.9)*(male.placement.length-1));
		
		var gene1 = male.placement.slice(0,cutpoint);
		var rot1 = male.rotation.slice(0,cutpoint);
		
		var gene2 = female.placement.slice(0,cutpoint);
		var rot2 = female.rotation.slice(0,cutpoint);
		
		var i;
		
		for(i=0; i<female.placement.length; i++){
			if(!contains(gene1, female.placement[i].id)){
				gene1.push(female.placement[i]);
				rot1.push(female.rotation[i]);
			}
		}
		
		for(i=0; i<male.placement.length; i++){
			if(!contains(gene2, male.placement[i].id)){
				gene2.push(male.placement[i]);
				rot2.push(male.rotation[i]);
			}
		}
		
		function contains(gene, id){
			for(var i=0; i<gene.length; i++){
				if(gene[i].id == id){
					return true;
				}
			}
			return false;
		}
		
		return [{placement: gene1, rotation: rot1},{placement: gene2, rotation: rot2}];
	}

	GeneticAlgorithm.prototype.generation = function(){
				
		// Individuals with higher fitness are more likely to be selected for mating
		this.population.sort(function(a, b){
			return a.fitness - b.fitness;
		});
		
		// fittest individual is preserved in the new generation (elitism)
		var newpopulation = [this.population[0]];
		
		while(newpopulation.length < this.population.length){
			var male = this.randomWeightedIndividual();
			var female = this.randomWeightedIndividual(male);
			
			// each mating produces two children
			var children = this.mate(male, female);
			
			// slightly mutate children
			newpopulation.push(this.mutate(children[0]));
				
			if(newpopulation.length < this.population.length){
				newpopulation.push(this.mutate(children[1]));
			}
		}
				
		this.population = newpopulation;
	}
	
	// returns a random individual from the population, weighted to the front of the list (lower fitness value is more likely to be selected)
	GeneticAlgorithm.prototype.randomWeightedIndividual = function(exclude){
		var pop = this.population.slice(0);
		
		if(exclude && pop.indexOf(exclude) >= 0){
			pop.splice(pop.indexOf(exclude),1);
		}
		
		var rand = Math.random();
		
		var lower = 0;
		var weight = 1/pop.length;
		var upper = weight;
		
		for(var i=0; i<pop.length; i++){
			// if the random number falls between lower and upper bounds, select this individual
			if(rand > lower && rand < upper){
				return pop[i];
			}
			lower = upper;
			upper += 2*weight * ((pop.length-i)/pop.length);
		}
		
		return pop[0];
	}
	
})(this);