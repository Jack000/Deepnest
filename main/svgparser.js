/*!
 * SvgParser
 * A library to convert an SVG string to parse-able segments for CAD/CAM use
 * Licensed under the MIT license
 */
 
 (function(root){
	'use strict';
	
	function SvgParser(){
		// the SVG document
		this.svg;
		
		// the top level SVG element of the SVG document
		this.svgRoot;
		
		// elements that can be imported
		this.allowedElements = ['svg','circle','ellipse','path','polygon','polyline','rect','image','line'];
		
		// elements that can be polygonified
		this.polygonElements = ['svg','circle','ellipse','path','polygon','polyline','rect'];
				
		this.conf = {
			tolerance: 2, // max bound for bezier->line segment conversion, in native SVG units
			toleranceSvg: 0.01, // fudge factor for browser inaccuracy in SVG unit handling
			scale: 72,
			endpointTolerance: 2
		};
		
		this.dirPath = null;
	}
	
	SvgParser.prototype.config = function(config){
		this.conf.tolerance = Number(config.tolerance);
		this.conf.endpointTolerance = Number(config.endpointTolerance);
	}
	
	SvgParser.prototype.load = function(dirpath, svgString, scale, scalingFactor){
	
		if(!svgString || typeof svgString !== 'string'){
			throw Error('invalid SVG string');
		}
		
		// small hack. inkscape svgs opened and saved in illustrator will fail from a lack of an inkscape xmlns
		if(/inkscape/.test(svgString) && !/xmlns:inkscape/.test(svgString)){
			svgString = svgString.replace(/xmlns=/i, ' xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns=');
		}
		
		var parser = new DOMParser();
		var svg = parser.parseFromString(svgString, "image/svg+xml");
		this.dirPath = dirpath;
		
		var failed = svg.documentElement.nodeName.indexOf('parsererror')>-1;
		if(failed){
			console.log('svg DOM parsing error: '+svg.documentElement.nodeName);
		}
		if(svg){
			// scale the svg so that our scale parameter is preserved
			var root = svg.firstElementChild;
			
			this.svg = svg;
			this.svgRoot = root;
			
			// get local scaling factor from svg root "width" dimension
			var width = root.getAttribute('width');
			var viewBox = root.getAttribute('viewBox');
			
			var transform = root.getAttribute('transform') || '';
						
			if(!width || !viewBox){
				if(!scalingFactor){
					return this.svgRoot;
				}
				else{
					// apply absolute scaling
					transform += ' scale('+scalingFactor+')';
					root.setAttribute('transform', transform);
					
					this.conf.scale *= scalingFactor;
					return this.svgRoot;
				}
			}
			
			width = width.trim();
			viewBox = viewBox.trim().split(/[\s,]+/);
			
			if(!width || viewBox.length < 4){
				return this.svgRoot;
			}
			
			var pxwidth = viewBox[2];
			
			// localscale is in pixels/inch, regardless of units
			var localscale = null;
			
			if(/in/.test(width)){
				width = Number(width.replace(/[^0-9\.]/g, ''));
				localscale = pxwidth/width;
			}
			else if(/mm/.test(width)){
				width = Number(width.replace(/[^0-9\.]/g, ''));
				localscale = (25.4*pxwidth)/width;
			}
			else if(/cm/.test(width)){
				width = Number(width.replace(/[^0-9\.]/g, ''));
				localscale = (2.54*pxwidth)/width;
			}
			else if(/pt/.test(width)){
				width = Number(width.replace(/[^0-9\.]/g, ''));
				localscale = (72*pxwidth)/width;
			}
			else if(/pc/.test(width)){
				width = Number(width.replace(/[^0-9\.]/g, ''));
				localscale = (6*pxwidth)/width;
			}
			// these are css "pixels"
			else if(/px/.test(width)){
				width = Number(width.replace(/[^0-9\.]/g, ''));
				localscale = (96*pxwidth)/width;
			}
			
			if(localscale === null){
				localscale = scalingFactor;
			}
			else if(scalingFactor){
				localscale *= scalingFactor;
			}
						
			// no scaling factor
			if(localscale === null){
				console.log('no scale');
				return this.svgRoot;
			}
			
			transform = root.getAttribute('transform') || '';
			
			transform += ' scale('+(scale/localscale)+')';
			
			root.setAttribute('transform', transform);
			
			this.conf.scale *= scale/localscale;
		}
		
		return this.svgRoot;
	}
	
	// use the utility functions in this class to prepare the svg for CAD-CAM/nest related operations
	SvgParser.prototype.cleanInput = function(dxfFlag){
		
		// apply any transformations, so that all path positions etc will be in the same coordinate space
		this.applyTransform(this.svgRoot, '', false, dxfFlag);

		// remove any g elements and bring all elements to the top level
		this.flatten(this.svgRoot);
		
		// remove any non-geometric elements like text
		this.filter(this.allowedElements);
		
		this.imagePaths(this.svgRoot);
		//console.log(this.svgRoot);
		
		// split any compound paths into individual path elements
		this.recurse(this.svgRoot, this.splitPath);
		//console.log(this.svgRoot);
		
		// this kills overlapping lines, but may have unexpected edge cases
		// eg. open paths that share endpoints with segments of closed paths
		/*this.splitLines(this.svgRoot);
		
		this.mergeOverlap(this.svgRoot, 0.1*this.conf.toleranceSvg);*/
		
		// merge open paths into closed paths
		// for numerically accurate exports
		this.mergeLines(this.svgRoot, this.conf.toleranceSvg);
		
		console.log('this is the scale ',this.conf.scale*(0.02), this.conf.endpointTolerance);	
		//console.log('scale',this.conf.scale);
		// for exports with wide gaps, roughly 0.005 inch
		this.mergeLines(this.svgRoot, this.conf.endpointTolerance);
		// finally close any open paths with a really wide margin
		this.mergeLines(this.svgRoot, 3*this.conf.endpointTolerance);	
		
		
		
		
		return this.svgRoot;
	}
		
	
	SvgParser.prototype.imagePaths = function(svg){
		if(!this.dirPath){
			return false;
		}
		for(var i=0; i<svg.children.length; i++){
			var e = svg.children[i];
			if(e.tagName == 'image'){
				var relpath = e.getAttribute('href');
				if(!relpath){
					relpath = e.getAttribute('xlink:href');
				}
				var abspath = this.dirPath + '/' + relpath;
				e.setAttribute('href', abspath);
				e.setAttribute('data-href',relpath);
			}
		}
	}
	
	// return a path from list that has one and only one endpoint that is coincident with the given path
	SvgParser.prototype.getCoincident = function(path, list, tolerance){
		var index = list.indexOf(path);
				
		if(index < 0 || index == list.length-1){
			return null;
		}
				
		var coincident = [];
		for(var i=index+1; i<list.length; i++){
			var c = list[i];
			
			if(GeometryUtil.almostEqualPoints(path.endpoints.start, c.endpoints.start, tolerance)){
				coincident.push({path: c, reverse1: true, reverse2: false});
			}
			else if(GeometryUtil.almostEqualPoints(path.endpoints.start, c.endpoints.end, tolerance)){
				coincident.push({path: c, reverse1: true, reverse2: true});
			}
			else if(GeometryUtil.almostEqualPoints(path.endpoints.end, c.endpoints.end, tolerance)){
				coincident.push({path: c, reverse1: false, reverse2: true});
			}
			else if(GeometryUtil.almostEqualPoints(path.endpoints.end, c.endpoints.start, tolerance)){
				coincident.push({path: c, reverse1: false, reverse2: false});
			}
		}
		
		// there is an edge case here where the start point of 3 segments coincide. not going to bother...
		if(coincident.length > 0){
			return coincident[0];
		}
		return null;
	}
	
	SvgParser.prototype.mergeLines = function(root, tolerance){	
	
		/*for(var i=0; i<root.children.length; i++){
			var p = root.children[i];
			if(!this.isClosed(p)){
				this.reverseOpenPath(p);
			}
		}
		
		return false;*/
		var openpaths = [];
		for(var i=0; i<root.children.length; i++){
			var p = root.children[i];
			if(!this.isClosed(p, tolerance)){
				openpaths.push(p);
			}
			else if(p.tagName == 'path'){
				var lastCommand = p.pathSegList.getItem(p.pathSegList.numberOfItems-1).pathSegTypeAsLetter;
				if(lastCommand != 'z' && lastCommand != 'Z'){
					// endpoints are actually far apart
					p.pathSegList.appendItem(p.createSVGPathSegClosePath());
				}
			}
		}
				
		// record endpoints
		for(i=0; i<openpaths.length; i++){
			var p = openpaths[i];
			
			p.endpoints = this.getEndpoints(p);
		}

		for(i=0; i<openpaths.length; i++){
			var p = openpaths[i];
			var c = this.getCoincident(p, openpaths, tolerance);

			while(c){
				if(c.reverse1){
					this.reverseOpenPath(p);
				}
				if(c.reverse2){
					this.reverseOpenPath(c.path);
				}
				
				/*if(openpaths.length == 2){
					
				console.log('premerge A', p.getAttribute('x1'), p.getAttribute('y1'), p.getAttribute('x2'), p.getAttribute('y2'), p.endpoints);
				console.log('premerge B', c.path.getAttribute('x1'), c.path.getAttribute('y1'), c.path.getAttribute('x2'), c.path.getAttribute('y2'), c.path.endpoints);
				console.log('premerge C', c.reverse1, c.reverse2);
				
				}*/
				var merged = this.mergeOpenPaths(p,c.path);
				
				if(!merged){
					break;
				}
				
				/*if(openpaths.length == 2){
				console.log('merged 1', (new XMLSerializer()).serializeToString(p));
				console.log('merged 2', (new XMLSerializer()).serializeToString(c.path), c.reverse1, c.reverse2, p.endpoints);
				console.log('merged 3', (new XMLSerializer()).serializeToString(merged));
				console.log('merged 4', p.endpoints, c.path.endpoints);
				console.log(root);
				}*/
				
				openpaths.splice(openpaths.indexOf(c.path), 1);
				
				root.appendChild(merged);
				
				openpaths.splice(i,1, merged);
				
				if(this.isClosed(merged, tolerance)){
					var lastCommand = merged.pathSegList.getItem(merged.pathSegList.numberOfItems-1).pathSegTypeAsLetter;
					if(lastCommand != 'z' && lastCommand != 'Z'){
						// endpoints are actually far apart
						console.log(merged);
						merged.pathSegList.appendItem(merged.createSVGPathSegClosePath());
					}
					
					openpaths.splice(i,1);
					i--;
					break;
				}
				
				merged.endpoints = this.getEndpoints(merged);
				
				p = merged;
				c = this.getCoincident(p, openpaths, tolerance);
			}
		}
	}
	
	// merge all line objects that overlap eachother
	SvgParser.prototype.mergeOverlap = function(root, tolerance){
		var min2 = 0.001;
		
		var paths = Array.prototype.slice.call(root.children);
		
		var linelist = paths.filter(function(p){
			return p.tagName == 'line';
		});
		
		var merge = function(lines){
			var count = 0;
			for(var i=0; i<lines.length; i++){
				var A1 = {
					x: parseFloat(lines[i].getAttribute('x1')),
					y: parseFloat(lines[i].getAttribute('y1'))
				};
				
				var A2 = {
					x: parseFloat(lines[i].getAttribute('x2')),
					y: parseFloat(lines[i].getAttribute('y2'))
				};
				
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
				
				for(var j=i+1; j<lines.length; j++){
			
					var B1 = {
						x: parseFloat(lines[j].getAttribute('x1')),
						y: parseFloat(lines[j].getAttribute('y1'))
					};
					
					var B2 = {
						x: parseFloat(lines[j].getAttribute('x2')),
						y: parseFloat(lines[j].getAttribute('y2'))
					};
					
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
					if(min2 > max1 || max2 < min1){
						continue;
					}
					
					var len = 0;
					var relC1x = 0;
					var relC2x = 0;
					
					// A is B
					if(GeometryUtil.almostEqual(min1, min2, tolerance) && GeometryUtil.almostEqual(max1, max2, tolerance)){
						lines.splice(j,1);
						j--;
						count++;
						continue;
					}
					// A inside B
					else if(min1 > min2 && max1 < max2){
						lines.splice(i,1);
						i--;
						count++;
						break;
					}
					// B inside A
					else if(min2 > min1 && max2 < max1){
						lines.splice(j,1);
						i--;
						count++;
						break;
					}
					
					// some overlap but not total
					len = Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
					relC1x = Math.max(max1, max2);
					relC2x = Math.min(min1, min2);		
					
					if(len*len > min2){						
						var relC1 = {x: relC1x * c2, y: relC1x * s2};
						var relC2 = {x: relC2x * c2, y: relC2x * s2};
						
						var C1 = {x: relC1.x + A1.x, y: relC1.y + A1.y};
						var C2 = {x: relC2.x + A1.x, y: relC2.y + A1.y};
						
						lines.splice(j,1);
						lines.splice(i,1);
						
						var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
						line.setAttribute('x1', C1.x);
						line.setAttribute('y1', C1.y);
						line.setAttribute('x2', C2.x);
						line.setAttribute('y2', C2.y);
						
						lines.push(line);
						
						i--;
						count++;
						break;
					}
				
				}
			}
			
			return count;
		}
		
		var c = merge(linelist);
		
		while(c > 0){
			c = merge(linelist);
		}
		
		paths = Array.prototype.slice.call(root.children);
		for(var i=0; i<paths.length; i++){
			if(paths[i].tagName == 'line'){
				root.removeChild(paths[i]);
			}
		}
		for(i=0; i<linelist.length; i++){
			root.appendChild(linelist[i]);
		}
	}
	
	// split paths and polylines into separate line objects
	SvgParser.prototype.splitLines = function(root){
		var paths = Array.prototype.slice.call(root.children);
		
		var lines = [];
		var addLine = function(x1, y1, x2, y2){
			if(x1==x2 && y1==y2){
				return;
			}
			var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', x1);
			line.setAttribute('x2', x2);
			line.setAttribute('y1', y1);
			line.setAttribute('y2', y2);
			root.appendChild(line);
		}
		
		for(var i=0; i<paths.length; i++){
			var path = paths[i];
			if(path.tagName == 'polyline' || path.tagName == 'polygon'){
				if(path.points.length < 2){
					continue;
				}
				
				for(var j=0; j<path.points.length-1; j++){
					var p1 = path.points[j];
					var p2 = path.points[j+1];
					addLine(p1.x, p1.y, p2.x, p2.y);
				}
				
				if(path.tagName == 'polygon'){
					var p1 = path.points[path.points.length-1];
					var p2 = path.points[0];
					addLine(p1.x, p1.y, p2.x, p2.y);
				}
				
				root.removeChild(path);
			}
			else if(path.tagName == 'rect'){
				var x = parseFloat(path.getAttribute('x'));
				var y = parseFloat(path.getAttribute('y'));
				var w = parseFloat(path.getAttribute('width'));
				var h = parseFloat(path.getAttribute('height'));
				addLine(x,y, x+w, y);
				addLine(x+w,y, x+w, y+h);
				addLine(x+w,y+h, x, y+h);
				addLine(x,y+h, x, y);
				
				root.removeChild(path);
			}
			else if(path.tagName == 'path'){
				this.pathToAbsolute(path);
				var split = this.splitPathSegments(path);
				console.log(split);
				split.forEach(function(e){
					root.appendChild(e);
				});
			}
		}
	}
	
	// turn one path into individual segments
	SvgParser.prototype.splitPathSegments = function(path){
		// we'll assume that splitpath has already been run on this path, and it only has one M/m command 
		var seglist = path.pathSegList;
		var split = [];
		
		var addLine = function(x1, y1, x2, y2){
			if(x1==x2 && y1==y2){
				return;
			}
			var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', x1);
			line.setAttribute('x2', x2);
			line.setAttribute('y1', y1);
			line.setAttribute('y2', y2);
			split.push(line);
		}
		
		var x=0, y=0, x0=0, y0=0, x1=0, y1=0, x2=0, y2=0, prevx=0, prevy=0;
		
		for(var i=0; i<seglist.numberOfItems; i++){
			var command = seglist.getItem(i).pathSegTypeAsLetter;
			var s = seglist.getItem(i);
			
			prevx = x;
			prevy = y;
			
			if ('x' in s) x=s.x;
			if ('y' in s) y=s.y;
			
			// replace linear moves with M commands
			switch(command){
				case 'L': addLine(prevx, prevy, x, y); seglist.replaceItem(path.createSVGPathSegMovetoAbs(x,y),i);      break;
				case 'H': addLine(prevx, prevy, x, y); seglist.replaceItem(path.createSVGPathSegMovetoAbs(x,y),i);      break;
				case 'V': addLine(prevx, prevy, x, y); seglist.replaceItem(path.createSVGPathSegMovetoAbs(x,y),i);      break;
				case 'z': case 'Z': addLine(x,y,x0,y0); seglist.removeItem(i); break;
			}
			// Record the start of a subpath
			if (command=='M' || command=='m') x0=x, y0=y;
		}
		
		// this happens in place
		this.splitPath(path);
		
		return split;
	};
	
	// reverse an open path in place, where an open path could by any of line, polyline or path types
	SvgParser.prototype.reverseOpenPath = function(path){
		/*if(path.endpoints){
			var temp = path.endpoints.start;
			path.endpoints.start = path.endpoints.end;
			path.endpoints.end = temp;
		}*/
		if(path.tagName == 'line'){
			var x1 = path.getAttribute('x1');
			var x2 = path.getAttribute('x2');
			var y1 = path.getAttribute('y1');
			var y2 = path.getAttribute('y2');
			
			path.setAttribute('x1', x2);
			path.setAttribute('y1', y2);
			
			path.setAttribute('x2', x1);
			path.setAttribute('y2', y1);
		}
		else if(path.tagName == 'polyline'){
			var points = [];
			for(var i=0; i<path.points.length; i++){
				points.push(path.points[i]);
			}
			
			points = points.reverse();
			path.points.clear();
			for(i=0; i<points.length; i++){
				path.points.appendItem(points[i]);
			}
		}
		else if(path.tagName == 'path'){
			this.pathToAbsolute(path);
			
			var seglist = path.pathSegList;
			var reversed = [];
			
			var firstCommand = seglist.getItem(0);
			var lastCommand = seglist.getItem(seglist.numberOfItems-1);
			
			var x=0, y=0, x0=0, y0=0, x1=0, y1=0, x2=0, y2=0, prevx=0, prevy=0, prevx1=0, prevy1=0, prevx2=0, prevy2=0;
			
			for(var i=0; i<seglist.numberOfItems; i++){
				var s = seglist.getItem(i);
				var command = s.pathSegTypeAsLetter;

				prevx = x;
				prevy = y;
				
				prevx1 = x1;
				prevy1 = y1;
				
				prevx2 = x2;
				prevy2 = y2;
				
				if (/[MLHVCSQTA]/.test(command)){
					if ('x1' in s) x1=s.x1;
					if ('x2' in s) x2=s.x2;
					if ('y1' in s) y1=s.y1;
					if ('y2' in s) y2=s.y2;
					if ('x' in s) x=s.x;
					if ('y' in s) y=s.y;
				}
				
				switch(command){
					// linear line types
					case 'M':
						reversed.push( y, x );
					break;
					case 'L':
					case 'H':
					case 'V':
						reversed.push( 'L', y, x );
					break;
					// Quadratic Beziers
					case 'T':
					// implicit control point
					if(i > 0 && /[QqTt]/.test(seglist.getItem(i-1).pathSegTypeAsLetter)){
						x1 = prevx + (prevx-prevx1);
						y1 = prevy + (prevy-prevy1);
					}
					else{
						x1 = prevx;
						y1 = prevy;
					}
					case 'Q':
						reversed.push( y1, x1, 'Q', y, x );
					break;
					case 'S':
						if(i > 0 && /[CcSs]/.test(seglist.getItem(i-1).pathSegTypeAsLetter)){
							x1 = prevx + (prevx-prevx2);
							y1 = prevy + (prevy-prevy2);
						}
						else{
							x1 = prevx;
							y1 = prevy;
						}
					case 'C':
						reversed.push( y1, x1, y2, x2, 'C', y, x );
					break;
					case 'A':
						// sweep flag needs to be inverted for the correct reverse path
						reversed.push( (s.sweepFlag ? '0' : '1'), (s.largeArcFlag  ? '1' : '0'), s.angle, s.r2, s.r1, 'A', y, x );
					break;
					default:
                		console.log('SVG path error: '+command);
				}
			}
						
			var newpath = reversed.reverse();
			var reversedString = 'M ' + newpath.join( ' ' );
			
			path.setAttribute('d', reversedString);
		}
	}
	
	
	// merge b into a, assuming the end of a coincides with the start of b
	SvgParser.prototype.mergeOpenPaths = function(a, b){
		var topath = function(svg, p){
			if(p.tagName == 'line'){
				var pa = svg.createElementNS('http://www.w3.org/2000/svg', 'path');
				pa.pathSegList.appendItem(pa.createSVGPathSegMovetoAbs(Number(p.getAttribute('x1')),Number(p.getAttribute('y1'))));
				pa.pathSegList.appendItem(pa.createSVGPathSegLinetoAbs(Number(p.getAttribute('x2')),Number(p.getAttribute('y2'))));

				return pa;
			}
			
			if(p.tagName == 'polyline'){
				if(p.points.length < 2){
					return null;
				}
				pa = svg.createElementNS('http://www.w3.org/2000/svg', 'path');
				pa.pathSegList.appendItem(pa.createSVGPathSegMovetoAbs(p.points[0].x,p.points[0].y));
				for(var i=1; i<p.points.length; i++){
					pa.pathSegList.appendItem(pa.createSVGPathSegLinetoAbs(p.points[i].x,p.points[i].y));
				}				
				return pa;
			}
			
			return null;
		}
		
		var patha;
		if(a.tagName == 'path'){
			patha = a;
		}
		else{
			patha = topath(this.svg, a);
		}
		
		var pathb;
		if(b.tagName == 'path'){
			pathb = b;
		}
		else{
			pathb = topath(this.svg, b);
		}
				
		if(!patha || !pathb){
			return null;
		}
		
		// merge b into a
		var seglist = pathb.pathSegList;
		
		// first item is M command
		var m1 = seglist.getItem(0);
		patha.pathSegList.appendItem(patha.createSVGPathSegLinetoAbs(m1.x,m1.y));
		
		//seglist.removeItem(0);
		for(var i=1; i<seglist.numberOfItems; i++){
			patha.pathSegList.appendItem(seglist.getItem(i));
		}
		
		if(a.parentNode){
			a.parentNode.removeChild(a);
		}
		
		if(b.parentNode){
			b.parentNode.removeChild(b);
		}
		
		return patha;
	}
	
	SvgParser.prototype.isClosed = function(p, tolerance){
		var openElements = ['line', 'polyline', 'path'];
		
		if(openElements.indexOf(p.tagName) < 0){
			// things like rect, circle etc are by definition closed shapes
			return true;
		}
		
		if(p.tagName == 'line'){
			return false;
		}
		
		if(p.tagName == 'polyline'){
			if(p.points.length < 3){
				return true;
			}
			var first = {
				x: p.points[0].x,
				y: p.points[0].y
			};
			
			var last = {
				x: p.points[p.points.length-1].x,
				y: p.points[p.points.length-1].y
			};
			
			if(GeometryUtil.almostEqual(first.x,last.x, tolerance || this.conf.toleranceSvg) && GeometryUtil.almostEqual(first.y,last.y, tolerance || this.conf.toleranceSvg)){
				return true;
			}
			else{
				return false;
			}
			// path can be closed if it touches itself at some point
			/*for(var j=p.points.length-1; j>0; j--){
				var current = p.points[j];
				if(GeometryUtil.almostEqual(first.x,current.x, tolerance || this.conf.toleranceSvg) && GeometryUtil.almostEqual(first.y,current.y, tolerance || this.conf.toleranceSvg)){
					return true;
				}
			}
			
			return false;*/
		}
		
		if(p.tagName == 'path'){
			for(var j=0; j<p.pathSegList.numberOfItems; j++){
				var c = p.pathSegList.getItem(j);
				if(c.pathSegTypeAsLetter == 'z' || c.pathSegTypeAsLetter == 'Z'){
					return true;
				}
			}
			// could still be "closed" if start and end coincide
			var test = this.polygonifyPath(p);
			if(!test){
				return false;
			}
			if(test.length < 2){
				return true;
			}
			var first = test[0];
			var last = test[test.length-1];
			
			if(GeometryUtil.almostEqualPoints(first, last, tolerance || this.conf.toleranceSvg)){
				return true;
			}
		}
	}
	
	SvgParser.prototype.getEndpoints = function(p){
		var start, end;
		if(p.tagName == 'line'){
			start = {
				x: Number(p.getAttribute('x1')),
				y: Number(p.getAttribute('y1'))
			};
			
			end = {
				x: Number(p.getAttribute('x2')),
				y: Number(p.getAttribute('y2'))
			};
		}
		else if(p.tagName == 'polyline'){
			if(p.points.length == 0){
				return null;
			}
			start = {
				x: p.points[0].x,
				y: p.points[0].y
			};
			
			end = {
				x: p.points[p.points.length-1].x,
				y: p.points[p.points.length-1].y
			};
		}
		else if(p.tagName == 'path'){
			var poly = this.polygonifyPath(p);
			if(!poly){
				return null;
			}
			start = poly[0];
			end = poly[poly.length-1];
		}
		else{
			return null;
		}
		
		return {start: start, end: end};
	}
	
	// set the given path as absolute coords (capital commands)
	// from http://stackoverflow.com/a/9677915/433888
	SvgParser.prototype.pathToAbsolute = function(path){
		if(!path || path.tagName != 'path'){
			throw Error('invalid path');
		}
		
		var seglist = path.pathSegList;
		var x=0, y=0, x0=0, y0=0, x1=0, y1=0, x2=0, y2=0;
		
		for(var i=0; i<seglist.numberOfItems; i++){
			var command = seglist.getItem(i).pathSegTypeAsLetter;
			var s = seglist.getItem(i);

			if (/[MLHVCSQTA]/.test(command)){
			  if ('x' in s) x=s.x;
			  if ('y' in s) y=s.y;
			}
			else{
				if ('x1' in s) x1=x+s.x1;
				if ('x2' in s) x2=x+s.x2;
				if ('y1' in s) y1=y+s.y1;
				if ('y2' in s) y2=y+s.y2;
				if ('x'  in s) x+=s.x;
				if ('y'  in s) y+=s.y;
				switch(command){
					case 'm': seglist.replaceItem(path.createSVGPathSegMovetoAbs(x,y),i);                   break;
					case 'l': seglist.replaceItem(path.createSVGPathSegLinetoAbs(x,y),i);                   break;
					case 'h': seglist.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x),i);           break;
					case 'v': seglist.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y),i);             break;
					case 'c': seglist.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x,y,x1,y1,x2,y2),i); break;
					case 's': seglist.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x,y,x2,y2),i); break;
					case 'q': seglist.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x,y,x1,y1),i);   break;
					case 't': seglist.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x,y),i);   break;
					case 'a': seglist.replaceItem(path.createSVGPathSegArcAbs(x,y,s.r1,s.r2,s.angle,s.largeArcFlag,s.sweepFlag),i);   break;
					case 'z': case 'Z': x=x0; y=y0; break;
				}
			}
			// Record the start of a subpath
			if (command=='M' || command=='m') x0=x, y0=y;
		}
	};
	
	// takes an SVG transform string and returns corresponding SVGMatrix
	// from https://github.com/fontello/svgpath
	SvgParser.prototype.transformParse = function(transformString){
		var operations = {
			matrix: true,
			scale: true,
			rotate: true,
			translate: true,
			skewX: true,
			skewY: true
		};

		var CMD_SPLIT_RE    = /\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(\s*(.+?)\s*\)[\s,]*/;
		var PARAMS_SPLIT_RE = /[\s,]+/;

		var matrix = new Matrix();
		var cmd, params;
		
		// Split value into ['', 'translate', '10 50', '', 'scale', '2', '', 'rotate',  '-45', '']
		transformString.split(CMD_SPLIT_RE).forEach(function (item) {

			// Skip empty elements
			if (!item.length) { return; }

			// remember operation
			if (typeof operations[item] !== 'undefined') {
			cmd = item;
			return;
			}

			// extract params & att operation to matrix
			params = item.split(PARAMS_SPLIT_RE).map(function (i) {
			return +i || 0;
			});

			// If params count is not correct - ignore command
			switch (cmd) {
				case 'matrix':
					if (params.length === 6) {
						matrix.matrix(params);
					}
					return;

				case 'scale':
					if (params.length === 1) {
						matrix.scale(params[0], params[0]);
					} else if (params.length === 2) {
						matrix.scale(params[0], params[1]);
					}
				return;

				case 'rotate':
					if (params.length === 1) {
						matrix.rotate(params[0], 0, 0);
					} else if (params.length === 3) {
						matrix.rotate(params[0], params[1], params[2]);
					}
				return;

				case 'translate':
					if (params.length === 1) {
						matrix.translate(params[0], 0);
					} else if (params.length === 2) {
						matrix.translate(params[0], params[1]);
					}
				return;

				case 'skewX':
					if (params.length === 1) {
						matrix.skewX(params[0]);
					}
				return;

				case 'skewY':
					if (params.length === 1) {
						matrix.skewY(params[0]);
					}
				return;
			}
		});

		return matrix;
	}
	
	// recursively apply the transform property to the given element
	SvgParser.prototype.applyTransform = function(element, globalTransform, skipClosed, dxfFlag){

		globalTransform = globalTransform || '';
		var transformString = element.getAttribute('transform') || '';
		transformString = globalTransform + ' ' + transformString;
		
		var transform, scale, rotate;
		
		if(transformString && transformString.length > 0){
			var transform = this.transformParse(transformString);
		}
		
		if(!transform){
			transform = new Matrix();
		}
		
		//console.log(element.tagName, transformString, transform.toArray());
		
		var tarray = transform.toArray();
		
		// decompose affine matrix to rotate, scale components (translate is just the 3rd column)
		var rotate = Math.atan2(tarray[1], tarray[3])*180/Math.PI;
		var scale = Math.sqrt(tarray[0]*tarray[0]+tarray[2]*tarray[2]);
		
		if(element.tagName == 'g' || element.tagName == 'svg' || element.tagName == 'defs'){
			element.removeAttribute('transform');
			var children = Array.prototype.slice.call(element.children);
			for(var i=0; i<children.length; i++){
				this.applyTransform(children[i], transformString, skipClosed, dxfFlag);
			}
		}
		else if(transform && !transform.isIdentity()){
			switch(element.tagName){
				case 'ellipse':
					if(skipClosed){
						element.setAttribute('transform', transformString);
						return;
					}
					// the goal is to remove the transform property, but an ellipse without a transform will have no rotation
					// for the sake of simplicity, we will replace the ellipse with a path, and apply the transform to that path
					var path = this.svg.createElementNS('http://www.w3.org/2000/svg', 'path');
					var move = path.createSVGPathSegMovetoAbs(parseFloat(element.getAttribute('cx'))-parseFloat(element.getAttribute('rx')),element.getAttribute('cy'));
					var arc1 = path.createSVGPathSegArcAbs(parseFloat(element.getAttribute('cx'))+parseFloat(element.getAttribute('rx')),element.getAttribute('cy'),element.getAttribute('rx'),element.getAttribute('ry'),0,1,0);
					var arc2 = path.createSVGPathSegArcAbs(parseFloat(element.getAttribute('cx'))-parseFloat(element.getAttribute('rx')),element.getAttribute('cy'),element.getAttribute('rx'),element.getAttribute('ry'),0,1,0);
					
					path.pathSegList.appendItem(move);
					path.pathSegList.appendItem(arc1);
					path.pathSegList.appendItem(arc2);
					path.pathSegList.appendItem(path.createSVGPathSegClosePath());
					
					var transformProperty = element.getAttribute('transform');
					if(transformProperty){
						path.setAttribute('transform', transformProperty);
					}
					
					element.parentElement.replaceChild(path, element);

					element = path;

				case 'path':
					if(skipClosed && this.isClosed(element)){
						element.setAttribute('transform', transformString);
						return;
					}
					this.pathToAbsolute(element);
					var seglist = element.pathSegList;
					var prevx = 0;
					var prevy = 0;
					
					for(var i=0; i<seglist.numberOfItems; i++){
						var s = seglist.getItem(i);
						var command = s.pathSegTypeAsLetter;
						
						if(command == 'H'){
							seglist.replaceItem(element.createSVGPathSegLinetoAbs(s.x,prevy),i);
							s = seglist.getItem(i);
						}
						else if(command == 'V'){
							seglist.replaceItem(element.createSVGPathSegLinetoAbs(prevx,s.y),i);
							s = seglist.getItem(i);
						}
						// todo: fix hack from dxf conversion
						else if(command == 'A'){
						    if(dxfFlag){
						        // fix dxf import error
							    var arcrotate = (rotate == 180) ? 0 : rotate;
							    var arcsweep =  (rotate == 180) ? !s.sweepFlag : s.sweepFlag;
							}
							else{
							    var arcrotate = s.angle + rotate;
							    var arcsweep = s.sweepFlag;
							}				
									
							seglist.replaceItem(element.createSVGPathSegArcAbs(s.x,s.y,s.r1*scale,s.r2*scale,arcrotate,s.largeArcFlag,arcsweep),i);
							s = seglist.getItem(i);
						}
						
						if('x' in s && 'y' in s){
							var transformed = transform.calc(s.x, s.y);
							prevx = s.x;
							prevy = s.y;
							
							s.x = transformed[0];
							s.y = transformed[1];
						}
						if('x1' in s && 'y1' in s){
							var transformed = transform.calc(s.x1, s.y1);
							s.x1 = transformed[0];
							s.y1 = transformed[1];
						}
						if('x2' in s && 'y2' in s){
							var transformed = transform.calc(s.x2, s.y2);
							s.x2 = transformed[0];
							s.y2 = transformed[1];
						}
					}
					
					element.removeAttribute('transform');
				break;
				case 'image':
					element.setAttribute('transform', transformString);
				break;
				case 'line':
					var x1 = Number(element.getAttribute('x1'));
					var x2 = Number(element.getAttribute('x2'));
					var y1 = Number(element.getAttribute('y1'));
					var y2 = Number(element.getAttribute('y2'));
					var transformed1 = transform.calc(x1, y1);
					var transformed2 = transform.calc(x2, y2);
					
					element.setAttribute('x1', transformed1[0]);
					element.setAttribute('y1', transformed1[1]);
					
					element.setAttribute('x2', transformed2[0]);
					element.setAttribute('y2', transformed2[1]);
					
					element.removeAttribute('transform');
				break;
				case 'circle':
					if(skipClosed){
						element.setAttribute('transform', transformString);
						return;
					}
					var transformed = transform.calc(element.getAttribute('cx'), element.getAttribute('cy'));
					element.setAttribute('cx', transformed[0]);
					element.setAttribute('cy', transformed[1]);
					
					// skew not supported
					element.setAttribute('r', element.getAttribute('r')*scale);
				break;

				case 'rect':
					if(skipClosed){
						element.setAttribute('transform', transformString);
						return;
					}
					// similar to the ellipse, we'll replace rect with polygon
					var polygon = this.svg.createElementNS('http://www.w3.org/2000/svg', 'polygon');
					
															
					var p1 = this.svgRoot.createSVGPoint();
					var p2 = this.svgRoot.createSVGPoint();
					var p3 = this.svgRoot.createSVGPoint();
					var p4 = this.svgRoot.createSVGPoint();
					
					p1.x = parseFloat(element.getAttribute('x')) || 0;
					p1.y = parseFloat(element.getAttribute('y')) || 0;
					
					p2.x = p1.x + parseFloat(element.getAttribute('width'));
					p2.y = p1.y;
					
					p3.x = p2.x;
					p3.y = p1.y + parseFloat(element.getAttribute('height'));
					
					p4.x = p1.x;
					p4.y = p3.y;
					
					polygon.points.appendItem(p1);
					polygon.points.appendItem(p2);
					polygon.points.appendItem(p3);
					polygon.points.appendItem(p4);
					
					var transformProperty = element.getAttribute('transform');
					if(transformProperty){
						polygon.setAttribute('transform', transformProperty);
					}
					
					element.parentElement.replaceChild(polygon, element);
					element = polygon;
					
				case 'polygon':
				case 'polyline':
					if(skipClosed && this.isClosed(element)){
						element.setAttribute('transform', transformString);
						return;
					}
					for(var i=0; i<element.points.length; i++){
						var point = element.points[i];
						var transformed = transform.calc(point.x, point.y);
						point.x = transformed[0];
						point.y = transformed[1];
					}
					
					element.removeAttribute('transform');
				break;
			}
		}
	}
	
	// bring all child elements to the top level
	SvgParser.prototype.flatten = function(element){
		for(var i=0; i<element.children.length; i++){
			this.flatten(element.children[i]);
		}
		
		if(element.tagName != 'svg' && element.parentElement){
			while(element.children.length > 0){
				element.parentElement.appendChild(element.children[0]);
			}
		}
	}
	
	// remove all elements with tag name not in the whitelist
	// use this to remove <text>, <g> etc that don't represent shapes
	SvgParser.prototype.filter = function(whitelist, element){
		if(!whitelist || whitelist.length == 0){
			throw Error('invalid whitelist');
		}
		
		element = element || this.svgRoot;
		
		for(var i=0; i<element.children.length; i++){
			this.filter(whitelist, element.children[i]);
		}
		
		if(element.children.length == 0 && whitelist.indexOf(element.tagName) < 0){
			element.parentElement.removeChild(element);
		}
	}
	
	// split a compound path (paths with M, m commands) into an array of paths
	SvgParser.prototype.splitPath = function(path){
		if(!path || path.tagName != 'path' || !path.parentElement){
			return false;
		}
				
		var seglist = path.pathSegList;
		
		var x=0, y=0, x0=0, y0=0;
		var paths = [];
		
		var p;
		
		var lastM = 0;
		for(var i=seglist.numberOfItems-1; i>=0; i--){
			if(i > 0 && seglist.getItem(i).pathSegTypeAsLetter == 'M' || seglist.getItem(i).pathSegTypeAsLetter == 'm'){
				lastM = i;
				break;
			}
		}
		
		if(lastM == 0){
			return false; // only 1 M command, no need to split
		}
		
		for(i=0; i<seglist.numberOfItems; i++){
			var s = seglist.getItem(i);
			var command = s.pathSegTypeAsLetter;
			if(command == 'M' || command == 'm'){
				p = path.cloneNode();
				p.setAttribute('d','');
				paths.push(p);
			}
			
			if (/[MLHVCSQTA]/.test(command)){
			  if ('x' in s) x=s.x;
			  if ('y' in s) y=s.y;
			  
			  p.pathSegList.appendItem(s);
			}
			else{
				if ('x'  in s) x+=s.x;
				if ('y'  in s) y+=s.y;
				if(command == 'm'){
					p.pathSegList.appendItem(path.createSVGPathSegMovetoAbs(x,y));
				}
				else{
					if(command == 'Z' || command == 'z'){
						x = x0;
						y = y0;
					}
					p.pathSegList.appendItem(s);
				}
			}
			// Record the start of a subpath
			if (command=='M' || command=='m'){
				x0=x, y0=y;
			}
		}
		
		var addedPaths = [];
		for(i=0; i<paths.length; i++){
			// don't add trivial paths from sequential M commands
			if(paths[i].pathSegList.numberOfItems > 1){
				path.parentElement.insertBefore(paths[i], path);
				addedPaths.push(paths[i]);
			}
		}
		
		path.remove();
		
		return addedPaths;
	}
	
	// recursively run the given function on the given element
	SvgParser.prototype.recurse = function(element, func){
		// only operate on original DOM tree, ignore any children that are added. Avoid infinite loops
		var children = Array.prototype.slice.call(element.children);
		for(var i=0; i<children.length; i++){
			this.recurse(children[i], func);
		}
		
		func(element);
	}
	
	// return a polygon from the given SVG element in the form of an array of points
	SvgParser.prototype.polygonify = function(element){
		var poly = [];
		var i;

		switch(element.tagName){
			case 'polygon':
			case 'polyline':
				for(i=0; i<element.points.length; i++){
					poly.push({
						x: element.points[i].x,
						y: element.points[i].y
					});
				}
			break;
			case 'rect':
				var p1 = {};
				var p2 = {};
				var p3 = {};
				var p4 = {};
				
				p1.x = parseFloat(element.getAttribute('x')) || 0;
				p1.y = parseFloat(element.getAttribute('y')) || 0;
				
				p2.x = p1.x + parseFloat(element.getAttribute('width'));
				p2.y = p1.y;
				
				p3.x = p2.x;
				p3.y = p1.y + parseFloat(element.getAttribute('height'));
				
				p4.x = p1.x;
				p4.y = p3.y;
				
				poly.push(p1);
				poly.push(p2);
				poly.push(p3);
				poly.push(p4);
			break;
			case 'circle':				
				var radius = parseFloat(element.getAttribute('r'));
				var cx = parseFloat(element.getAttribute('cx'));
				var cy = parseFloat(element.getAttribute('cy'));
				
				// num is the smallest number of segments required to approximate the circle to the given tolerance
				var num = Math.ceil((2*Math.PI)/Math.acos(1 - (this.conf.tolerance/radius)));
				
				if(num < 3){
					num = 3;
				}
				
				for(var i=0; i<num; i++){
					var theta = i * ( (2*Math.PI) / num);
					var point = {};
					point.x = radius*Math.cos(theta) + cx;
					point.y = radius*Math.sin(theta) + cy;
					
					poly.push(point);
				}
			break;
			case 'ellipse':				
				// same as circle case. There is probably a way to reduce points but for convenience we will just flatten the equivalent circular polygon
				var rx = parseFloat(element.getAttribute('rx'))
				var ry = parseFloat(element.getAttribute('ry'));
				var maxradius = Math.max(rx, ry);
				
				var cx = parseFloat(element.getAttribute('cx'));
				var cy = parseFloat(element.getAttribute('cy'));
				
				var num = Math.ceil((2*Math.PI)/Math.acos(1 - (this.conf.tolerance/maxradius)));
				
				if(num < 3){
					num = 3;
				}
				
				for(var i=0; i<num; i++){
					var theta = i * ( (2*Math.PI) / num);
					var point = {};
					point.x = rx*Math.cos(theta) + cx;
					point.y = ry*Math.sin(theta) + cy;
					
					poly.push(point);
				}
			break;
			case 'path':
				poly = this.polygonifyPath(element);
			break;
		}
		
		// do not include last point if coincident with starting point
		while(poly.length > 0 && GeometryUtil.almostEqual(poly[0].x,poly[poly.length-1].x, this.conf.toleranceSvg) && GeometryUtil.almostEqual(poly[0].y,poly[poly.length-1].y, this.conf.toleranceSvg)){
			poly.pop();
		}

		return poly;
	};
	
	SvgParser.prototype.polygonifyPath = function(path){
		// we'll assume that splitpath has already been run on this path, and it only has one M/m command 
		var seglist = path.pathSegList;
		var poly = [];
		var firstCommand = seglist.getItem(0);
		var lastCommand = seglist.getItem(seglist.numberOfItems-1);

		var x=0, y=0, x0=0, y0=0, x1=0, y1=0, x2=0, y2=0, prevx=0, prevy=0, prevx1=0, prevy1=0, prevx2=0, prevy2=0;
		
		for(var i=0; i<seglist.numberOfItems; i++){
			var s = seglist.getItem(i);
			var command = s.pathSegTypeAsLetter;
			
			prevx = x;
			prevy = y;
			
			prevx1 = x1;
			prevy1 = y1;
			
			prevx2 = x2;
			prevy2 = y2;
			
			if (/[MLHVCSQTA]/.test(command)){
				if ('x1' in s) x1=s.x1;
				if ('x2' in s) x2=s.x2;
				if ('y1' in s) y1=s.y1;
				if ('y2' in s) y2=s.y2;
				if ('x' in s) x=s.x;
				if ('y' in s) y=s.y;
			}
			else{
				if ('x1' in s) x1=x+s.x1;
				if ('x2' in s) x2=x+s.x2;
				if ('y1' in s) y1=y+s.y1;
				if ('y2' in s) y2=y+s.y2;							
				if ('x'  in s) x+=s.x;
				if ('y'  in s) y+=s.y;
			}
			switch(command){
				// linear line types
				case 'm':
				case 'M':
				case 'l':
				case 'L':
				case 'h':
				case 'H':
				case 'v':
				case 'V':
					var point = {};
					point.x = x;
					point.y = y;
					poly.push(point);
				break;
				// Quadratic Beziers
				case 't':
				case 'T':
				// implicit control point
				if(i > 0 && /[QqTt]/.test(seglist.getItem(i-1).pathSegTypeAsLetter)){
					x1 = prevx + (prevx-prevx1);
					y1 = prevy + (prevy-prevy1);
				}
				else{
					x1 = prevx;
					y1 = prevy;
				}
				case 'q':
				case 'Q':
					var pointlist = GeometryUtil.QuadraticBezier.linearize({x: prevx, y: prevy}, {x: x, y: y}, {x: x1, y: y1}, this.conf.tolerance);
					pointlist.shift(); // firstpoint would already be in the poly
					for(var j=0; j<pointlist.length; j++){
						var point = {};
						point.x = pointlist[j].x;
						point.y = pointlist[j].y;
						poly.push(point);
					}
				break;
				case 's':
				case 'S':
					if(i > 0 && /[CcSs]/.test(seglist.getItem(i-1).pathSegTypeAsLetter)){
						x1 = prevx + (prevx-prevx2);
						y1 = prevy + (prevy-prevy2);
					}
					else{
						x1 = prevx;
						y1 = prevy;
					}
				case 'c':
				case 'C':
					var pointlist = GeometryUtil.CubicBezier.linearize({x: prevx, y: prevy}, {x: x, y: y}, {x: x1, y: y1}, {x: x2, y: y2}, this.conf.tolerance);
					pointlist.shift(); // firstpoint would already be in the poly
					for(var j=0; j<pointlist.length; j++){
						var point = {};
						point.x = pointlist[j].x;
						point.y = pointlist[j].y;
						poly.push(point);
					}
				break;
				case 'a':
				case 'A':
					var pointlist = GeometryUtil.Arc.linearize({x: prevx, y: prevy}, {x: x, y: y}, s.r1, s.r2, s.angle, s.largeArcFlag,s.sweepFlag, this.conf.tolerance);
					pointlist.shift();
					
					for(var j=0; j<pointlist.length; j++){
						var point = {};
						point.x = pointlist[j].x;
						point.y = pointlist[j].y;
						poly.push(point);
					}
				break;
				case 'z': case 'Z': x=x0; y=y0; break;
			}
			// Record the start of a subpath
			if (command=='M' || command=='m') x0=x, y0=y;
		}
		
		return poly;
	};
	
	// expose public methods
	var parser = new SvgParser();
	
	root.SvgParser = {
		config: parser.config.bind(parser),
		load: parser.load.bind(parser),
		clean: parser.cleanInput.bind(parser),
		polygonify: parser.polygonify.bind(parser),
		polygonifyPath: parser.polygonifyPath.bind(parser),
		isClosed: parser.isClosed.bind(parser),
		applyTransform: parser.applyTransform.bind(parser),
		transformParse: parser.transformParse.bind(parser),
		flatten: parser.flatten.bind(parser),
		splitLines: parser.splitLines.bind(parser),
		mergeLines: parser.mergeLines.bind(parser),
		mergeOverlap: parser.mergeOverlap.bind(parser),
		polygonElements: parser.polygonElements
	};
	
}(this));