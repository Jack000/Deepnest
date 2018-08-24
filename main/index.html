<!doctype html>
<html itemscope="" itemtype="http://schema.org/WebPage" lang="en">
	<head>
		<title>Deepnest - Industrial nesting</title>

		<link type="text/css" rel="stylesheet" media="all" href="font/latolatinfonts.css" />
		<link rel="stylesheet" type="text/css" href="style.css" />
		
		<script src="util/pathsegpolyfill.js"></script>
		<script src="util/matrix.js"></script>
		<script src="util/clipper.js"></script>
		<script src="util/parallel.js"></script>
		<script src="util/geometryutil.js"></script>
		<script src="util/placementworker.js"></script>
		<script src="util/interact.js"></script>
		<script src="util/ractive.js"></script>
		<script src="util/svgpanzoom.js"></script>
		<script src="util/d3-polygon.js"></script>
		<script src="util/simplify.js"></script>
		
		<script src="svgparser.js"></script>
		<script src="deepnest.js"></script>

		<script>
		// UI-specific stuff in this script
		function ready(fn){
			if (document.readyState != 'loading'){
				fn();
			}
			else {
				document.addEventListener('DOMContentLoaded', fn);
			}
		}
		
		const { ipcRenderer } = require('electron');
		const fs = require('graceful-fs');
		const request = require('request');
		const http = require('http');
		const path = require('path');
		
		ready(function(){
			// main navigation			
			var tabs = document.querySelectorAll('#sidenav li');
			
			Array.from(tabs).forEach(tab => {
				tab.addEventListener('click', function(e) {
					if(this.className == 'active' || this.className == 'disabled'){
						return false;
					}
					
					var activetab = document.querySelector('#sidenav li.active');
					activetab.className = '';
					
					var activepage = document.querySelector('.page.active');
					activepage.className = 'page';
					
					this.className = 'active';
					tabpage = document.querySelector('#' + this.dataset.page);
					tabpage.className = 'page active';
					
					if(tabpage.getAttribute('id') == 'home'){
						resize();
					}
					return false;
				});
			});
			
			// config form
			const config = require('electron-settings');
			window.config = config;
			
			var defaultconfig = {
			  units: 'inch',
			  scale: 72, // actual stored value will be in units/inch
			  spacing: 0,
			  curveTolerance: 0.72, // store distances in native units
			  rotations: 4,
			  threads: 4,
			  populationSize: 10,
			  mutationRate: 10,
			  placementType: 'box', // how to place each part (possible values gravity, box, convexhull)
			  mergeLines: true, // whether to merge lines
			  timeRatio: 0.5, // ratio of material reduction to laser time. 0 = optimize material only, 1 = optimize laser time only
			  simplify: false,
			  dxfImportScale: "1",
			  dxfExportScale: "72",
			  endpointTolerance: 0.36,
			  conversionServer: 'http://convert.deepnest.io'
			};
			
			config.defaults(defaultconfig);
			
			const defaultConversionServer = 'http://convert.deepnest.io';
			
			// set to default if not set (for people with old configs stored)
			for (var key in defaultconfig) {
			  if(typeof config.getSync(key) === 'undefined'){
			  	config.setSync(key, defaultconfig[key]);
			  }
			}
			
			config.get().then(val => {
				window.DeepNest.config(val);
				updateForm(val);
			});
			
			var inputs = document.querySelectorAll('#config input, #config select');
			
			Array.from(inputs).forEach(i => {
				i.addEventListener('change', function(e) {
					
					var val = i.value;
					var key = i.getAttribute('data-config');
					
					if(key == 'scale'){					
						if(config.getSync('units') == 'mm'){
							val *= 25.4; // store scale config in inches
						}
					}
					
					if(key == 'mergeLines' || key == 'simplify'){
						val = i.checked;
					}
					
					if(i.getAttribute('data-conversion') == 'true'){
						// convert real units to svg units
						var conversion = config.getSync('scale');
						if(config.getSync('units') == 'mm'){
							conversion /= 25.4;
						}
						val *= conversion;
					}
					
					// add a spinner during saving to indicate activity
					i.parentNode.className = 'progress';
					
					config.set(key, val).then(() => {
					    config.get().then(val => {
							window.DeepNest.config(val);
							updateForm(val);
							
							i.parentNode.className = '';
							
							if(key == 'units'){
								ractive.update('getUnits');
								ractive.update('dimensionLabel');
							}
						});
					});			
				});
			});
			
			var setdefault = document.querySelector('#setdefault');
			setdefault.onclick = function(e){
				// don't reset user profile
				var tempaccess = config.getSync('access_token');
				var tempid = config.getSync('id_token');
				config.resetToDefaultsSync();
				config.setSync('access_token', tempaccess);
				config.setSync('id_token', tempid);
				config.get().then(val => {
					window.DeepNest.config(val);
					updateForm(val);
				});
				return false;
			}
			
			function updateForm(c){
				var unitinput 
				if(c.units == 'inch'){
					unitinput = document.querySelector('#configform input[value=inch]');
				}
				else{
					unitinput = document.querySelector('#configform input[value=mm]');
				}
				
				unitinput.checked = true;
				
				var labels = document.querySelectorAll('span.unit-label');
				Array.from(labels).forEach(l => {
					l.innerText = c.units;
				});
				
				var scale = document.querySelector('#inputscale');
				if(c.units == 'inch'){
					scale.value = c.scale;
				}
				else{
					// mm
					scale.value = c.scale/25.4;
				}
				
				/*var scaledinputs = document.querySelectorAll('[data-conversion]');
				Array.from(scaledinputs).forEach(si => {
					si.value = c[si.getAttribute('data-config')]/scale.value;
				});*/
				
				var inputs = document.querySelectorAll('#config input, #config select');
				Array.from(inputs).forEach(i => {
					var key = i.getAttribute('data-config');
					if(key == 'units' || key == 'scale'){
						return;
					}
					else if(i.getAttribute('data-conversion') == 'true'){
						i.value = c[i.getAttribute('data-config')]/scale.value;
					}
					else if(key == 'mergeLines' || key == 'simplify'){
						i.checked = c[i.getAttribute('data-config')];
					}
					else{
						i.value = c[i.getAttribute('data-config')];
					}
				});
			}
			
			document.querySelectorAll('#config input, #config select').forEach(function(e){
				e.onmouseover = function(event){
					var inputid = e.getAttribute('data-config');
					if(inputid){
						document.querySelectorAll('.config_explain').forEach(function(el){
							el.className = 'config_explain';
						});
						
						var selected = document.querySelector('#explain_'+inputid);
						if(selected){
							selected.className = 'config_explain active';
						}
					}
				}
				
				e.onmouseleave = function(event){
					document.querySelectorAll('.config_explain').forEach(function(el){
						el.className = 'config_explain';
					});
				}
			});
			
			// add spinner element to each form dd
			var dd = document.querySelectorAll('#configform dd');
			Array.from(dd).forEach(d => {
				var spinner = document.createElement("div");
				spinner.className = 'spinner';
				d.appendChild(spinner);
			});
			
			// version info
			var pjson = require('../package.json');
			var version = document.querySelector('#package-version');
			version.innerText = pjson.version;
			
			// part view
			Ractive.DEBUG = false
			
			var label = Ractive.extend({
			  template: '{{label}}',
			  computed: {
				  label: function(){
					var width = this.get('bounds').width;
					var height = this.get('bounds').height;
					var units = config.getSync('units');
					var conversion = config.getSync('scale');
					
					// trigger computed dependency chain
					this.get('getUnits');
					
					if(units == 'mm'){
						return (25.4*(width/conversion)).toFixed(1) + 'mm x ' + (25.4*(height/conversion)).toFixed(1)+'mm';
					}
					else{
						return (width/conversion).toFixed(1) + 'in x ' + (height/conversion).toFixed(1) + 'in';
					}
				  }
			  }
			});
			
			var ractive = new Ractive({
				el: '#homecontent',
				//magic: true,
				template: '#template-part-list',
				data: {
					parts: DeepNest.parts,
					imports: DeepNest.imports,
					getSelected: function(){
						var parts = this.get('parts');
						return parts.filter(function(p){
							return p.selected;
						});
					},
					getSheets: function(){
						var parts = this.get('parts');
						return parts.filter(function(p){
							return p.sheet;
						});
					},
					serializeSvg: function(svg){
						return (new XMLSerializer()).serializeToString(svg);
					},
					partrenderer: function(part){
						var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
						svg.setAttribute('width', (part.bounds.width+10)+'px');
						svg.setAttribute('height', (part.bounds.height+10)+'px');
						svg.setAttribute('viewBox', (part.bounds.x-5)+' '+(part.bounds.y-5)+' '+(part.bounds.width+10)+' '+(part.bounds.height+10));
												
						part.svgelements.forEach(function(e){
							svg.appendChild(e.cloneNode(false));
						});
						return (new XMLSerializer()).serializeToString(svg);
					}
				},
				computed: {
					getUnits: function(){
						var units = config.getSync('units');
						if(units == 'mm'){
							return 'mm';
						}
						else{
							return 'in';
						}
					}
				},
				components: { dimensionLabel: label }
			});
			
			var mousedown = 0;
			document.body.onmousedown = function() { 
			  mousedown = 1;
			}
			document.body.onmouseup = function() {
			  mousedown = 0;
			}
			
			var update = function(){
				ractive.update('imports');
				applyzoom();
			}
			
			var throttledupdate = throttle(update, 500);
			
			var togglepart = function(part){
				if(part.selected){
					part.selected = false;
					for(var i=0; i<part.svgelements.length; i++){
						part.svgelements[i].removeAttribute('class');
					}
				}
				else{
					part.selected = true;
					for(var i=0; i<part.svgelements.length; i++){
						part.svgelements[i].setAttribute('class','active');
					}
				}
			}
			
			ractive.on('selecthandler', function(e, part) {				
				if(e.original.target.nodeName == 'INPUT'){
					return true;
				}
				if(mousedown > 0 || e.original.type=='mousedown'){
					togglepart(part);
					
					ractive.update('parts');
					throttledupdate();
				}
			});
			
			ractive.on('selectall', function(e){
				var selected = DeepNest.parts.filter(function(p){
					return p.selected;
				}).length;
				
				var toggleon = (selected < DeepNest.parts.length);
				
				DeepNest.parts.forEach(function(p){
					if(p.selected != toggleon){
						togglepart(p);
					}
					p.selected = toggleon;
				});
				
				ractive.update('parts');
				ractive.update('imports');
				
				if(DeepNest.imports.length > 0){
					applyzoom();
				}
			});
			
			// applies svg zoom library to the currently visible import
			applyzoom = function(){
				if(DeepNest.imports.length > 0){
					for(var i=0; i<DeepNest.imports.length; i++){
						if(DeepNest.imports[i].selected){
							if(DeepNest.imports[i].zoom){
								var pan = DeepNest.imports[i].zoom.getPan();
								var zoom = DeepNest.imports[i].zoom.getZoom();
							}
							else{
								var pan = false;
								var zoom = false;
							}
							DeepNest.imports[i].zoom = svgPanZoom('#import-'+i+' svg', {
								  zoomEnabled: true,
								  controlIconsEnabled: false,
								  fit: true,
								  center: true,
								  maxZoom: 50,
								  minZoom: 0.1
							});
							
							if(zoom){
								DeepNest.imports[i].zoom.zoom(zoom);
							}
							if(pan){
								DeepNest.imports[i].zoom.pan(pan);
							}
							
							document.querySelector('#import-'+i+' .zoomin').addEventListener('click', function(ev){
							  ev.preventDefault();
							  DeepNest.imports.find(function(e){
							  	return e.selected;
							  }).zoom.zoomIn();
							});
							document.querySelector('#import-'+i+' .zoomout').addEventListener('click', function(ev){
							  ev.preventDefault();
							  DeepNest.imports.find(function(e){
							  	return e.selected;
							  }).zoom.zoomOut();
							});
							document.querySelector('#import-'+i+' .zoomreset').addEventListener('click', function(ev){
							  ev.preventDefault();
							  DeepNest.imports.find(function(e){
							  	return e.selected;
							  }).zoom.resetZoom().resetPan();
							});
						}
					}
				}
			};
						
			ractive.on('importselecthandler', function (e, im) {
				if(im.selected){
					return false;
				}
				
				DeepNest.imports.forEach(function(i){
					i.selected = false;
				});				
				
				im.selected = true;
				ractive.update('imports');
				applyzoom();
			});
			
			ractive.on('importdelete', function(e,im){
				var index = DeepNest.imports.indexOf(im);
				DeepNest.imports.splice(index,1);
				
				if(DeepNest.imports.length > 0){
					if(!DeepNest.imports[index]){
						index = 0;
					}
					
					DeepNest.imports[index].selected = true;
				}
				
				
				ractive.update('imports');
				
				if(DeepNest.imports.length > 0){
					applyzoom();
				}
			});
			
			var deleteparts = function(e){
				for(var i=0; i<DeepNest.parts.length; i++){
					if(DeepNest.parts[i].selected){
						for(var j=0; j<DeepNest.parts[i].svgelements.length; j++){
							var node = DeepNest.parts[i].svgelements[j];
							if (node.parentNode) {
							  node.parentNode.removeChild(node);
							}
						}
						DeepNest.parts.splice(i,1);
						i--;
					}
				}
				
				ractive.update('parts');
				ractive.update('imports');
				
				if(DeepNest.imports.length > 0){
					applyzoom();
				}
				
				resize();
			}
			
			ractive.on('delete', deleteparts);
			document.body.addEventListener('keydown', function(e){
				if(e.keyCode == 8 || e.keyCode == 46){
					deleteparts();
				}
			});
			
			// sort table
			var attachSort = function(){
				var headers = document.querySelectorAll('#parts table thead th');
				Array.from(headers).forEach(header => {
					header.addEventListener('click', function(e) {
						var sortfield = header.getAttribute('data-sort-field');
						
						if(!sortfield){
							return false;
						}
						
						var reverse = false;
						if(this.className == 'asc'){
							reverse = true;
						}
						
						DeepNest.parts.sort(function(a, b){
							  var av = a[sortfield];
							  var bv = b[sortfield];
							  if (av < bv) {
								return reverse ? 1 : -1;
							  }
							  if (av > bv) {
								return reverse ? -1 : 1;
							  }
							  return 0;
						});
						
						Array.from(headers).forEach(h => {
							h.className = '';
						});
						
						if(reverse){
							this.className = 'desc';
						}
						else{
							this.className = 'asc';
						}
						
						ractive.update('parts');
					});
				});
			}
			
			// file import
			var electron = require('electron');
			var app = electron.remote; 
			var fs = require('fs');
			
			var importbutton = document.querySelector('#import');
			importbutton.onclick = function(){
				if(importbutton.className == 'button import disabled' || importbutton.className == 'button import spinner'){
					return false;
				}
				
				importbutton.className = 'button import disabled';
				
				setTimeout(function(){
					var dialog = app.dialog;
					dialog.showOpenDialog({ filters: [
				
					   { name: 'CAD formats', extensions: ['svg', 'dxf', 'cdr'] }
				
					  ]}, function (fileName) {
						if(fileName === undefined){
							importbutton.className = 'button import';
							console.log("No file selected");
						}
						else{
							var ext = path.extname(fileName[0]);
							var filename = path.basename(fileName[0]);

							if(ext.toLowerCase() == '.svg'){
								readFile(fileName[0]);
								importbutton.className = 'button import';
							}
							else{
								importbutton.className = 'button import spinner';
								
								// send to conversion server
								var url = config.getSync('conversionServer');
								if(!url){
									url = defaultConversionServer;
								}
								
								var req = request.post(url, function (err, resp, body) {
									importbutton.className = 'button import';
									if (err) {
										message('could not contact file conversion server', true);
									} else {
										if(body.substring(0, 5) == 'error'){
											message(body, true);
										}
										else{
											// expected input dimensions on server is points
											// scale based on unit preferences
											var con = null;
                                            var dxfFlag = false;
											if(ext.toLowerCase() == '.dxf'){
												//var unit = config.getSync('units');
												con = Number(config.getSync('dxfImportScale'));
												dxfFlag = true;
												console.log('con', con);
												
												/*if(unit == 'inch'){
													con = 72;
												}
												else{
													// mm
													con = 2.83465;
												}*/
											}
											
											// dirpath is used for loading images embedded in svg files
											// converted svgs will not have images
											importData(body, filename, null, con, dxfFlag);
										}
									}
								});

								var form = req.form();
								form.append('format', 'svg');
								form.append('fileUpload', fs.createReadStream(fileName[0]));
							}
						}
						
					});
				}, 50);
				
			};
			
			function readFile(filepath){
				fs.readFile(filepath, 'utf-8', function (err, data) {
					  if(err){
						  message("An error ocurred reading the file :" + err.message, true);
						  return;
					  }
					  var filename = path.basename(filepath);
					  var dirpath = path.dirname(filepath);
					  
					  importData(data, filename, dirpath, null);
				});
			};
			
			function importData(data, filename, dirpath, scalingFactor, dxfFlag){
				window.DeepNest.importsvg(filename, dirpath, data, scalingFactor, dxfFlag);

				DeepNest.imports.forEach(function(im){
				im.selected = false;
				});

				DeepNest.imports[DeepNest.imports.length-1].selected = true;

				ractive.update('imports');
				ractive.update('parts');

				attachSort();
				applyzoom();
				resize();
			}
			
			// part list resize
			var resize = function (event) {
				var parts = document.querySelector('#parts');
				var table = document.querySelector('#parts table');
				
				if(event){
					parts.style.width = event.rect.width + 'px';
				}
				
				var home = document.querySelector('#home');
				
				var imports = document.querySelector('#imports');
				imports.style.width = home.offsetWidth - (parts.offsetWidth-2) + 'px';
				imports.style.left = (parts.offsetWidth-2) + 'px';
				
				var headers = document.querySelectorAll('#parts table th');
				Array.from(headers).forEach(th => {
					var span = th.querySelector('span');
					if(span){
						span.style.width = th.offsetWidth + 'px';
					}
				});
			}
			
			interact('.parts-drag')
			.resizable({
				preserveAspectRatio: false,
				edges: { left: false, right: true, bottom: false, top: false }
			})
			.on('resizemove', resize);
			
			window.addEventListener('resize', function(){
				resize();
			});
			
			resize();
			
			// close message
			var messageclose = document.querySelector('#message a.close');
			messageclose.onclick = function(){
				document.querySelector('#messagewrapper').className = '';
				return false;
			};
			
			// add rectangle
			document.querySelector('#addrectangle').onclick = function(){
				var tools = document.querySelector('#partstools');
				var dialog = document.querySelector('#rectangledialog');
				
				tools.className = 'active';
			};
			
			document.querySelector('#cancelrectangle').onclick = function(){
				document.querySelector('#partstools').className = '';
			};
			
			document.querySelector('#confirmrectangle').onclick = function(){
				var width = document.querySelector('#rectanglewidth');
				var height = document.querySelector('#rectangleheight');
				
				if(Number(width.value) <= 0){
					width.className = 'error';
					return false;
				}
				width.className = '';
				if(Number(height.value) <= 0){
					height.className = 'error';
					return false;
				}
				
				var units = config.getSync('units');
				var conversion = config.getSync('scale');
				
				// remember, scale is stored in units/inch
				if(units == 'mm'){
					conversion /= 25.4;
				}
				
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				rect.setAttribute('x',0);
				rect.setAttribute('y',0);
				rect.setAttribute('width',width.value*conversion);
				rect.setAttribute('height',height.value*conversion);
				svg.appendChild(rect);
				DeepNest.importsvg(null, null, (new XMLSerializer()).serializeToString(svg));
				
				width.className = '';
				height.className = '';
				width.value = '';
				height.value = '';
				
				document.querySelector('#partstools').className = '';
				
				ractive.update('parts');
				resize();
			};
			
			//var remote = require('remote');
			//var windowManager = app.require('electron-window-manager');
			
			/*const BrowserWindow = app.BrowserWindow;
			
			const path = require('path');
			const url = require('url');*/
			
			
				
				/*window.nestwindow = windowManager.createNew('nestwindow', 'Windows #2');
				nestwindow.loadURL('./main/nest.html');
				nestwindow.setAlwaysOnTop(true);
				nestwindow.open();*/
				
				//const remote = require('electron').remote;
				
				/*window.nestwindow = new BrowserWindow({width: window.outerWidth*0.8, height: window.outerHeight*0.8, frame: true});
				
				nestwindow.loadURL(url.format({
					pathname: path.join(__dirname, './nest.html'),
					protocol: 'file:',
					slashes: true
				  }));
				nestwindow.setAlwaysOnTop(true);
				nestwindow.webContents.openDevTools();
				nestwindow.parts = {wat: 'wat'};
				
				console.log(electron.ipcRenderer.sendSync('synchronous-message', 'ping'));*/
			
			// clear cache
			var deleteCache = function() {
			  var path = './nfpcache';
			  if( fs.existsSync(path) ) {
				fs.readdirSync(path).forEach(function(file,index){
				  var curPath = path + "/" + file;
				  if(fs.lstatSync(curPath).isDirectory()) { // recurse
					deleteFolderRecursive(curPath);
				  } else { // delete file
					fs.unlinkSync(curPath);
				  }
				});
				//fs.rmdirSync(path);
			  }
			};
			
			var startnest = function(){
				/*function toClipperCoordinates(polygon){
					var clone = [];
					for(var i=0; i<polygon.length; i++){
						clone.push({
							X: polygon[i].x*10000000,
							Y: polygon[i].y*10000000
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
				
				
				var Ac = toClipperCoordinates(DeepNest.parts[0].polygontree);
				var Bc = toClipperCoordinates(DeepNest.parts[1].polygontree);
				for(var i=0; i<Bc.length; i++){
					Bc[i].X *= -1;
					Bc[i].Y *= -1;
				}
				var solution = ClipperLib.Clipper.MinkowskiSum(Ac, Bc, true);
				//console.log(solution.length, solution);
				
				var clipperNfp = toNestCoordinates(solution[0], 10000000);
				for(i=0; i<clipperNfp.length; i++){
					clipperNfp[i].x += DeepNest.parts[1].polygontree[0].x;
					clipperNfp[i].y += DeepNest.parts[1].polygontree[0].y;
				}
				//console.log(solution);
				cpoly = clipperNfp;
				
				//cpoly =  .calculateNFP({A: DeepNest.parts[0].polygontree, B: DeepNest.parts[1].polygontree}).pop();
				gpoly =  GeometryUtil.noFitPolygon(DeepNest.parts[0].polygontree, DeepNest.parts[1].polygontree, false, false).pop();
				
				var svg = DeepNest.imports[0].svg;
				var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				var polyline2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				
				for(var i=0; i<cpoly.length; i++){
					var p = svg.createSVGPoint();
					p.x = cpoly[i].x;
					p.y = cpoly[i].y;
					polyline.points.appendItem(p);
				}
				for(i=0; i<gpoly.length; i++){
					var p = svg.createSVGPoint();
					p.x = gpoly[i].x;
					p.y = gpoly[i].y;
					polyline2.points.appendItem(p);
				}
				polyline.setAttribute('class', 'active');
				svg.appendChild(polyline);
				svg.appendChild(polyline2);
				
				ractive.update('imports');
				applyzoom();
				
				return false;*/
				
				
				for(var i=0; i<DeepNest.parts.length; i++){
					if(DeepNest.parts[i].sheet){
						// need at least one sheet
						document.querySelector('#main').className = '';
						document.querySelector('#nest').className = 'active';
						
						var displayCallback = function(){
							// render latest nest if none are selected
							var selected = this.DeepNest.nests.filter(function(n){
								return n.selected;
							});
							
							// only change focus if latest nest is selected
							if(selected.length == 0 || (this.DeepNest.nests.length > 1 && this.DeepNest.nests[1].selected)){
								this.DeepNest.nests.forEach(function(n){
									n.selected = false;
								});
								displayNest(this.DeepNest.nests[0]);
								this.DeepNest.nests[0].selected = true;
							}
							
							this.nest.update('nests');
							
							// enable export button
							document.querySelector('#export_wrapper').className = 'active';
							document.querySelector('#export').className = 'button export';
						}
						
						deleteCache();
						
						DeepNest.start(null, displayCallback.bind(window));
						return;
					}
				}
				
				if(DeepNest.parts.length == 0){
					message("Please import some parts first");
				}
				else{
					message("Please mark at least one part as the sheet");
				}
			}
			
			document.querySelector('#startnest').onclick = startnest;
			
			var stop = document.querySelector('#stopnest');
			stop.onclick = function(e){
				if(stop.className == 'button stop'){
					ipcRenderer.send('background-stop');
					DeepNest.stop();
					document.querySelectorAll('li.progress').forEach(function(p){
						p.removeAttribute('id');
						p.className = 'progress';
					});
					stop.className = 'button stop disabled';
					setTimeout(function(){
						stop.className = 'button start';
						stop.innerHTML = 'Start nest';
					}, 3000);
				}
				else if(stop.className == 'button start'){
					stop.className = 'button stop disabled';
					setTimeout(function(){
						stop.className = 'button stop';
						stop.innerHTML = 'Stop nest';
					}, 1000);
					startnest();
				}
			}
			
			var back = document.querySelector('#back');
			back.onclick = function(e){
						
				setTimeout(function(){
					if(DeepNest.working){
						ipcRenderer.send('background-stop');
						DeepNest.stop();
						document.querySelectorAll('li.progress').forEach(function(p){
							p.removeAttribute('id');
							p.className = 'progress';
						});
					}
					DeepNest.reset();
					deleteCache();
					
					window.nest.update('nests');
					document.querySelector('#nestdisplay').innerHTML = '';
					stop.className = 'button stop';
					stop.innerHTML = 'Stop nest';
					
					// disable export button
					document.querySelector('#export_wrapper').className = '';
					document.querySelector('#export').className = 'button export disabled';
					
				}, 2000);
				
				document.querySelector('#main').className = 'active';
				document.querySelector('#nest').className = '';
			}
			
			var exportbutton = document.querySelector('#export');
			
			var exportsvg = document.querySelector('#exportsvg');
			exportsvg.onclick = function(){
				
				var dialog = app.dialog;
				dialog.showSaveDialog({title: 'Export Deepnest SVG'}, function (fileName) {
					if(fileName === undefined){
						console.log("No file selected");
					}
					else{
						var selected = DeepNest.nests.filter(function(n){
							return n.selected;
						});
						
						if(selected.length == 0){
							return false;
						}
						
						fs.writeFileSync(fileName, exportNest(selected.pop()));
					}
				});
			};
			
			var exportdxf = document.querySelector('#exportdxf');
			exportdxf.onclick = function(){
				var dialog = app.dialog;
				dialog.showSaveDialog({title: 'Export Deepnest DXF'}, function (fileName) {
					if(fileName === undefined){
						console.log("No file selected");
					}
					else{
						var selected = DeepNest.nests.filter(function(n){
							return n.selected;
						});
						
						if(selected.length == 0){
							return false;
						}
						// send to conversion server
						var url = config.getSync('conversionServer');
						if(!url){
							url = defaultConversionServer;
						}
						
						exportbutton.className = 'button export spinner';
						
						var req = request.post(url, function (err, resp, body) {
							exportbutton.className = 'button export';
							if (err) {
								message('could not contact file conversion server', true);
							} else {
								if(body.substring(0, 5) == 'error'){
									message(body, true);
								}
								else{
									fs.writeFileSync(fileName, body);
								}
							}
						});

						var form = req.form();
						form.append('format', 'dxf');
						form.append('fileUpload', exportNest(selected.pop(), true), {
						  filename: 'deepnest.svg',
						  contentType: 'image/svg+xml'
						});
					}
				});
			};
			/*
			var exportgcode = document.querySelector('#exportgcode');
			exportgcode.onclick = function(){
				var dialog = app.dialog;
				dialog.showSaveDialog({title: 'Export Deepnest Gcode'}, function (fileName) {
					if(fileName === undefined){
						console.log("No file selected");
					}
					else{
						var selected = DeepNest.nests.filter(function(n){
							return n.selected;
						});
						
						if(selected.length == 0){
							return false;
						}
						// send to conversion server
						var url = config.getSync('conversionServer');
						if(!url){
							url = defaultConversionServer;
						}
						
						exportbutton.className = 'button export spinner';
						
						var req = request.post(url, function (err, resp, body) {
							exportbutton.className = 'button export';
							if (err) {
								message('could not contact file conversion server', true);
							} else {
								if(body.substring(0, 5) == 'error'){
									message(body, true);
								}
								else{
									fs.writeFileSync(fileName, body);
								}
							}
						});

						var form = req.form();
						form.append('format', 'gcode');
						form.append('fileUpload', exportNest(selected.pop(), true), {
						  filename: 'deepnest.svg',
						  contentType: 'image/svg+xml'
						});
					}
				});
			};*/
			
			// nest save
			var exportNest = function(n, dxf){
			
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				
				var svgwidth = 0;
				var svgheight = 0;
				
				// create elements if they don't exist, show them otherwise
				n.placements.forEach(function(s){
					var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
					svg.appendChild(group);					
					/*DeepNest.parts[s.sheet].svgelements.forEach(function(e){
						var node = e.cloneNode(false);
						node.setAttribute('stroke', '#000');
						node.setAttribute('fill', 'none');
						group.appendChild(node);
					});*/
					
					var sheetbounds = DeepNest.parts[s.sheet].bounds;
					
					group.setAttribute('transform', 'translate('+(-sheetbounds.x)+' '+(svgheight-sheetbounds.y)+')');
					if(svgwidth < sheetbounds.width){
						svgwidth = sheetbounds.width;
					}
					
					s.sheetplacements.forEach(function(p){
						var part = DeepNest.parts[p.source];
						var partgroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
												
						part.svgelements.forEach(function(e, index){
							var node = e.cloneNode(false);
							
							if(n.tagName == 'image'){
								var relpath = n.getAttribute('data-href');
								if(relpath){
									n.setAttribute('href',relpath);
								}
								n.removeAttribute('data-href');
							}
							partgroup.appendChild(node);
						});
						
						group.appendChild(partgroup);
						
						// position part
						partgroup.setAttribute('transform','translate('+p.x+' '+p.y+') rotate('+p.rotation+')');
					});
					
					// put next sheet below
					svgheight += 1.1*sheetbounds.height;
				});
				
				var scale = config.getSync('scale');
				
				if(dxf){
					scale /= Number(config.getSync('dxfExportScale')); // inkscape on server side
				}
				
				var units = config.getSync('units');
				if(units == 'mm'){
					scale /= 25.4;
				}
				
				svg.setAttribute('width', (svgwidth/scale) + (units == 'inch' ? 'in' : 'mm'));
				svg.setAttribute('height', (svgheight/scale) + (units == 'inch' ? 'in' : 'mm'));
				svg.setAttribute('viewBox', '0 0 '+svgwidth+' '+svgheight);
				
				if(config.getSync('mergeLines') && n.mergedLength > 0){
					SvgParser.applyTransform(svg);
					SvgParser.flatten(svg);
					SvgParser.splitLines(svg);
					SvgParser.mergeOverlap(svg, 0.1*config.getSync('curveTolerance'));
					SvgParser.mergeLines(svg);
					
					// set stroke and fill for all
                    var elements = Array.prototype.slice.call(svg.children);
                    elements.forEach(function(e){
                        if(e.tagName != 'g' && e.tagName != 'image'){
                            e.setAttribute('fill', 'none');
                            e.setAttribute('stroke', '#000000');
                        }
                    });
				}
				
				return (new XMLSerializer()).serializeToString(svg);
			}
			
			// nesting display
			
			var displayNest = function(n){
				// create svg if not exist
				var svg = document.querySelector('#nestsvg');
				
				if(!svg){
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
					svg.setAttribute('id', 'nestsvg');
					document.querySelector('#nestdisplay').innerHTML = (new XMLSerializer()).serializeToString(svg);
					svg = document.querySelector('#nestsvg');
				}
				
				// remove active class from parts and sheets
				document.querySelectorAll('#nestsvg .part').forEach(function(p){
					p.setAttribute('class', 'part');
				});
				
				document.querySelectorAll('#nestsvg .sheet').forEach(function(p){
					p.setAttribute('class', 'sheet');
				});
				
				// remove laser markers
				document.querySelectorAll('#nestsvg .merged').forEach(function(p){
					p.remove();
				});
				
				var svgwidth = 0;
				var svgheight = 0;
				
				// create elements if they don't exist, show them otherwise
				n.placements.forEach(function(s){
					var groupelement = document.querySelector('#sheet'+s.sheetid);
					if(!groupelement){
						var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
						group.setAttribute('id', 'sheet'+s.sheetid);
						group.setAttribute('data-index', s.sheetid);
						
						svg.appendChild(group);
						groupelement = document.querySelector('#sheet'+s.sheetid);
						
						DeepNest.parts[s.sheet].svgelements.forEach(function(e){
							var node = e.cloneNode(false);
							node.setAttribute('stroke', '#ffffff');
							node.setAttribute('fill', 'none');
							node.removeAttribute('style');
							groupelement.appendChild(node);
						});
					}
					
					// reset class (make visible)
					groupelement.setAttribute('class', 'sheet active');
					
					var sheetbounds = DeepNest.parts[s.sheet].bounds;
					groupelement.setAttribute('transform', 'translate('+(-sheetbounds.x)+' '+(svgheight-sheetbounds.y)+')');
					if(svgwidth < sheetbounds.width){
						svgwidth = sheetbounds.width;
					}
					
					s.sheetplacements.forEach(function(p){
						var partelement = document.querySelector('#part'+p.id);
						if(!partelement){
							var part = DeepNest.parts[p.source];
							var partgroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
							partgroup.setAttribute('id', 'part'+p.id);
							
							part.svgelements.forEach(function(e, index){
								var node = e.cloneNode(false);
								if(index == 0){
									node.setAttribute('fill', 'url(#part'+p.source+'hatch)');
									node.setAttribute('fill-opacity', '0.5');
								}
								else{
									node.setAttribute('fill', '#404247');
								}
								node.removeAttribute('style');
								node.setAttribute('stroke', '#ffffff');
								partgroup.appendChild(node);
							});
							
							svg.appendChild(partgroup);
							
							if(!document.querySelector('#part'+p.source+'hatch')){
								// make a nice hatch pattern
								var pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
								pattern.setAttribute('id', 'part'+p.source+'hatch');
								pattern.setAttribute('patternUnits', 'userSpaceOnUse');
								
								var psize = parseInt(DeepNest.parts[s.sheet].bounds.width/120);
								
								psize = psize || 10;
								
								pattern.setAttribute('width', psize);
								pattern.setAttribute('height', psize);
								var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
								path.setAttribute('d', 'M-1,1 l2,-2 M0,'+psize+' l'+psize+',-'+psize+' M'+(psize-1)+','+(psize+1)+' l2,-2');
								path.setAttribute('style', 'stroke: hsl('+(360*(p.source/DeepNest.parts.length))+', 100%, 80%) !important; stroke-width:1');
								pattern.appendChild(path);
								
								groupelement.appendChild(pattern);
							}
							
							partelement = document.querySelector('#part'+p.id);
						}
						else{
							// ensure correct z layering
							svg.appendChild(partelement);
						}
						
						// reset class (make visible)
						partelement.setAttribute('class', 'part active');
						
						// position part
						partelement.setAttribute('style','transform: translate('+(p.x-sheetbounds.x)+'px, '+(p.y+svgheight-sheetbounds.y)+'px) rotate('+p.rotation+'deg)');
						
						// add merge lines
						if(p.mergedSegments && p.mergedSegments.length > 0){
							for(var i=0; i<p.mergedSegments.length; i++){
								var s1 = p.mergedSegments[i][0];
								var s2 = p.mergedSegments[i][1];
								var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
								line.setAttribute('class','merged');
								line.setAttribute('x1', s1.x-sheetbounds.x);
								line.setAttribute('x2', s2.x-sheetbounds.x);
								line.setAttribute('y1', s1.y+svgheight-sheetbounds.y);
								line.setAttribute('y2', s2.y+svgheight-sheetbounds.y);
								svg.appendChild(line);
							}
						}
					});
					
					// put next sheet below
					svgheight += 1.1*sheetbounds.height;
				});
				
				setTimeout(function(){
				document.querySelectorAll('#nestsvg .merged').forEach(function(p){
					p.setAttribute('class','merged active');
				});
				}, 1500);
				
				svg.setAttribute('width', '100%');
				svg.setAttribute('height', '100%');
				svg.setAttribute('viewBox', '0 0 '+svgwidth+' '+svgheight);
			}
			
			window.nest = new Ractive({
				el: '#nestcontent',
				//magic: true,
				template: '#nest-template',
				data: {
					nests: DeepNest.nests,
					getSelected: function(){
						var ne = this.get('nests');
						return ne.filter(function(n){
							return n.selected;
						});
					},
					getNestedPartSources: function(n){
						var p = [];
						for(var i=0; i < n.placements.length; i++){
							var sheet = n.placements[i];
							for(var j=0; j < sheet.sheetplacements.length; j++){
								p.push(sheet.sheetplacements[j].source);
							}
						}
						return p;
					},
					getColorBySource: function(id){
						return 'hsl('+(360*(id/DeepNest.parts.length))+', 100%, 80%)';
					},
					getPartsPlaced: function(){
						var ne = this.get('nests');
						var selected = ne.filter(function(n){
							return n.selected;
						});
						
						if(selected.length == 0){
							return '';
						}
						
						selected = selected.pop();
						
						var num = 0;
						for(var i=0; i<selected.placements.length; i++){
							num += selected.placements[i].sheetplacements.length;
						}
						
						var total = 0;
						for(i=0; i<DeepNest.parts.length; i++){
							if(!DeepNest.parts[i].sheet){
								total += DeepNest.parts[i].quantity;
							}
						}
						
						return num + '/' + total;
					},
					getTimeSaved: function(){
						var ne = this.get('nests');
						var selected = ne.filter(function(n){
							return n.selected;
						});
						
						if(selected.length == 0){
							return '0 seconds';
						}
						
						selected = selected.pop();
						
						var totalLength = selected.mergedLength;
									
						var scale = config.getSync('scale');						
						var lengthinches = totalLength/scale;
												
						var seconds = lengthinches/2; // assume 2 inches per second cut speed
						return millisecondsToStr(seconds*1000);
					}
				}
			});
			
			nest.on('selectnest', function(e, n) {
				for(var i=0; i<DeepNest.nests.length; i++){
					DeepNest.nests[i].selected = false;
				}
				n.selected = true;
				window.nest.update('nests');
				displayNest(n);
			});
			
			// prevent drag/drop default behavior
			document.ondragover = document.ondrop = (ev) => {
			  ev.preventDefault();
			}

			document.body.ondrop = (ev) => {
			  ev.preventDefault();
			}
						
			var windowManager = app.require('electron-window-manager');
			
			const BrowserWindow = app.BrowserWindow;
			const url = require('url');
			
			window.loginWindow = null;
		});
		
		ipcRenderer.on('background-progress', (event, p) => {
			/*var bar = document.querySelector('#progress'+p.index);
			if(p.progress < 0 && bar){
				// negative progress = finish
				bar.className = 'progress';
				bar.removeAttribute('id');
				return;
			}
			
			if(!bar){
				bar = document.querySelector('li.progress:not(.active)');
				bar.setAttribute('id', 'progress'+p.index);
				bar.className = 'progress active';
			}
			
			bar.querySelector('.bar').setAttribute('style', 'stroke-dashoffset: ' + parseInt((1-p.progress)*111));*/
			var bar = document.querySelector('#progressbar');
			bar.setAttribute('style', 'width: '+parseInt(p.progress*100)+'%'+(p.progress < 0.01 ? '; transition: none' : ''));
		});
		
		function message(txt, error){
			var message = document.querySelector('#message');
			if(error){
				message.className = 'error';
			}
			else{
				message.className = '';
			}
			document.querySelector('#messagewrapper').className = 'active';
			setTimeout(function(){
				message.className += ' animated bounce';
			}, 100);
			var content = document.querySelector('#messagecontent');
			content.innerHTML = txt;
		}
		
		_now = Date.now || function() { return new Date().getTime(); };

		throttle = function(func, wait, options) {
			var context, args, result;
			var timeout = null;
			var previous = 0;
			options || (options = {});
			var later = function() {
			  previous = options.leading === false ? 0 : _now();
			  timeout = null;
			  result = func.apply(context, args);
			  context = args = null;
			};
			return function() {
			  var now = _now();
			  if (!previous && options.leading === false) previous = now;
			  var remaining = wait - (now - previous);
			  context = this;
			  args = arguments;
			  if (remaining <= 0) {
				clearTimeout(timeout);
				timeout = null;
				previous = now;
				result = func.apply(context, args);
				context = args = null;
			  } else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			  }
			  return result;
			};
		  };
		  
		  function millisecondsToStr (milliseconds) {
				function numberEnding (number) {
					return (number > 1) ? 's' : '';
				}

				var temp = Math.floor(milliseconds / 1000);
				var years = Math.floor(temp / 31536000);
				if (years) {
					return years + ' year' + numberEnding(years);
				}
				var days = Math.floor((temp %= 31536000) / 86400);
				if (days) {
					return days + ' day' + numberEnding(days);
				}
				var hours = Math.floor((temp %= 86400) / 3600);
				if (hours) {
					return hours + ' hour' + numberEnding(hours);
				}
				var minutes = Math.floor((temp %= 3600) / 60);
				if (minutes) {
					return minutes + ' minute' + numberEnding(minutes);
				}
				var seconds = temp % 60;
				if (seconds) {
					return seconds + ' second' + numberEnding(seconds);
				}
				
				return '0 seconds';
			}
		  
		  //var addon = require('../build/Release/addon');
		</script>
	</head>
	<body>
	<div id="nest">
		<ul class="topnav">
			<li class="button stop" id="stopnest">Stop nest</li>
			<span id="export_wrapper">
			<li class="button export disabled" id="export">Export</li>
			<ul class="dropdown">
				<li id="exportsvg">SVG file</li>
				<li id="exportdxf">DXF file</li>
				<!--<li id="exportgcode">GCode file</li>-->
			</ul>
			</span>
			<li class="button back" id="back">Back</li>
			
			<!-- progress bars -->
			<li class="progress">
				<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
					 width="48px" height="48px" viewBox="0 0 48 48" enable-background="new 0 0 48 48" xml:space="preserve">
				<circle fill="none" stroke="#242526" stroke-width="6" stroke-miterlimit="10" cx="24" cy="24" r="17.666"/>
				<circle class="bar" fill="none" stroke="#24C7ED" stroke-width="6" stroke-miterlimit="10" cx="24" cy="24" r="17.666"/>
				</svg>
			</li>

		</ul>
		
		<div id="progressbar_wrapper">
			<div id="progressbar"></div>
		</div>
		
		<div id="nestcontent"></div>
		<div id="nestdisplay"></div>
		
		<script id="nest-template" type="text/ractive">
			<div id="nestinfo" class='{{ nests.length > 0 ? "active" : "" }}'>
				<div class="group"><h1>{{ getSelected().length > 0 ? getSelected()[0].placements.length : '-' }}</h1><span class="label">{{ getSelected().length > 0 ? (getSelected()[0].placements.length > 1 ? 'sheets used' : 'sheet used') : '' }}</span></div>
				<div class="group"><h1>{{ getPartsPlaced() }}</h1><span class="label">parts placed</span></div>
				<div class="group"><h1>{{ getTimeSaved() }}</h1><span class="label">laser time saved</span></div>
				<div class="group"><h1>best nests so far</h1></div>
				<div id="nestlist">
					{{#each nests:i}}
					<span class="nest {{ selected ? "active" : "" }}" on-click="selectnest:{{this}}">
						<span class="nest_inner">
						{{#each getNestedPartSources(this)}}
						<i style="background-color: {{ getColorBySource(this) }}"></i>
						{{/each}}
						</span>
					</span>
					{{/each}}
				</div>	
			</div>
		</script>
	</div>
	
	<div id="messagewrapper">
		<div id="message">
		<a href="#" class="button close"></a>
		<div id="messagecontent"></div>
		</div>
	</div>
	
	<div id="main" class="active">
		<ul id="sidenav">
		<li id="home_tab" class="active" data-page="home"></li>
		<li id="config_tab" data-page="config"></li>
		<!--<li id="account_tab" data-page="account"></li>-->
		<li id="info_tab" data-page="info"></li>
		</ul>
		
		<div id="home" class="page active">
			
			<div id="homecontent"></div>
			
			<script id="template-part-list" type="text/ractive">
				<ul class="topnav">
					<li class="button import" id="import">Import</li>
					<li class="button start {{ getSheets().length == 0 ? "disabled" : "" }}" id="startnest">Start nest</li>
				</ul>
				
				<div id="parts" class="parts-drag">
					
					<div id="partscroll">
						<table>
							<thead>
								<tr>
									<th><span></span></th>
									<th data-sort-field="area"><span>Size</span></th>
									<th data-sort-field="sheet"><span>Sheet</span></th>
									<th data-sort-field="quantity"><span>Quantity</span></th>
								</tr>
							</thead>
							<tbody>
								{{#each parts:i}}
									<tr on-mouseenter-mousedown="selecthandler:{{this}}" class='{{ selected ? "active" : "" }}'>
										<td>{{{ partrenderer(this) }}} <span style="display: none">{{bounds.width}}</span></td>
										<td><dimensionLabel/></td>
										<td><input type="checkbox" checked='{{sheet}}' /></td>
										<td><input type="number" min="1" step="1" value="{{quantity}}" /></td>
									</tr>
								{{/each}}
							</tbody>
						</table>
					</div>
					
					<div id="partstools">
						<a href="#" class="button addrectangle" id="addrectangle">&nbsp;</a>
						<a href="#" class='button delete {{ getSelected().length == 0 ? "disabled" : "" }}' on-click="delete">&nbsp;</a>
						<a href="#" class="button {{ parts.length == 0 ? "disabled" : "" }}" id="selectall" on-click="selectall">{{ getSelected().length == parts.length ? 'Deselect' : 'Select' }} all</a>
						
						<div id="rectangledialog">
						<h2>Add Rectangle</h2>
						<span class="row"><span class="label">width</span> <input type="number" min="0" id="rectanglewidth" required /> {{ getUnits }}</span>
						<span class="row"><span class="label">height</span> <input type="number" min="0" id="rectangleheight" required /> {{ getUnits }}</span>
						
						<a href="#" class="button add" id="confirmrectangle">Add</a>
						<a href="#" class="button" id="cancelrectangle">Cancel</a>
						</div>
					</div>
				</div>
				
				<div id="imports">
					{{#if imports.length > 0}}
					<ul id="importsnav">
						{{#each imports}}
							<li class='{{ selected ? "active" : "" }}' on-click="importselecthandler:{{this}}">
								{{ filename }}
								<a href="#" class="close" on-click="importdelete:{{this}}"></a>
							</li>
						{{/each}}	
					</ul>
					{{/if}}
					
					{{#each imports:i}}
						<div id="import-{{i}}" class='import {{ selected ? "active" : "" }}'>
							{{{ serializeSvg(svg) }}}
							
							<div class="zoomtools">
							<a href="#" class="zoomreset"></a>
							<a href="#" class="zoomin"></a>
							<a href="#" class="zoomout"></a>
							</div>
						</div>
					{{/each}}	
				</div>
			</script>
		</div>
		
		<div id="config" class="page">
			<form id="configform">
				<h1>Nesting configuration</h1>
				
				<dl class="formgroup">
					<dt>Display units</dt>
					<dd>
						<input type="radio" name="units" value="inch" checked data-config="units" /> <span class="radiolabel">inches</span>
						<input type="radio" name="units" value="mm" data-config="units" /> <span class="radiolabel">mm</span>
					</dd>
					
					<dt>Space between parts</dt>
					<dd>
						<input type="number" value="0" min="0" step="any" data-config="spacing" data-conversion="true" required /> <i><span class="unit-label">inch</span></i>
					</dd>
					
					<dt>Curve tolerance</dt>
					<dd>
						<input type="number" value="0.3" min="0" step="any" data-config="curveTolerance" data-conversion="true" required /> <i><span class="unit-label">inch</span></i>
					</dd>
					
					<dt>Part rotations</dt>
					<dd>
						<input type="number" value="4" step="1" min="1" max="32" data-config="rotations" required />
					</dd>
					
					<dt>Optimization type</dt>
					<dd>
						<select name="placementType" data-config="placementType">
							<option value="gravity" default>Gravity</option>
							<option value="box">Bounding Box</option>
							<option value="convexhull">Squeeze</option>
						</select>
					</dd>
					
					<dt>Use rough approximation</dt>
					<dd>
						<input type="checkbox" data-config="simplify" />
					</dd>
					
					<dt>CPU cores</dt>
					<dd>
						<input type="number" value="4" step="1" min="1" max="8" data-config="threads" required />
					</dd>
				</dl>
				
				<h1>Import/Export</h1>
				<dl class="formgroup">
					<dt>SVG scale</dt>
					<dd>
						<input id="inputscale" type="number" value="72" min="1" step="any" data-config="scale" required /> <i>units/<span class="unit-label">inch</span></i>
					</dd>
					
					<dt>Endpoint tolerance</dt>
					<dd>
						<input type="number" value="0.3" min="0" step="any" data-config="endpointTolerance" data-conversion="true" required /> <i><span class="unit-label">inch</span></i>
					</dd>
					
					<dt>DXF import units</dt>
					<dd>
						<select name="dxfImportScale" data-config="dxfImportScale">
							<option value="1" default>Points</option>
							<option value="12">Picas</option>
							<option value="72">Inches</option>
							<option value="2.83465">mm</option>
							<option value="28.3465">cm</option>
						</select>
					</dd>
					
					<dt>DXF export units</dt>
					<dd>
						<select name="dxfExportScale" data-config="dxfExportScale">
							<option value="72" default>Points</option>
							<option value="6">Picas</option>
							<option value="1">Inches</option>
							<option value="25.4">mm</option>
							<option value="2.54">cm</option>
						</select>
					</dd>
				</dl>
				
				<h1>Laser options</h1>
				<dl class="formgroup">
					<dt>Merge common lines</dt>
					<dd>
						<input type="checkbox" checked="checked" data-config="mergeLines" />
					</dd>
					
					<dt>Optimization ratio</dt>
					<dd>
						<input type="number" value="0.5" min="0" max="1" step="any" data-config="timeRatio" required />
					</dd>
				</dl>
				
				<h1>Meta-heuristic fine tuning</h1>
				<dl class="formgroup">
					<dt>GA population</dt>
					<dd>
						<input type="number" value="10" step="1" min="3" data-config="populationSize" required />
					</dd>
					
					<dt>GA mutation rate</dt>
					<dd>
						<input type="number" value="10" step="1" min="1" max="50" data-config="mutationRate" required />
					</dd>
				</dl>
				
				<div style="padding: 0 0 5em 0">
				<a href="#" id="setdefault">set all to default</a>
				</div>
			</form>
			
			<div class="config_explain" id="explain_units">
			
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="551.291px" height="285px" viewBox="0 0 551.291 285" enable-background="new 0 0 551.291 285" xml:space="preserve">
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M260.474,53.718H19.528
	c-7.827,0-14.174,6.346-14.174,14.174v184.25c0,7.828,6.346,14.174,14.174,14.174h240.945c7.828,0,14.172-6.346,14.172-14.174
	V67.892C274.646,60.064,268.302,53.718,260.474,53.718z M217.954,145.843c-19.568,0-35.434-15.863-35.434-35.433
	s15.865-35.433,35.434-35.433s35.434,15.863,35.434,35.433S237.522,145.843,217.954,145.843z"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="5.354" y1="34.685" x2="5.354" y2="4.685"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="274.646" y1="34.685" x2="274.646" y2="4.685"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="140" y1="34.685" x2="140" y2="11.185"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="70.646" y1="34.45" x2="70.646" y2="19.919"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="210.396" y1="34.45" x2="210.396" y2="19.919"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="242.396" y1="34.685" x2="242.396" y2="27.185"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="173.146" y1="34.685" x2="173.146" y2="27.185"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="104.396" y1="34.685" x2="104.396" y2="27.185"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="36.396" y1="34.685" x2="36.396" y2="27.185"/>
</svg>


				<h1>Units</h1>
				Whether to work in metric or imperial. This affects display only, and not import or export.
			</div>
			
			<div class="config_explain" id="explain_spacing">
				
				<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
				 width="551.291px" height="285px" viewBox="-5 -5 561.291 295" enable-background="new 0 0 551.291 285" xml:space="preserve">
			<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M255.119,0H14.173C6.346,0,0,6.346,0,14.174
				v184.25c0,7.828,6.345,14.174,14.173,14.174h240.946c7.828,0,14.172-6.346,14.172-14.174V14.174C269.291,6.347,262.947,0,255.119,0z
				 M212.599,92.125c-19.568,0-35.433-15.863-35.433-35.433S193.03,21.26,212.599,21.26c19.569,0,35.434,15.863,35.434,35.433
				S232.168,92.125,212.599,92.125z"/>
			<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M537.119,0H296.173
				C288.346,0,282,6.346,282,14.174v184.25c0,7.828,6.346,14.174,14.174,14.174h240.946c7.828,0,14.172-6.346,14.172-14.174V14.174
				C551.291,6.347,544.947,0,537.119,0z M494.6,92.125c-19.568,0-35.434-15.863-35.434-35.433S475.031,21.26,494.6,21.26
				s35.434,15.863,35.434,35.433S514.168,92.125,494.6,92.125z"/>
			<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="269.291" y1="234.303" x2="269.291" y2="258.303"/>
			<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="264.291" y1="246.303" x2="215.751" y2="246.303"/>
			<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="264.291" y1="246.303" x2="255.335" y2="237.348"/>
			<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="264.291" y1="246.303" x2="255.481" y2="255.112"/>
			<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="282" y1="258.303" x2="282" y2="234.303"/>
			<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="287" y1="246.303" x2="335.54" y2="246.303"/>
			<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="287" y1="246.303" x2="295.955" y2="255.258"/>
			<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="287" y1="246.303" x2="295.809" y2="237.493"/>
			</svg>
			
				<h1>Space between parts</h1>
				The minimum amount of space between each part. If you're planning on using the merge common lines feature, set this to zero.
			</div>
			
			<div class="config_explain" id="explain_scale">
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="551.291px" height="285px" viewBox="0 0 551.291 285" enable-background="new 0 0 551.291 285" xml:space="preserve">
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M262.828,7.55H21.882
	c-7.827,0-14.173,6.346-14.173,14.174v184.25c0,7.828,6.345,14.174,14.173,14.174h240.946c7.828,0,14.172-6.346,14.172-14.174
	V21.724C277,13.896,270.656,7.55,262.828,7.55z M220.308,99.675c-19.568,0-35.433-15.863-35.433-35.433S200.74,28.81,220.308,28.81
	c19.569,0,35.434,15.863,35.434,35.433S239.877,99.675,220.308,99.675z"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="315.519" y1="220.147" x2="291.519" y2="220.147"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="303.519" y1="215.147" x2="303.519" y2="166.608"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="303.519" y1="215.147" x2="312.474" y2="206.192"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="303.519" y1="215.147" x2="294.709" y2="206.338"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="291.519" y1="8.111" x2="315.519" y2="8.111"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="303.519" y1="13.111" x2="303.519" y2="61.651"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="303.519" y1="13.111" x2="294.563" y2="22.066"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="303.519" y1="13.111" x2="312.328" y2="21.921"/>
<g>
	<path fill="#B5BCC9" d="M301.852,117.849v-15.621h-5.658v-2.091c0.738,0,1.456-0.057,2.153-0.169
		c0.696-0.112,1.327-0.323,1.891-0.631s1.04-0.728,1.43-1.261c0.39-0.532,0.656-1.209,0.8-2.029h1.999v21.802H301.852z"/>
	<path fill="#B5BCC9" d="M321.286,99.091v-3.197h2.613v3.197H321.286z M323.899,101.951v15.897h-2.613v-15.897H323.899z"/>
	<path fill="#B5BCC9" d="M330.418,101.951v2.521h0.062c1.087-1.927,2.809-2.891,5.166-2.891c1.046,0,1.917,0.144,2.614,0.431
		c0.696,0.287,1.261,0.687,1.691,1.199c0.43,0.513,0.732,1.122,0.906,1.829c0.175,0.707,0.262,1.491,0.262,2.353v10.455h-2.613
		v-10.763c0-0.983-0.288-1.763-0.861-2.337c-0.574-0.573-1.363-0.861-2.368-0.861c-0.799,0-1.491,0.123-2.075,0.369
		s-1.071,0.595-1.461,1.046s-0.682,0.979-0.876,1.584c-0.195,0.604-0.292,1.266-0.292,1.983v8.979h-2.614v-15.897H330.418z"/>
	<path fill="#B5BCC9" d="M353.111,108.009v-2.091h15.498v2.091H353.111z M368.609,112.129v2.091h-15.498v-2.091H368.609z"/>
	<path fill="#B5BCC9" d="M380.771,99.829c0.318-0.901,0.774-1.686,1.369-2.353c0.594-0.666,1.322-1.184,2.183-1.553
		c0.861-0.369,1.824-0.554,2.891-0.554c0.964,0,1.84,0.139,2.629,0.415c0.789,0.277,1.471,0.677,2.045,1.199
		c0.574,0.523,1.02,1.164,1.338,1.922c0.317,0.759,0.477,1.63,0.477,2.614c0,0.636-0.077,1.204-0.23,1.706
		c-0.153,0.503-0.354,0.959-0.6,1.369s-0.528,0.789-0.846,1.138c-0.318,0.349-0.641,0.687-0.969,1.015
		c-0.328,0.308-0.651,0.62-0.969,0.938c-0.317,0.318-0.604,0.656-0.86,1.015c-0.257,0.359-0.462,0.749-0.615,1.169
		c-0.154,0.42-0.23,0.896-0.23,1.43v1.199h-2.614v-1.445c0.041-0.861,0.2-1.594,0.477-2.198c0.277-0.604,0.615-1.143,1.015-1.614
		c0.4-0.472,0.82-0.907,1.261-1.308c0.441-0.399,0.851-0.819,1.23-1.261c0.379-0.44,0.682-0.927,0.907-1.46s0.317-1.179,0.276-1.938
		c-0.082-1.127-0.445-2.009-1.092-2.645c-0.646-0.635-1.521-0.953-2.629-0.953c-0.738,0-1.373,0.134-1.906,0.399
		c-0.533,0.267-0.979,0.626-1.338,1.076c-0.358,0.451-0.62,0.984-0.784,1.6c-0.164,0.614-0.246,1.281-0.246,1.998h-2.613
		C380.305,101.705,380.453,100.731,380.771,99.829z M388.751,114.436v3.413h-3.414v-3.413H388.751z"/>
	<path fill="#B5BCC9" d="M400.404,101.951v2.152h0.062c0.431-0.881,1.107-1.522,2.029-1.922c0.923-0.399,1.938-0.6,3.045-0.6
		c1.229,0,2.301,0.226,3.213,0.677s1.671,1.061,2.275,1.829s1.062,1.656,1.368,2.66c0.308,1.005,0.462,2.07,0.462,3.198
		c0,1.127-0.149,2.193-0.446,3.197c-0.297,1.005-0.748,1.882-1.353,2.63c-0.605,0.748-1.364,1.337-2.275,1.768
		c-0.913,0.431-1.974,0.646-3.183,0.646c-0.39,0-0.826-0.041-1.308-0.123s-0.958-0.215-1.43-0.399s-0.918-0.436-1.338-0.753
		c-0.42-0.318-0.773-0.713-1.061-1.185h-0.062v8.18h-2.613v-21.955H400.404z M409.799,107.594c-0.195-0.707-0.492-1.338-0.892-1.892
		c-0.4-0.554-0.913-0.994-1.538-1.322c-0.625-0.327-1.358-0.492-2.198-0.492c-0.882,0-1.63,0.175-2.245,0.523
		s-1.117,0.805-1.507,1.368c-0.39,0.564-0.672,1.204-0.846,1.922s-0.261,1.445-0.261,2.184c0,0.779,0.092,1.532,0.276,2.26
		s0.477,1.368,0.877,1.922c0.399,0.554,0.917,0.999,1.553,1.338c0.635,0.338,1.403,0.507,2.306,0.507s1.655-0.174,2.261-0.522
		c0.604-0.349,1.091-0.81,1.46-1.384c0.369-0.573,0.636-1.23,0.8-1.968c0.164-0.738,0.246-1.496,0.246-2.275
		C410.091,109.023,409.993,108.301,409.799,107.594z"/>
	<path fill="#B5BCC9" d="M414.672,101.951h3.352l3.813,5.565l3.967-5.565h3.137l-5.474,7.318l6.149,8.579h-3.352l-4.428-6.58
		l-4.428,6.58h-3.168l5.966-8.364L414.672,101.951z"/>
</g>
</svg>
				<h1>SVG import scale</h1>
				This is the conversion factor between inches/mm to SVG units. Set to 72 units/inch for Illustrator and 90 units/inch for Inkscape.<br /><br />
				Normally the scaling factor can be extracted from the SVG file itself, but when not available this value is used.
			</div>
			
			<div class="config_explain" id="explain_curveTolerance">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="571.58px" height="469.585px" viewBox="0 0 571.58 469.585" enable-background="new 0 0 571.58 469.585"
	 xml:space="preserve">
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M548.119,4.183H307.174l-14.173,14.174v184.25
	l14.173,14.174h240.945l14.172-14.174V18.356L548.119,4.183z M505.6,96.308l-26.365-11.761l-9.067-23.672l10.378-25.055
	L505.6,25.442l26.166,11.539l9.268,23.894l-9.054,23.656L505.6,96.308z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M259.474,239.201H18.528l-9.398,3.564l-4.774,10.609
	v184.25l3.109,8.859l11.064,5.314h240.946c3.914,0,7.457-1.586,10.021-4.151s4.15-6.108,4.15-10.022v-184.25
	c0-3.914-1.586-7.457-4.15-10.021S263.388,239.201,259.474,239.201z M216.954,331.326l-16.057-3.839l-10.437-8.065l-6.982-11.89
	l-1.957-11.639l3.156-14.638l7.002-10.195l10.918-7.57l14.356-3.029l13.288,2.575l11.768,7.803l7.975,12.2l2.404,12.854
	l-2.164,12.221l-8.215,12.834l-11.263,7.593L216.954,331.326z"/>
<rect x="4.355" y="4.183" fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" width="269.291" height="212.598"/>
<rect x="193.202" y="35.59" transform="matrix(0.7071 0.7071 -0.7071 0.7071 106.9149 -136.6128)" fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" width="50.32" height="50.321"/>
</svg>


				<h1>Curve tolerance</h1>
				When computing a nest, curved sections must be turned into line segments. Curve tolerance is the maximum acceptable error when performing this approximation. Set to a higher value to speed up the nesting process, and a lower value when more precision is required.
			</div>
			
			<div class="config_explain" id="explain_endpointTolerance">
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="864px" height="864px" viewBox="0 0 864 864" enable-background="new 0 0 864 864" xml:space="preserve">
<path fill="none" stroke="#B5BCC9" stroke-miterlimit="10" d="M362.47,323.154c0,0-277.062,185.533-324.063,470.016"/>
<path fill="none" stroke="#B5BCC9" stroke-miterlimit="10" d="M377.312,310.786c0,0,264.694-207.796,430.436-239.955"/>
<circle fill="none" stroke="#B5BCC9" stroke-miterlimit="10" cx="368.082" cy="317.383" r="70.918"/>
<circle fill="none" stroke="#B5BCC9" stroke-miterlimit="10" cx="38.406" cy="793.17" r="2.885"/>
<circle fill="none" stroke="#B5BCC9" stroke-miterlimit="10" cx="804.862" cy="70.831" r="2.886"/>
<circle fill="none" stroke="#B5BCC9" stroke-miterlimit="10" cx="362.469" cy="323.154" r="2.885"/>
<circle fill="none" stroke="#B5BCC9" stroke-miterlimit="10" cx="377.312" cy="310.786" r="2.885"/>
</svg>
			<h1>Endpoint tolerance</h1>
			Real-world vectors are often messy and imprecise, sometimes the points from one path to the next does not match up exactly to form a closed path. Try increasing this value if you have trouble importing a file.
			</div>

			<div class="config_explain" id="explain_simplify">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="571.58px" height="287.63px" viewBox="0 0 571.58 287.63" enable-background="new 0 0 571.58 287.63" xml:space="preserve">
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M244.95,128.54
	c-2.267-4.825-6.577-8.373-11.39-10.493c-2.816-1.24-5.831-2.039-8.889-2.381c-2.4-0.269-5.51,0.34-6.476-2.54l-0.008-0.025
	c-1.647-6.587-7.741-11.507-13.772-13.932l-7.167-2.895c-0.008,0-0.008,0-0.008,0c-2.205-0.892-2.17-3.281-0.177-4.434l6.655-3.845
	c0.328-0.193,0.74-0.227,1.103-0.075l30.868,12.435l2.112-5.233l-22.707-9.154c-2.104-0.85-2.448-3.122-0.387-4.324l8.506-4.913
	c0.337-0.194,0.749-0.219,1.101-0.075l14.168,5.703l2.112-5.233l-13.049-5.259c-0.539-0.21-0.858-0.773-0.782-1.345l1.969-13.934
	l-5.587-0.781l-2.136,15.118c-0.05,0.387-0.278,0.725-0.615,0.917l-8.514,4.922c-2.012,1.144-3.879-0.177-3.551-2.499l3.424-24.247
	l-5.586-0.791l-4.652,32.963c-0.059,0.387-0.286,0.723-0.623,0.917l-6.655,3.844c-1.944,1.103-4.064,0.06-3.761-2.313l0.008-0.059
	l1.086-7.665c0.731-5.215,0.151-10.677-2.516-15.286h-0.009c-0.739-1.296-1.564-2.39-2.389-3.307h-0.008
	c-0.084-0.102-0.177-0.201-0.27-0.295l-0.017-0.025c-1.043-1.161-1.178-2.6-0.438-3.97h0.009c4.715-7.853,5.889-19.09,0.446-26.897
	l-0.757-1.085l-1.32-0.109c-5.505-0.51-10.839,1.631-15.118,4.983c-2.224,1.742-4.198,3.794-5.932,6.021
	c-1.491,1.914-2.702,5.056-5.663,4.451l-0.033-0.009c-0.134-0.034-0.269-0.06-0.396-0.093c-1.204-0.252-2.558-0.422-4.046-0.422
	h-0.008h-0.017c-5.326,0-10.34,2.23-14.487,5.469l-6.092,4.77c-1.791,1.792-3.919-0.025-3.936-2.06v-7.69
	c0-0.387,0.185-0.75,0.488-0.994l26.216-20.51l-3.483-4.442L132.508,30.51c-1.809,1.405-3.911,0.53-3.937-1.835V18.85
	c0-0.388,0.185-0.757,0.488-0.993l12.031-9.415L137.607,4l-11.08,8.666c-0.455,0.361-1.094,0.361-1.548,0L113.899,4l-3.482,4.443
	l12.03,9.415c0.304,0.235,0.488,0.606,0.488,0.993v9.825c-0.008,2.381-2.154,3.214-3.938,1.835v-0.009L99.713,15.417l-3.482,4.442
	l26.214,20.51c0.304,0.244,0.488,0.606,0.488,0.994v7.69c-0.01,2.207-2.116,3.454-3.938,2.06l-6.091-4.77
	c-4.147-3.239-9.163-5.469-14.488-5.469h-0.009h-0.017c-1.49,0-2.844,0.17-4.038,0.422h-0.009c-0.126,0.033-0.261,0.059-0.395,0.093
	l-0.026,0.009c-2.804,0.526-3.842-2.03-5.251-3.904c-1.706-2.269-3.654-4.371-5.852-6.172c-4.39-3.597-9.867-5.892-15.616-5.38
	l0.008-0.008l-1.396,0.143l-0.808,1.136c-3.103,4.459-3.981,10.059-3.343,15.374c0.327,2.718,1.034,5.39,2.07,7.923
	c0.953,2.33,3.484,5.176,1.323,7.562l-0.016,0.025c-4.762,5.09-6.125,12.148-5.166,18.896l1.093,7.665v0.042
	c0.32,2.38-1.825,3.433-3.752,2.331l-6.663-3.837c-0.329-0.194-0.564-0.53-0.614-0.908L45.247,49.33l-5.587,0.79l3.458,24.246
	c0.31,2.28-1.54,3.643-3.56,2.49l-8.513-4.904c-0.337-0.194-0.564-0.53-0.614-0.908l-2.153-15.127l-5.587,0.8l1.977,13.923
	c0.084,0.572-0.235,1.136-0.773,1.346L10.854,77.26l2.112,5.233l14.159-5.729c0.362-0.143,0.773-0.108,1.102,0.084l8.515,4.905
	c2.052,1.186,1.758,3.441-0.371,4.323h-0.009l-22.699,9.171l2.12,5.233l30.859-12.478c0.354-0.142,0.766-0.107,1.102,0.085
	l6.655,3.836c1.978,1.145,2.037,3.551-0.177,4.433l-7.176,2.903c-4.88,1.977-9.314,5.207-11.973,9.827v0.009
	c-0.749,1.295-1.346,2.674-1.783,4.113l-0.008,0.025c-0.488,1.497-1.657,2.314-3.215,2.364v-0.009
	c-9.111,0-19.484,4.45-23.515,13.083L6,129.868l0.555,1.203c2.329,4.938,6.788,8.535,11.75,10.625
	c2.499,1.054,5.145,1.71,7.827,2.076c2.492,0.34,6.192-0.33,7.187,2.686l0.008,0.034c2.037,6.672,7.455,11.375,13.781,13.916
	l7.176,2.893c2.213,0.893,2.17,3.282,0.186,4.434l-6.656,3.854c-0.336,0.194-0.74,0.219-1.101,0.076l-30.876-12.428l-2.112,5.242
	l22.725,9.136c2.031,0.822,2.332,3.19,0.378,4.326l-8.506,4.921c-0.336,0.194-0.74,0.22-1.103,0.077l-14.167-5.704l-2.103,5.241
	l13.048,5.25c0.539,0.211,0.858,0.775,0.783,1.346l-1.96,13.931l5.586,0.782l2.129-15.126c0.05-0.378,0.277-0.723,0.613-0.917
	l8.507-4.923c2.019-1.144,3.877,0.168,3.558,2.491v0.008l-3.408,24.247l5.587,0.782l4.635-32.963
	c0.05-0.387,0.277-0.725,0.614-0.917l6.654-3.845c1.977-1.136,4.081-0.024,3.752,2.364v0.008l-1.077,7.666
	c-0.965,6.754,0.486,13.777,5.199,18.887c1.399,1.406,0.882,3.116,0.087,4.685c-1.35,2.667-2.374,5.506-2.99,8.432
	c-1.27,6.039-0.688,12.604,2.919,17.768l0.757,1.086l1.32,0.109c9.516,0.816,18.45-5.948,23.045-13.832l0.017-0.025
	c0.815-1.328,2.128-1.926,3.65-1.606h0.018c0.143,0.034,0.278,0.059,0.403,0.093h0.009c1.194,0.252,2.55,0.421,4.029,0.421h0.008
	h0.018c5.334,0,10.348-2.23,14.487-5.478l6.092-4.77c1.8-1.8,3.92,0.009,3.938,2.052l0.008,7.691c0,0.387-0.177,0.757-0.488,0.991
	l-26.198,20.53l3.483,4.442l19.274-15.102c1.809-1.413,3.912-0.538,3.938,1.835v9.817c0,0.387-0.177,0.757-0.48,1.001l-12.022,9.415
	l3.476,4.442l11.08-8.673c0.453-0.363,1.093-0.363,1.556,0l11.081,8.665l3.475-4.45l-12.031-9.406
	c-0.312-0.234-0.487-0.605-0.487-0.992l-0.008-9.817c0-2.391,2.163-3.24,3.937-1.843l19.292,15.085l3.475-4.45L129.11,219.16
	c-0.303-0.236-0.479-0.606-0.479-0.994l-0.008-7.672c0-2.431,1.986-3.374,3.938-2.07l6.092,4.762
	c5.349,4.181,12.186,6.532,18.946,4.947l0.033-0.008c1.532-0.319,2.844,0.278,3.66,1.607l0.008,0.025
	c4.663,7.958,13.475,14.576,23.068,13.806l1.312-0.109l0.757-1.085c3.088-4.435,3.973-9.96,3.332-15.251
	c-0.331-2.738-1.05-5.427-2.071-7.986c-0.937-2.351-3.434-5.248-1.293-7.63l0.017-0.025c0.093-0.102,0.186-0.202,0.27-0.294h0.008
	c4.552-5.082,5.831-11.988,4.897-18.593l-1.085-7.665v-0.009c-0.328-2.398,1.801-3.483,3.752-2.364v-0.009l6.654,3.845
	c0.337,0.194,0.564,0.531,0.623,0.918l4.668,32.954l5.587-0.79l-3.433-24.248c-0.328-2.279,1.531-3.642,3.55-2.49l8.513,4.905
	c0.337,0.193,0.564,0.53,0.615,0.917l2.145,15.126l5.587-0.799l-1.978-13.924c-0.076-0.572,0.244-1.136,0.782-1.347l13.049-5.266
	l-2.112-5.232l-14.167,5.711c-0.361,0.152-0.766,0.118-1.103-0.076l-8.514-4.905c-2.044-1.195-1.75-3.458,0.388-4.324l22.698-9.17
	l-2.111-5.233l-30.869,12.46c-0.354,0.143-0.765,0.118-1.102-0.076l-6.655-3.844c-1.985-1.152-2.027-3.551,0.186-4.434l7.168-2.894
	c4.888-1.978,9.321-5.2,11.979-9.826h0.008c0.734-1.285,1.392-2.679,1.776-4.114l0.008-0.027c0.472-1.447,1.716-2.314,3.223-2.363
	c9.161,0,19.446-4.398,23.523-13.065l0.555-1.195L244.95,128.54 M122.909,111.662l-2.28,5.695c-0.211,0.522-0.563,1.001-1.027,1.321
	c-0.126,0.102-0.261,0.194-0.413,0.244c-0.513,0.235-1.069,0.278-1.616,0.211h-0.017l-6.074-0.866
	c-0.556-0.084-0.984-0.522-1.069-1.069l-1.799-12.476c-0.118-0.783-0.018-1.599,0.479-2.238c0.219-0.53,0.707-0.815,1.271-0.756
	c0.825-0.144,1.606,0.184,2.246,0.688l9.902,7.791C122.951,110.552,123.11,111.142,122.909,111.662 M113.091,129.701v0.067v0.009
	v0.017v0.008c0,0.631-0.253,1.255-0.647,1.742l-3.787,4.829c-0.345,0.438-0.942,0.598-1.463,0.387l-11.703-4.677
	c-0.934-0.371-1.81-1.145-1.859-2.213v-0.143c0.05-1.077,0.917-1.843,1.859-2.221l11.694-4.694c0.521-0.211,1.111-0.051,1.456,0.387
	l3.803,4.82C112.822,128.489,113.074,129.086,113.091,129.701 M119.628,65.222c1.725-0.614,3.298,0.126,3.306,2.103v8.321
	c-0.011,2.06-2.067,2.932-3.651,1.701l-7.126-5.579c-1.531-1.204-1.296-3.34,0.598-4.03L119.628,65.222 M92.554,59.72
	c0.945-2.729,1.449-5.624,1.272-8.516c-0.111-1.812-0.27-3.954,1.959-4.441l0.043-0.009c4.857-0.923,9.701,1.017,13.503,3.963
	l0.034,0.017l7.539,5.907c1.304,1.026,1.405,3.054-0.337,3.692h-0.008l-9.179,3.357c-4.466,1.619-9.806,2.1-14.092-0.328
	l-0.025-0.008C91.912,62.606,92.151,60.949,92.554,59.72 M89.458,72.945l0.017-0.066c0.319-1.019,0.875-2.002,1.801-2.584
	l0.083-0.05c0.977-0.513,2.155-0.548,3.214-0.303l0.059,0.018c2.224,0.64,4.138,2.082,6.035,3.347
	c2.364,1.575,4.832,3.001,7.241,4.503c4.81,2.999,9.895,5.703,14.437,9.102c0.361,0.236,0.589,0.64,0.589,1.069v8.219
	c-0.01,1.805-1.747,3.191-3.374,1.994l-18.933-13.85c-1.68-1.23-1.901-0.986-1.689,1.069l2.551,23.229
	c0.219,2.036-1.784,2.853-3.416,1.929l-7.126-4.106c-0.37-0.211-0.605-0.606-0.631-1.036c0-5.447-0.452-10.882-0.647-16.323
	c-0.103-2.809-0.197-5.616-0.265-8.426C89.343,78.152,88.847,75.433,89.458,72.945 M67.172,38.619
	c0.077-1.941,0.291-7.26,3.193-6.978c3.127,0.303,6.217,1.892,8.687,3.762c5.427,4.11,9.533,10.97,9.135,17.931
	c-0.131,2.289-0.78,7.32-3.873,7.299c-3.157-0.022-6.271-1.382-8.732-3.294C70.017,53.016,66.899,45.597,67.172,38.619
	 M65.312,70.766c0.32-3.062,1.439-6.016,3.45-8.361l0.033-0.043c1.254-1.363,2.751-0.908,4.064,0.025h0.008
	c2.591,1.842,5.586,3.113,8.725,3.643l0.042,0.009c1.246,0.243,2.718,0.815,2.776,2.304h0.009v0.084
	c0,0.009,0.008,0.009,0.008,0.017L84.42,68.47v0.017c-0.139,4.988-3.037,9.26-6.757,12.376l-7.479,6.284h-0.009
	c-1.438,1.22-3.128,0.084-3.373-1.547l-1.346-9.481v-0.025l-0.008-0.017C65.217,74.314,65.134,72.536,65.312,70.766 M73.053,96.157
	c-1.683-0.985-1.565-2.743-0.168-3.92v0.009l5.611-4.711c1.541-1.287,3.492-0.462,3.787,1.505l1.27,8.951
	c0.294,2.07-1.421,3.365-3.289,2.313L73.053,96.157 M77.1,109.206h-0.008l-8.388,3.39c-1.787,0.726-3.566-0.544-3.188-2.524
	l1.253-7.209c0.32-1.825,1.751-2.785,3.466-1.818l7.21,4.148C79.287,106.261,79.025,108.415,77.1,109.206 M38.869,114.304
	l0.018-0.043c1.654-4.694,5.679-7.884,10.164-9.726l0.034-0.008l0.009-0.01l8.876-3.583c1.54-0.623,3.34,0.286,3.038,2.137v0.008
	l-1.683,9.625c-0.413,2.397-1.162,4.762-2.373,6.874v0.008c-1.212,2.087-2.886,3.896-4.939,5.166l-0.025,0.017
	c-1.3,0.779-2.643-0.237-3.5-1.193c-1.217-1.389-2.507-2.652-4.019-3.721C42.552,118.499,37.89,117.482,38.869,114.304
	 M27.858,138.349H27.85c-3.118-0.303-6.21-1.166-8.985-2.632c-1.943-1.026-7.146-4.028-5.829-6.833
	c1.231-2.625,4.985-4.574,7.509-5.657c3.399-1.458,7.156-2.16,10.855-1.964c3.403,0.183,6.827,1.154,9.654,3.096
	c1.436,0.986,2.596,2.201,3.679,3.555c1.137,1.419,1.128,2.244,0.084,3.711C41.002,136.984,34.181,138.95,27.858,138.349
	 M58.027,158.726l-0.008-0.009l-8.875-3.567l-0.026-0.009l-0.018-0.008c-4.5-1.834-8.522-5.006-10.188-9.708l-0.018-0.051
	c-0.748-2.426,1.702-3.257,3.375-4.166c2.362-1.281,4.492-3.001,6.198-5.08l0.027-0.034c0.858-0.976,2.17-2.001,3.499-1.203
	l0.025,0.017c4.237,2.631,6.497,7.251,7.336,12.039l1.691,9.625C61.375,158.397,59.575,159.332,58.027,158.726 M58.396,132.78
	l-0.049-0.05c-0.716-0.783-1.296-1.757-1.337-2.852v-0.101c0.034-1.086,0.613-2.062,1.337-2.853l0.042-0.05
	c1.702-1.628,3.951-2.574,6.031-3.61c2.504-1.248,4.937-2.651,7.405-3.967c4.989-2.659,9.837-5.864,15.092-7.97
	c0.387-0.194,0.842-0.186,1.22,0.025l7.118,4.105c1.614,0.935,1.934,3.071,0.05,3.913v0.009l-21.463,9.489
	c-2.04,0.814-1.352,1.295,0,1.891l21.48,9.459c1.884,0.833,1.565,2.979-0.043,3.913l-7.118,4.121
	c-1.537,0.874-6.074-2.477-7.494-3.229c-2.588-1.374-5.175-2.752-7.765-4.125c-2.497-1.323-4.962-2.714-7.479-3.999
	C63.031,135.674,60.369,134.668,58.396,132.78 M73.111,163.471l7.202-4.165c1.769-1.005,3.632,0.296,3.299,2.313l-1.263,8.961
	c-0.278,1.952-2.245,2.784-3.778,1.505l-0.008-0.008l-5.611-4.695C71.6,166.259,71.505,164.409,73.111,163.471 M70.285,158.59
	c-1.725,0.967-3.129,0.018-3.466-1.809l-1.271-7.219c-0.343-1.947,1.362-3.263,3.188-2.524l8.396,3.374
	c1.901,0.773,2.204,2.928,0.354,4.004v0.009L70.285,158.59 M65.541,183.561l0.008-0.008v-0.025l1.337-9.49
	c0.226-1.626,1.982-2.71,3.366-1.549l7.504,6.268c1.865,1.557,3.543,3.381,4.761,5.494v0.009c1.381,2.365,3.974,9.068-0.815,9.322
	c-3.424,0.581-6.377,2.07-9.212,4.021c-1.127,0.851-2.625,0.698-3.576-0.336C65.768,193.294,64.864,188.537,65.541,183.561
	 M84.217,218.837c-2.08,2.894-4.743,5.296-7.835,7.062c-1.792,1.024-6.002,3.604-7.732,1.36c-1.711-2.218-1.535-5.726-1.316-8.355
	c0.292-3.513,1.221-6.947,2.905-10.055c1.733-3.196,4.226-6.052,7.395-7.881c1.93-1.115,5.37-2.728,7.669-2.098
	c2.775,0.762,3.029,7.227,2.87,9.444C87.9,212.104,86.409,215.759,84.217,218.837 M89.559,186.657
	c-0.559-2.268-0.209-4.666-0.095-6.964c0.141-2.848,0.152-5.706,0.251-8.557c0.103-2.956,0.205-5.912,0.318-8.867
	c0.099-2.568-0.289-5.596,0.326-8.096c0.026-0.429,0.261-0.825,0.631-1.043l7.118-4.115c1.641-0.942,3.626-0.126,3.416,1.91v0.009
	l-2.607,24.181c-0.086,0.995,0.38,1.091,1,0.636l19.661-14.41c1.717-1.245,3.357,0.143,3.374,1.995l0.009,8.219
	c0,0.438-0.227,0.833-0.589,1.069c-4.799,2.4-9.068,5.746-13.602,8.589c-2.367,1.484-4.739,2.958-7.123,4.413
	c-2.24,1.367-4.426,3.236-6.979,3.977l-0.067,0.017C90.628,190.183,89.559,186.657,89.559,186.657 M116.943,202.895v0.009
	l-7.538,5.905l-0.026,0.017l-0.008,0.009c-3.128,2.43-6.89,4.197-10.919,4.197h-0.009c-0.009,0-0.009,0-0.018,0h-0.041
	c-0.917-0.007-1.76-0.1-2.507-0.235l-0.05-0.008c-1.827-0.404-2.163-1.952-2.02-3.534v-0.008c0.238-2.324,0.03-4.698-0.503-6.97
	c-0.39-1.656-2.152-4.898-0.002-6.078l0.017-0.008c4.383-2.364,9.54-1.994,14.1-0.337l9.179,3.349
	C118.349,199.84,118.249,201.868,116.943,202.895 M122.968,192.217c-0.008,1.961-1.591,2.71-3.297,2.096h-0.009l-6.882-2.507
	c-1.876-0.69-2.12-2.827-0.588-4.03l7.118-5.578c1.632-1.27,3.634-0.505,3.652,1.691l0.008,8.32
	C122.968,192.209,122.968,192.209,122.968,192.217 M122.522,149.337l-9.894,7.79c-0.799,0.622-1.893,0.993-2.852,0.514l-0.126-0.076
	c-0.909-0.589-1.144-1.725-0.993-2.727l1.783-12.467c0.075-0.556,0.514-0.993,1.068-1.077l6.067-0.875
	c0.53-0.075,1.043-0.017,1.539,0.195c0.109,0.023,0.21,0.066,0.303,0.116c0.008,0.009,0.017,0.009,0.025,0.018
	c0.556,0.312,0.96,0.851,1.195,1.431l2.28,5.696C123.127,148.394,122.968,148.992,122.522,149.337 M193.503,100.852l8.884,3.583
	h0.009l0.026,0.009c2.944,1.203,5.721,2.953,7.749,5.426h0.008c1.044,1.279,1.876,2.735,2.424,4.292l0.017,0.049
	c0.697,2.245-1.394,3.169-3.043,3.999c-2.506,1.258-4.754,3.09-6.54,5.248l-0.024,0.026c-0.859,0.975-2.163,1.994-3.492,1.203
	l-0.026-0.017c-4.254-2.556-6.504-7.304-7.336-12.04l-1.682-9.625C190.155,101.171,191.947,100.23,193.503,100.852 M185.175,66.585
	c1.127,2.995,1.245,6.268,0.816,9.423v0.016v0.025l-1.346,9.482c-0.235,1.609-1.983,2.709-3.366,1.547l-7.496-6.268
	c-3.727-3.113-6.621-7.387-6.773-12.368v-0.051c-0.008-1.556,1.514-2.145,2.792-2.406l0.034-0.008
	c3.424-0.582,6.386-2.062,9.221-4.013c1.127-0.857,2.625-0.698,3.575,0.337l0.034,0.033
	C183.744,63.59,184.586,65.037,185.175,66.585 M174.035,105.142l7.202-4.165c1.725-0.975,3.129-0.017,3.466,1.818l1.271,7.209
	c0.336,1.961-1.372,3.24-3.188,2.525h-0.008l-8.388-3.383C172.499,108.414,172.204,106.189,174.035,105.142 M171.209,100.254
	c-1.868,1.06-3.601-0.211-3.298-2.314l1.262-8.959c0.287-1.944,2.255-2.786,3.786-1.499h0.009l5.611,4.694
	c1.397,1.178,1.515,2.928-0.16,3.913h-0.008L171.209,100.254 M167.339,40.723c2.771-3.857,6.715-7.003,11.179-8.684
	c1.596-0.601,3.57-1.128,4.628,0.589c1.109,1.8,1.155,4.237,1.13,6.284c-0.12,10-6.706,21.659-17.88,21.716h-0.009
	c-2.822,0-3.156-7.497-3.033-9.303C163.616,47.506,165.127,43.821,167.339,40.723 M134.603,56.641l7.538-5.907v0.008l0.026-0.017
	l0.008-0.008c3.836-2.979,8.607-4.88,13.502-3.963l0.051,0.009c2.955,0.657,1.832,4.427,1.942,6.579
	c0.097,1.899,0.475,3.773,1.029,5.589c0.427,1.401,1.226,3.482-0.447,4.423l-0.034,0.006c-4.279,2.427-9.632,1.957-14.092,0.329
	l-9.179-3.357C133.26,59.725,133.313,57.638,134.603,56.641 M128.571,67.326c0.008-1.961,1.59-2.718,3.306-2.095v-0.009l6.882,2.515
	c1.81,0.667,2.076,2.858,0.588,4.031l-7.126,5.578c-1.656,1.286-3.63,0.427-3.651-1.701V67.326 M128.571,87.98
	c0-0.43,0.226-0.833,0.588-1.069c1.422-1.421,3.481-2.203,5.164-3.268c2.546-1.611,5.095-3.218,7.649-4.817
	c2.633-1.645,5.268-3.288,7.922-4.902c2.241-1.364,4.421-3.233,6.979-3.965l0.067-0.018c1.035-0.236,2.17-0.252,3.138,0.261
	l0.083,0.051c0.925,0.58,1.481,1.572,1.801,2.591l0.017,0.06c0.552,2.248,0.202,4.626,0.094,6.904
	c-0.135,2.847-0.158,5.704-0.258,8.553c-0.198,5.674-0.659,11.347-0.659,17.026c-0.017,0.429-0.253,0.825-0.631,1.035l-7.118,4.114
	c-1.641,0.934-3.643,0.117-3.408-1.919v-0.008c0,0,0,0,0-0.008l2.442-22.57c0.256-2.378-0.135-2.673-2.175-1.238l-18.322,13.402
	c-1.681,1.214-3.355-0.134-3.374-1.994V87.98 M156.015,127.47c0.941,0.379,1.809,1.145,1.859,2.222v0.134
	c-0.051,1.078-0.918,1.843-1.859,2.222l-11.694,4.693c-0.521,0.202-1.119,0.041-1.464-0.396l-3.795-4.82
	c-0.387-0.488-0.648-1.103-0.648-1.733v-0.018v-0.008v-0.017c0-0.008,0-0.008,0-0.008v-0.059c0.017-0.615,0.27-1.211,0.648-1.691
	l3.795-4.812c0.345-0.446,0.934-0.605,1.455-0.395L156.015,127.47 M128.991,110.207l9.903-7.791c0.798-0.63,1.91-1.001,2.869-0.504
	l0.109,0.067c0.908,0.589,1.135,1.724,0.992,2.727l-1.792,12.476c-0.075,0.546-0.513,0.985-1.068,1.069l-6.066,0.875h-0.009
	c-0.63,0.083-1.279,0.008-1.833-0.32v0.009c-0.009-0.009-0.009-0.009-0.018-0.009c0,0,0-0.008-0.008-0.008
	c-0.546-0.312-0.959-0.851-1.195-1.439l-2.279-5.696C128.395,111.142,128.555,110.552,128.991,110.207 M128.613,147.873l2.271-5.695
	c0.228-0.589,0.639-1.127,1.194-1.438c0.009-0.009,0.009-0.009,0.018-0.018c0.548-0.312,1.223-0.407,1.842-0.311l6.074,0.867
	c0.555,0.084,0.992,0.514,1.068,1.069l1.801,12.476c0.143,1.002-0.093,2.138-0.993,2.726l-0.118,0.068
	c-0.959,0.487-2.061,0.117-2.852-0.496l-0.008-0.01l-9.912-7.782C128.562,148.983,128.402,148.394,128.613,147.873 M131.919,194.304
	c-1.725,0.624-3.307-0.125-3.307-2.095l-0.008-8.312c0-2.178,2.027-2.969,3.651-1.707l7.126,5.569
	c1.532,1.203,1.296,3.332-0.589,4.029L131.919,194.304 M158.992,199.79c-0.94,2.726-1.449,5.627-1.271,8.516
	c0.111,1.81,0.279,3.954-1.95,4.44l-0.042,0.018c-1.624,0.302-3.298,0.31-4.931,0.042h-0.008c-3.155-0.522-6.057-2.045-8.565-3.996
	l-0.017-0.008l-0.025-0.017l-7.539-5.898c-1.304-1.026-1.405-3.063,0.345-3.694l9.169-3.356c4.605-1.694,9.651-1.989,14.102,0.312
	l0.024,0.017C159.635,196.896,159.4,198.572,158.992,199.79 M162.013,186.606l-0.017,0.068c-0.32,1.018-0.875,2.011-1.801,2.591
	l-0.084,0.052c-0.968,0.505-2.094,0.496-3.139,0.261l-0.067-0.017c-2.225-0.634-4.138-2.081-6.035-3.348
	c-2.362-1.575-4.831-2.998-7.24-4.5c-4.81-2.999-9.907-5.69-14.446-9.097c-0.362-0.229-0.588-0.632-0.588-1.061v-8.219
	c0-1.859,1.674-3.223,3.365-2.002l19.607,14.338c0.58,0.414,1.156,0.126,1.079-0.583l-2.64-24.179
	c-0.219-2.044,1.775-2.861,3.408-1.926l7.126,4.113c0.37,0.211,0.613,0.605,0.63,1.034c0,5.429,0.444,10.85,0.64,16.272
	c0.101,2.804,0.188,5.608,0.255,8.412C162.128,181.363,162.625,184.099,162.013,186.606 M183.492,225.686
	c-2.325,7.154-14.435-4.463-16.363-7.261c-2.321-3.367-3.824-7.405-3.786-11.527c0.023-2.728,0.635-8.294,4.45-7.951h0.008
	C179.682,200.061,186.936,215.029,183.492,225.686 M186.158,188.802c-0.317,3.055-1.446,6.021-3.457,8.363l-0.025,0.042
	c-2.261,2.427-6.048-1.414-8.262-2.328c-1.838-0.759-7.371-1-7.371-3.746c0,0,0,0,0-0.009v-0.008c0-2.398,0.814-4.846,2.003-6.907
	V184.2c1.229-2.112,2.895-3.937,4.761-5.502l7.488-6.276c1.455-1.229,3.129-0.084,3.382,1.548l1.337,9.482v0.007l0.008,0.034
	C186.268,185.252,186.335,187.036,186.158,188.802 M178.427,163.411c1.682,0.985,1.565,2.735,0.168,3.913l-5.611,4.703
	c-1.54,1.286-3.49,0.461-3.786-1.506l-1.271-8.952c-0.284-2.043,1.437-3.393,3.298-2.313L178.427,163.411 M172.799,152.45
	c0-0.842,0.555-1.665,1.598-2.095l8.388-3.382c1.799-0.721,3.484,0.621,3.196,2.523l-1.261,7.219
	c-0.309,1.737-1.833,2.728-3.466,1.809l-7.21-4.155C173.202,153.879,172.799,153.156,172.799,152.45 M174.935,142.783
	c-2.142,1.139-4.287,2.271-6.437,3.396c-1.089,0.57-3.836,2.777-5.14,2.022l-7.118-4.106c-1.615-0.933-1.935-3.079-0.042-3.92v0.008
	l21.159-9.347c2.407-1.063,2.291-1.154,0.032-2.155l-21.199-9.346c-1.817-0.798-1.53-3.009,0.042-3.913l7.117-4.114
	c0.37-0.219,0.834-0.227,1.211-0.025c4.721,2.948,9.898,5.176,14.807,7.792c2.452,1.307,4.874,2.69,7.363,3.924
	c2.196,1.088,4.588,2.071,6.376,3.799l0.051,0.05c0.724,0.783,1.295,1.759,1.337,2.852v0.092c-0.034,1.094-0.613,2.069-1.337,2.861
	l-0.043,0.042c-2.296,2.04-5.512,3.445-8.204,4.889C181.608,139.358,178.252,141.032,174.935,142.783 M212.626,145.273l-0.016,0.051
	c-1.658,4.704-5.679,7.883-10.172,9.717l-0.025,0.008l-0.034,0.017l-8.859,3.576c-1.54,0.614-3.357-0.295-3.029-2.145
	c0-0.008,0-0.008,0-0.008l1.683-9.617c0.782-4.476,2.776-8.843,6.554-11.543h0.008c0.252-0.184,0.505-0.354,0.757-0.504l0.026-0.017
	c1.329-0.798,2.634,0.228,3.5,1.203h-0.008c1.594,1.823,3.424,3.454,5.505,4.702C210.309,141.784,213.488,142.463,212.626,145.273
	 M235.031,134.092c-6.19,4.424-15.148,5.719-22.142,2.499c-2.475-1.14-6.275-3.585-6.898-6.488
	c-0.542-2.524,3.672-5.455,5.485-6.512c5.411-3.153,12.334-3.078,18.114-1.019c2.928,1.043,6.185,2.656,8.286,4.991
	C240.382,130.343,237.244,132.498,235.031,134.092"/>
<polygon fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" points="432.973,4 384.89,26.076 341.765,56.716 
	329.928,77.26 325.073,129.868 330.021,182.476 342.096,201.555 385.016,233.518 433.04,255.545 456.757,255.537 504.755,233.454 
	547.848,202.88 559.701,182.344 564.58,129.736 559.665,77.125 547.804,56.588 504.694,26.05 456.681,4 "/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="272.29" y1="128.886" x2="302.29" y2="128.886"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="302.29" y1="128.886" x2="291.029" y2="117.625"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="302.29" y1="128.886" x2="290.225" y2="140.952"/>
</svg>

				<h1>Use rough approximation</h1>
				Certain geometries can be very time consuming to compute, eg. several hundred unique snowflakes. You may wish to use a simple polygon approximation to speed up the process, at the cost of greater material use.<br /><br />
				If your vector not unique (ie. several hundred identical snowflakes) using the "quantity" field is another way to speed up the process dramatically.
			</div>
			
			<div class="config_explain" id="explain_rotations">
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="571.58px" height="621.077px" viewBox="0 0 571.58 621.077" enable-background="new 0 0 571.58 621.077"
	 xml:space="preserve">
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M33.537,10.388v125.618c0,4.08,3.309,7.39,7.39,7.39
	h96.059c4.081,0,7.39-3.309,7.39-7.39V10.388c0-4.081-3.309-7.388-7.39-7.388H40.927C36.847,3,33.537,6.308,33.537,10.388z
	 M81.567,32.557c0,10.202-8.271,18.474-18.474,18.474c-10.202,0-18.473-8.272-18.473-18.474s8.271-18.474,18.473-18.474
	C73.297,14.083,81.567,22.355,81.567,32.557z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M277.83,32.558H152.212
	c-4.08,0-7.39,3.308-7.39,7.389v96.059c0,4.081,3.308,7.39,7.39,7.39H277.83c4.081,0,7.388-3.309,7.388-7.39V39.947
	C285.218,35.867,281.911,32.558,277.83,32.558z M255.662,80.588c-10.202,0-18.474-8.271-18.474-18.474
	c0-10.202,8.272-18.472,18.474-18.472s18.474,8.271,18.474,18.472C274.135,72.317,265.863,80.588,255.662,80.588z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M136.986,143.943H11.369
	c-4.08,0-7.39,3.308-7.39,7.39v96.059c0,4.081,3.308,7.389,7.39,7.389h125.617c4.081,0,7.389-3.308,7.389-7.389v-96.059
	C144.375,147.253,141.067,143.943,136.986,143.943z M114.818,191.973c-10.202,0-18.474-8.271-18.474-18.474
	c0-10.202,8.272-18.472,18.474-18.472s18.473,8.271,18.473,18.472C133.292,183.703,125.02,191.973,114.818,191.973z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M255.66,276.951V151.333
	c0-4.08-3.308-7.39-7.389-7.39h-96.059c-4.082,0-7.39,3.308-7.39,7.39v125.618c0,4.081,3.308,7.388,7.39,7.388h96.059
	C252.351,284.339,255.66,281.031,255.66,276.951z M207.631,254.782c0-10.202,8.271-18.474,18.473-18.474
	c10.202,0,18.472,8.272,18.472,18.474s-8.271,18.474-18.472,18.474C215.901,273.256,207.631,264.984,207.631,254.782z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M114.837,606.969V481.353
	c0-4.081-3.308-7.391-7.39-7.391H11.39c-4.082,0-7.39,3.31-7.39,7.391v125.616c0,4.082,3.308,7.388,7.39,7.388h96.058
	C111.528,614.356,114.837,611.051,114.837,606.969z M66.807,584.801c0-10.201,8.271-18.475,18.474-18.475
	c10.202,0,18.473,8.273,18.473,18.475c0,10.203-8.271,18.474-18.473,18.474C75.078,603.274,66.807,595.004,66.807,584.801z"/>
<g>
	<path fill="#B5BCC9" d="M355.567,49.777v2.307h-2.952v5.104h-2.46v-5.104h-9.562v-2.521l9.932-14.176h2.091v14.391H355.567z
		 M350.155,39.107h-0.062l-7.257,10.67h7.318V39.107z"/>
</g>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M206.068,412.608l-88.824-88.825
	c-2.884-2.884-7.565-2.884-10.45,0L38.87,391.708c-2.886,2.886-2.886,7.565,0,10.45l88.824,88.823c2.887,2.889,7.565,2.886,10.45,0
	l67.924-67.923C208.954,420.173,208.955,415.495,206.068,412.608z M156.432,430.897c-7.214-7.214-7.215-18.911,0-26.126
	c7.213-7.215,18.911-7.214,26.125,0.002c7.214,7.213,7.214,18.91,0.001,26.124C175.343,438.11,163.645,438.109,156.432,430.897z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M348.403,398.172l-88.825-88.825
	c-2.884-2.884-7.564-2.885-10.45,0l-67.924,67.925c-2.885,2.886-2.885,7.564,0,10.45l88.825,88.825c2.887,2.885,7.564,2.885,10.45,0
	l67.924-67.925C351.289,405.736,351.29,401.059,348.403,398.172z M298.767,416.459c-7.214-7.213-7.216-18.911,0-26.124
	c7.213-7.216,18.911-7.214,26.125,0c7.214,7.213,7.214,18.911,0.001,26.124C317.678,423.674,305.98,423.672,298.767,416.459z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M195.376,590.728l88.825-88.823
	c2.884-2.886,2.885-7.564,0-10.45l-67.924-67.925c-2.885-2.885-7.564-2.885-10.45,0l-88.825,88.823
	c-2.887,2.889-2.885,7.564,0,10.45l67.924,67.925C187.812,593.613,192.489,593.614,195.376,590.728z M177.088,541.092
	c7.213-7.215,18.911-7.217,26.125,0c7.215,7.212,7.213,18.911,0,26.123c-7.213,7.215-18.911,7.215-26.125,0.003
	C169.874,560.003,169.875,548.304,177.088,541.092z"/>
<g>
	<path fill="#B5BCC9" d="M349.54,335.219c0.349-0.688,0.819-1.266,1.414-1.738c0.595-0.471,1.276-0.83,2.045-1.076
		c0.77-0.246,1.573-0.369,2.414-0.369c1.188,0,2.204,0.16,3.045,0.477c0.84,0.318,1.521,0.738,2.044,1.262
		c0.523,0.521,0.907,1.117,1.153,1.783s0.369,1.348,0.369,2.045c0,0.984-0.271,1.881-0.814,2.691
		c-0.544,0.809-1.276,1.418-2.199,1.828c1.312,0.41,2.286,1.082,2.922,2.016c0.635,0.932,0.953,2.074,0.953,3.428
		c0,1.066-0.19,2.01-0.569,2.828c-0.379,0.82-0.892,1.514-1.537,2.076c-0.646,0.564-1.41,0.99-2.291,1.277
		c-0.882,0.285-1.825,0.43-2.829,0.43c-1.045,0-2.02-0.133-2.921-0.4c-0.902-0.266-1.687-0.676-2.353-1.229
		c-0.666-0.555-1.189-1.246-1.568-2.076c-0.38-0.83-0.568-1.799-0.568-2.906c0-1.291,0.327-2.414,0.983-3.367s1.6-1.645,2.829-2.076
		c-0.923-0.369-1.66-0.969-2.214-1.799s-0.83-1.736-0.83-2.721C349.018,336.699,349.191,335.906,349.54,335.219z M352.323,350.777
		c0.871,0.748,1.983,1.123,3.336,1.123c0.656,0,1.256-0.107,1.799-0.322c0.543-0.217,1.015-0.514,1.415-0.893
		c0.399-0.379,0.707-0.824,0.922-1.338c0.216-0.512,0.323-1.076,0.323-1.691c0-0.594-0.118-1.143-0.354-1.645
		c-0.236-0.502-0.559-0.938-0.969-1.307s-0.887-0.662-1.43-0.877c-0.544-0.215-1.123-0.322-1.737-0.322
		c-0.636,0-1.235,0.098-1.799,0.291c-0.564,0.195-1.057,0.477-1.477,0.846s-0.748,0.811-0.983,1.322
		c-0.236,0.514-0.354,1.088-0.354,1.723C351.016,349,351.451,350.029,352.323,350.777z M352.093,339.246
		c0.204,0.441,0.481,0.805,0.83,1.092c0.348,0.287,0.758,0.502,1.229,0.646c0.472,0.143,0.974,0.215,1.507,0.215
		c1.046,0,1.906-0.307,2.583-0.922s1.015-1.477,1.015-2.584s-0.344-1.941-1.03-2.506s-1.563-0.846-2.629-0.846
		c-0.513,0-1.005,0.072-1.476,0.215c-0.472,0.145-0.877,0.359-1.215,0.646s-0.61,0.635-0.814,1.045
		c-0.206,0.41-0.308,0.893-0.308,1.445C351.785,338.289,351.887,338.807,352.093,339.246z"/>
</g>
</svg>

				<h1>Rotations</h1>
				The number of rotations to try when inserting a part. For example, if 8 rotations are used some parts will have a 45 degree angle. 4 rotations is generally enough, and ensures that common lines are easily merged for rectangular parts. Higher rotations may help if you have extremely irregular parts.
			</div>
			
			<div class="config_explain" id="explain_placementType">
<svg version="1.1" style="width: 155%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="798px" height="332px" viewBox="0 0 798 332" enable-background="new 0 0 798 332" xml:space="preserve">
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="72.118" y1="148.737" x2="120.658" y2="148.737"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="72.118" y1="148.737" x2="81.073" y2="157.692"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="72.118" y1="148.737" x2="80.928" y2="139.927"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M4.072,38.978v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.72,3.839-3.839V38.978c0-2.121-1.719-3.839-3.839-3.839H7.911
	C5.791,35.139,4.072,36.857,4.072,38.978z M29.025,50.495c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C24.729,40.897,29.025,45.195,29.025,50.495z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M4.072,112.202v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.719,3.839-3.839v-65.262c0-2.12-1.719-3.839-3.839-3.839H7.911
	C5.791,108.363,4.072,110.082,4.072,112.202z M29.025,123.718c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C24.729,114.121,29.025,118.418,29.025,123.718z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M4.072,185.141v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.719,3.839-3.839v-65.262c0-2.12-1.719-3.839-3.839-3.839H7.911
	C5.791,181.302,4.072,183.021,4.072,185.141z M29.025,196.658c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C24.729,187.06,29.025,191.358,29.025,196.658z"/>
<rect x="3" y="35.139" fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" width="227.341" height="227.341"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="61.655" y1="4.943" x2="61.655" y2="292.676"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="404.188" y1="99.767" x2="452.729" y2="99.767"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="404.188" y1="99.767" x2="413.143" y2="108.722"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="404.188" y1="99.767" x2="412.998" y2="90.956"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="335.812" y1="179.864" x2="335.812" y2="228.405"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="335.812" y1="179.864" x2="326.857" y2="188.819"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="335.812" y1="179.864" x2="344.621" y2="188.675"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M278.156,38.978v65.262
	c0,2.119,1.719,3.84,3.839,3.84H331.9c2.119,0,3.838-1.721,3.838-3.84V38.978c0-2.121-1.719-3.838-3.838-3.838h-49.906
	C279.875,35.14,278.156,36.856,278.156,38.978z M303.109,50.495c0,5.299-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.299-9.598-9.598
	c0-5.301,4.298-9.598,9.598-9.598C298.812,40.897,303.109,45.194,303.109,50.495z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M347.256,108.009h-65.261
	c-2.119,0-3.839,1.719-3.839,3.838v49.906c0,2.119,1.719,3.838,3.839,3.838h65.261c2.121,0,3.84-1.719,3.84-3.838v-49.906
	C351.096,109.728,349.377,108.009,347.256,108.009z M335.74,132.962c-5.301,0-9.598-4.297-9.598-9.598s4.297-9.598,9.598-9.598
	c5.299,0,9.598,4.297,9.598,9.598S341.039,132.962,335.74,132.962z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M335.738,38.978v65.262
	c0,2.119,1.719,3.84,3.84,3.84h49.904c2.121,0,3.84-1.719,3.84-3.84V38.978c0-2.119-1.719-3.838-3.84-3.838h-49.904
	C337.457,35.14,335.738,36.858,335.738,38.978z M360.691,50.495c0,5.299-4.297,9.598-9.598,9.598c-5.299,0-9.598-4.299-9.598-9.598
	c0-5.301,4.299-9.598,9.598-9.598C356.395,40.897,360.691,45.194,360.691,50.495z"/>
<rect x="277.083" y="35.14" fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" width="227.34" height="227.34"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="393.322" y1="4.943" x2="393.322" y2="165.591"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="393.322" y1="165.591" x2="246.886" y2="165.591"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="754.389" y1="151.669" x2="778.658" y2="151.669"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="754.389" y1="151.669" x2="763.344" y2="160.624"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="754.389" y1="151.669" x2="763.199" y2="142.858"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="709.762" y1="201.034" x2="709.762" y2="226.044"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="709.762" y1="201.034" x2="700.807" y2="209.989"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="709.762" y1="201.034" x2="718.572" y2="209.845"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="617.586" y1="163.993" x2="602.828" y2="184.185"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="617.586" y1="163.993" x2="605.072" y2="165.94"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="617.586" y1="163.993" x2="619.5" y2="176.306"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="688.625" y1="66.548" x2="703.383" y2="46.356"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="688.625" y1="66.548" x2="701.139" y2="64.603"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="688.625" y1="66.548" x2="686.711" y2="54.237"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="592.014" y1="25.042" x2="592.014" y2="0.034"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="592.014" y1="25.042" x2="600.969" y2="16.087"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="592.014" y1="25.042" x2="583.205" y2="16.233"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="550.736" y1="70.962" x2="525.727" y2="70.962"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="550.736" y1="70.962" x2="541.781" y2="62.007"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="550.736" y1="70.962" x2="541.926" y2="79.771"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M565.73,40.429v65.262c0,2.119,1.719,3.84,3.84,3.84
	h49.904c2.121,0,3.84-1.721,3.84-3.84V40.429c0-2.121-1.719-3.838-3.84-3.838H569.57C567.449,36.591,565.73,38.308,565.73,40.429z
	 M590.684,51.946c0,5.299-4.297,9.598-9.598,9.598c-5.299,0-9.598-4.299-9.598-9.598c0-5.301,4.299-9.598,9.598-9.598
	C586.387,42.349,590.684,46.646,590.684,51.946z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M680.896,119.108v65.262
	c0,2.119,1.719,3.84,3.84,3.84h49.904c2.121,0,3.84-1.719,3.84-3.84v-65.262c0-2.119-1.719-3.838-3.84-3.838h-49.904
	C682.615,115.271,680.896,116.989,680.896,119.108z M705.85,130.626c0,5.299-4.297,9.598-9.598,9.598
	c-5.299,0-9.598-4.299-9.598-9.598c0-5.301,4.299-9.598,9.598-9.598C701.553,121.028,705.85,125.325,705.85,130.626z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M623.314,79.64v65.262
	c0,2.119,1.719,3.84,3.838,3.84h49.906c2.119,0,3.838-1.719,3.838-3.84V79.64c0-2.119-1.719-3.838-3.838-3.838h-49.906
	C625.033,75.802,623.314,77.521,623.314,79.64z M648.268,91.157c0,5.299-4.297,9.598-9.598,9.598s-9.598-4.299-9.598-9.598
	c0-5.301,4.297-9.598,9.598-9.598S648.268,85.856,648.268,91.157z"/>
<rect x="564.658" y="36.591" fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" width="227.342" height="227.34"/>
<polygon fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" points="623.314,36.591 738.48,115.271 
	738.48,190.126 680.896,188.21 565.73,110.173 565.73,36.591 "/>
<g>
	<path fill="#EC2158" d="M114.187,303.34v-15.621h-5.658v-2.091c0.738,0,1.456-0.057,2.153-0.169
		c0.696-0.112,1.327-0.323,1.891-0.631s1.04-0.728,1.43-1.261c0.39-0.532,0.656-1.209,0.8-2.029h1.999v21.802H114.187z"/>
</g>
<g>
	<path fill="#EC2158" d="M675.31,293.636c0.103,0,0.204,0,0.308,0h0.553c0.554,0,1.081-0.078,1.584-0.23
		c0.502-0.154,0.942-0.381,1.322-0.678c0.379-0.297,0.682-0.67,0.907-1.121s0.338-0.965,0.338-1.539
		c0-1.168-0.369-2.045-1.106-2.629c-0.738-0.584-1.661-0.875-2.768-0.875c-0.697,0-1.307,0.127-1.83,0.383
		c-0.522,0.258-0.953,0.6-1.291,1.031c-0.339,0.43-0.59,0.934-0.754,1.506c-0.164,0.574-0.246,1.18-0.246,1.814h-2.613
		c0.041-1.045,0.21-1.998,0.508-2.859c0.297-0.861,0.722-1.6,1.275-2.215s1.246-1.096,2.076-1.445
		c0.83-0.348,1.788-0.521,2.875-0.521c0.942,0,1.819,0.117,2.629,0.354s1.512,0.59,2.106,1.061c0.595,0.473,1.061,1.076,1.399,1.814
		c0.338,0.738,0.507,1.609,0.507,2.613c0,0.984-0.287,1.855-0.86,2.613c-0.574,0.76-1.292,1.334-2.153,1.723v0.062
		c1.333,0.287,2.322,0.912,2.968,1.875s0.969,2.102,0.969,3.412c0,1.088-0.2,2.045-0.6,2.877c-0.399,0.83-0.938,1.521-1.614,2.074
		c-0.677,0.555-1.472,0.969-2.384,1.246s-1.881,0.414-2.905,0.414c-1.107,0-2.112-0.152-3.014-0.461
		c-0.902-0.307-1.671-0.764-2.307-1.367c-0.636-0.605-1.122-1.348-1.46-2.23c-0.339-0.881-0.498-1.885-0.477-3.014h2.613
		c0.041,1.416,0.451,2.568,1.23,3.461c0.778,0.891,1.916,1.336,3.413,1.336c0.635,0,1.24-0.096,1.814-0.291
		c0.573-0.195,1.076-0.473,1.507-0.83c0.43-0.359,0.773-0.801,1.029-1.322c0.257-0.523,0.385-1.113,0.385-1.77
		c0-0.676-0.123-1.275-0.369-1.799c-0.246-0.521-0.574-0.963-0.984-1.322c-0.41-0.357-0.896-0.625-1.46-0.799
		c-0.564-0.174-1.174-0.262-1.83-0.262c-0.554,0-1.076,0.031-1.568,0.092v-2.213C675.135,293.626,675.228,293.636,675.31,293.636z"
		/>
</g>
<g>
	<path fill="#EC2158" d="M385.517,286.182c0.287-0.943,0.732-1.758,1.338-2.445c0.604-0.687,1.357-1.225,2.26-1.614
		c0.901-0.389,1.927-0.584,3.075-0.584c0.942,0,1.829,0.139,2.659,0.415c0.831,0.276,1.554,0.677,2.168,1.199
		c0.615,0.522,1.103,1.174,1.461,1.953s0.538,1.681,0.538,2.706c0,0.964-0.148,1.813-0.446,2.552
		c-0.297,0.738-0.691,1.399-1.184,1.983s-1.056,1.112-1.691,1.584s-1.291,0.922-1.968,1.353c-0.677,0.41-1.353,0.815-2.029,1.215
		s-1.297,0.825-1.86,1.276c-0.564,0.451-1.046,0.938-1.445,1.46c-0.399,0.523-0.661,1.123-0.784,1.799h11.193v2.307h-14.237
		c0.103-1.291,0.333-2.394,0.691-3.306s0.815-1.707,1.368-2.383c0.554-0.677,1.179-1.271,1.876-1.784
		c0.697-0.512,1.425-0.994,2.184-1.445c0.922-0.573,1.731-1.102,2.429-1.583s1.276-0.969,1.737-1.461
		c0.462-0.492,0.81-1.024,1.046-1.599c0.235-0.574,0.354-1.24,0.354-1.999c0-0.595-0.112-1.133-0.338-1.614
		s-0.528-0.896-0.907-1.245c-0.38-0.349-0.825-0.615-1.338-0.8s-1.056-0.276-1.63-0.276c-0.759,0-1.409,0.158-1.952,0.477
		c-0.544,0.317-0.989,0.732-1.338,1.245s-0.6,1.092-0.753,1.737c-0.154,0.646-0.221,1.297-0.2,1.952h-2.614
		C385.116,288.15,385.229,287.125,385.517,286.182z"/>
</g>
</svg>

				<h2>1. Gravity</h2>
				Minimize the <em>width</em> of the nest. It's good for when you have a rectangular sheet and wish to use the left overs for another cut.
			
				<h2>2. Bounding Box</h2>
				Reduce the overall <em>rectangular bounds</em>. This mode is best for conserving material when only a small portion of the sheet is used.
				

				<h2>3. Squeeze</h2>
				Reduce the overall <em>area</em>, but may produce nests that aren't rectangular. It is best used for irregularly shaped sheets, or when all sheets will be filled with no space left behind.
			</div>
			
			<div class="config_explain" id="explain_threads">
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="454.586px" height="195.099px" viewBox="0 0 454.586 195.099" enable-background="new 0 0 454.586 195.099"
	 xml:space="preserve">
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M85.843,68.843c0,9.941-8.06,18-18,18H22
	c-9.941,0-18-8.059-18-18V23c0-9.941,8.059-18,18-18h45.843c9.94,0,18,8.059,18,18V68.843z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M183.058,68.843c0,9.941-8.06,18-18,18h-45.843
	c-9.941,0-18-8.059-18-18V23c0-9.941,8.059-18,18-18h45.843c9.94,0,18,8.059,18,18V68.843z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M182.257,166.843c0,9.941-8.06,18-18,18h-45.843
	c-9.941,0-18-8.059-18-18V121c0-9.941,8.059-18,18-18h45.843c9.94,0,18,8.059,18,18V166.843z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M279.472,166.843c0,9.941-8.06,18-18,18h-45.843
	c-9.941,0-18-8.059-18-18V121c0-9.941,8.059-18,18-18h45.843c9.94,0,18,8.059,18,18V166.843z"/>
</svg>


				<h1>CPU Cores</h1>
				The number of concurrent nesting processes. 2 for most laptops and 4 for most desktops.
			</div>
			
			<div class="config_explain" id="explain_mergeLines">
			
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="441px" height="350px" viewBox="0 0 441 350" enable-background="new 0 0 441 350" xml:space="preserve">
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M216.674,13.299C216.674,7.06,211.616,2,205.376,2
	H13.299C7.06,2,2,7.059,2,13.299v146.88c0,6.24,5.059,11.299,11.299,11.299 M205.376,171.479c6.24,0,11.298-5.059,11.298-11.299
	 M171.48,75.44c-15.599,0-28.247-12.646-28.247-28.246c0-15.601,12.648-28.247,28.247-28.247c15.6,0,28.247,12.646,28.247,28.247
	C199.727,62.794,187.08,75.44,171.48,75.44z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M216.674,160.18c0,6.24,5.059,11.299,11.3,11.299
	 M420.05,171.479c6.24,0,11.298-5.059,11.298-11.299V13.299C431.348,7.06,426.29,2,420.05,2H227.974c-6.24,0-11.3,5.059-11.3,11.299
	 M386.154,75.44c-15.6,0-28.247-12.646-28.247-28.246c0-15.601,12.647-28.247,28.247-28.247s28.247,12.646,28.247,28.247
	C414.401,62.794,401.754,75.44,386.154,75.44z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M216.674,182.334c0-6.24-5.058-11.3-11.298-11.3
	 M13.299,171.034c-6.24,0-11.299,5.059-11.299,11.3v146.88c0,6.24,5.059,11.299,11.299,11.299h192.077
	c6.24,0,11.298-5.059,11.298-11.299 M171.48,244.475c-15.599,0-28.247-12.646-28.247-28.246c0-15.601,12.648-28.247,28.247-28.247
	c15.6,0,28.247,12.646,28.247,28.247C199.727,231.829,187.08,244.475,171.48,244.475z"/>
<path fill="none" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M216.674,329.214c0,6.24,5.059,11.299,11.3,11.299
	H420.05c6.24,0,11.298-5.059,11.298-11.299v-146.88c0-6.24-5.058-11.3-11.298-11.3 M227.974,171.034c-6.24,0-11.3,5.059-11.3,11.3
	 M386.154,244.475c-15.6,0-28.247-12.646-28.247-28.246c0-15.601,12.647-28.247,28.247-28.247s28.247,12.646,28.247,28.247
	C414.401,231.829,401.754,244.475,386.154,244.475z"/>
<g>
	<g>
		
			<line fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="216.674" y1="13.299" x2="216.674" y2="15.799"/>
	</g>
	<g>
		<path fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M216.674,147.895v4.893 M216.674,138.11v4.892
			 M216.674,128.325v4.893 M216.674,118.541v4.893 M216.674,108.755v4.893 M216.674,98.971v4.893 M216.674,89.186v4.892
			 M216.674,79.401v4.893 M216.674,69.616v4.893 M216.674,59.832v4.892 M216.674,50.046v4.893 M216.674,40.262v4.892
			 M216.674,30.477v4.893 M216.674,20.692v4.893"/>
	</g>
	<g>
		
			<line fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="216.674" y1="157.68" x2="216.674" y2="160.18"/>
	</g>
</g>
<g>
	<g>
		
			<line fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="216.674" y1="182.436" x2="216.674" y2="184.936"/>
	</g>
	<g>
		<path fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M216.674,317.032v4.893 M216.674,307.247v4.892
			 M216.674,297.462v4.893 M216.674,287.677v4.893 M216.674,277.892v4.893 M216.674,268.107V273 M216.674,258.323v4.892
			 M216.674,248.538v4.893 M216.674,238.753v4.893 M216.674,228.968v4.892 M216.674,219.183v4.893 M216.674,209.398v4.892
			 M216.674,199.613v4.893 M216.674,189.829v4.893"/>
	</g>
	<g>
		
			<line fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="216.674" y1="326.816" x2="216.674" y2="329.316"/>
	</g>
</g>
<g>
	<g>
		
			<line fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="417.55" y1="171.034" x2="420.05" y2="171.034"/>
	</g>
	<g>
		<path fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M407.438,171.034h5.056 M397.326,171.034h5.056
			 M387.214,171.034h5.056 M377.102,171.034h5.056 M366.989,171.034h5.056 M356.877,171.034h5.056 M346.765,171.034h5.056
			 M336.652,171.034h5.056 M326.54,171.034h5.056 M316.428,171.034h5.056 M306.316,171.034h5.056 M296.204,171.034h5.056
			 M286.091,171.034h5.056 M275.979,171.034h5.056 M265.867,171.034h5.056 M255.755,171.034h5.056 M245.643,171.034h5.056
			 M235.53,171.034h5.056"/>
	</g>
	<g>
		
			<line fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="227.974" y1="171.034" x2="230.474" y2="171.034"/>
	</g>
</g>
<g>
	<g>
		
			<line fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="203.073" y1="171.034" x2="205.573" y2="171.034"/>
	</g>
	<g>
		<path fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" d="M192.961,171.034h5.056 M182.849,171.034h5.056
			 M172.737,171.034h5.056 M162.625,171.034h5.056 M152.512,171.034h5.056 M142.4,171.034h5.056 M132.288,171.034h5.056
			 M122.175,171.034h5.056 M112.063,171.034h5.056 M101.951,171.034h5.056 M91.839,171.034h5.056 M81.727,171.034h5.056
			 M71.614,171.034h5.056 M61.502,171.034h5.056 M51.39,171.034h5.056 M41.278,171.034h5.056 M31.166,171.034h5.056 M21.053,171.034
			h5.056"/>
	</g>
	<g>
		
			<line fill="#B5BCC9" stroke="#B5BCC9" stroke-width="2" stroke-miterlimit="10" x1="13.497" y1="171.034" x2="15.997" y2="171.034"/>
	</g>
</g>
</svg>

				<h1>Merge common lines</h1>
				If set, part edges that touch will be merged into a single line in the export. Merging common lines ensure that the laser only passes over each line a single time, reducing cut time and heat warping.
			</div>
			
			<div class="config_explain" id="explain_timeRatio">
			
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="517px" height="301px" viewBox="0 0 517 301" enable-background="new 0 0 517 301" xml:space="preserve">
<g>
	<path fill="#EC2158" d="M112.271,268.462c0.041-0.861,0.144-1.702,0.308-2.521c0.164-0.82,0.4-1.6,0.708-2.337
		c0.307-0.738,0.727-1.384,1.261-1.938c0.532-0.554,1.204-0.994,2.014-1.322s1.778-0.492,2.906-0.492
		c1.127,0,2.096,0.164,2.905,0.492s1.481,0.769,2.015,1.322c0.532,0.554,0.953,1.199,1.261,1.938
		c0.308,0.737,0.543,1.517,0.707,2.337c0.164,0.819,0.267,1.66,0.308,2.521c0.041,0.86,0.062,1.69,0.062,2.49
		s-0.021,1.63-0.062,2.491c-0.041,0.86-0.144,1.701-0.308,2.521s-0.399,1.594-0.707,2.321s-0.729,1.368-1.261,1.922
		c-0.533,0.554-1.199,0.989-1.999,1.307c-0.8,0.318-1.773,0.477-2.921,0.477c-1.128,0-2.097-0.158-2.906-0.477
		c-0.81-0.317-1.481-0.753-2.014-1.307c-0.534-0.554-0.954-1.194-1.261-1.922c-0.308-0.728-0.544-1.501-0.708-2.321
		s-0.267-1.661-0.308-2.521c-0.041-0.861-0.062-1.691-0.062-2.491S112.229,269.322,112.271,268.462z M115.054,273.674
		c0.051,1.015,0.216,1.968,0.492,2.859s0.723,1.646,1.338,2.261c0.614,0.614,1.476,0.922,2.583,0.922
		c1.106,0,1.968-0.308,2.583-0.922c0.614-0.615,1.061-1.369,1.337-2.261c0.277-0.892,0.441-1.845,0.492-2.859
		s0.077-1.932,0.077-2.752c0-0.533-0.005-1.123-0.016-1.769s-0.062-1.291-0.153-1.938c-0.093-0.646-0.227-1.275-0.4-1.891
		s-0.43-1.153-0.769-1.614c-0.338-0.462-0.764-0.835-1.276-1.123c-0.513-0.286-1.138-0.43-1.875-0.43
		c-0.738,0-1.364,0.144-1.876,0.43c-0.513,0.288-0.938,0.661-1.276,1.123c-0.338,0.461-0.595,0.999-0.769,1.614
		c-0.175,0.615-0.308,1.245-0.399,1.891c-0.093,0.646-0.145,1.292-0.154,1.938c-0.011,0.646-0.016,1.235-0.016,1.769
		C114.977,271.742,115.002,272.659,115.054,273.674z"/>
</g>
<g>
	<path fill="#EC2158" d="M385.819,281.653v-15.621h-5.658v-2.091c0.738,0,1.456-0.057,2.153-0.169
		c0.696-0.112,1.327-0.323,1.891-0.631s1.04-0.728,1.43-1.261c0.39-0.532,0.656-1.209,0.8-2.029h1.999v21.802H385.819z"/>
</g>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M276.737,8.839v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.72,3.839-3.839V8.839c0-2.121-1.719-3.839-3.839-3.839h-49.905
	C278.456,5,276.737,6.718,276.737,8.839z M301.69,20.355c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C297.394,10.758,301.69,15.056,301.69,20.355z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M334.32,8.839v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.719,3.839-3.839V8.839c0-2.12-1.719-3.839-3.839-3.839h-49.905
	C336.039,5,334.32,6.719,334.32,8.839z M359.273,20.355c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C354.977,10.758,359.273,15.056,359.273,20.355z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M276.737,81.839v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.72,3.839-3.839V81.839c0-2.121-1.719-3.839-3.839-3.839h-49.905
	C278.456,78,276.737,79.718,276.737,81.839z M301.69,93.355c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C297.394,83.758,301.69,88.056,301.69,93.355z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M334.32,81.839v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.72,3.839-3.839V81.839c0-2.121-1.719-3.839-3.839-3.839h-49.905
	C336.039,78,334.32,79.718,334.32,81.839z M359.273,93.355c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C354.977,83.758,359.273,88.056,359.273,93.355z"/>
<rect x="275.665" y="5" fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" width="227.341" height="227.341"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M6.066,8.839v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.72,3.839-3.839V8.839C63.649,6.718,61.931,5,59.811,5H9.905
	C7.785,5,6.066,6.718,6.066,8.839z M31.02,20.355c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C26.723,10.758,31.02,15.056,31.02,20.355z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M6.066,81.839v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.72,3.839-3.839V81.839c0-2.121-1.719-3.839-3.839-3.839H9.905
	C7.785,78,6.066,79.718,6.066,81.839z M31.02,93.355c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C26.723,83.758,31.02,88.056,31.02,93.355z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M63.649,8.839v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.72,3.839-3.839V8.839c0-2.121-1.719-3.839-3.839-3.839H67.488
	C65.368,5,63.649,6.718,63.649,8.839z M88.603,20.355c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C84.306,10.758,88.603,15.056,88.603,20.355z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M6.066,154.839v65.262
	c0,2.119,1.719,3.839,3.839,3.839h49.905c2.12,0,3.839-1.72,3.839-3.839v-65.262c0-2.121-1.719-3.839-3.839-3.839H9.905
	C7.785,151,6.066,152.718,6.066,154.839z M31.02,166.355c0,5.3-4.297,9.598-9.598,9.598c-5.3,0-9.598-4.298-9.598-9.598
	s4.298-9.598,9.598-9.598C26.723,156.758,31.02,161.056,31.02,166.355z"/>
<rect x="4.994" y="5" fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" width="227.341" height="227.341"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="334.32" y1="5" x2="334.32" y2="151"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="63.649" y1="5" x2="63.649" y2="78.196"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="391.903" y1="78" x2="276.737" y2="78"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="63.649" y1="78" x2="6.066" y2="78"/>
<line fill="none" stroke="#EC2158" stroke-width="2" stroke-miterlimit="10" x1="63.649" y1="150.804" x2="6.066" y2="150.804"/>
</svg>
				<h1>Optimization ratio</h1>
				When placing each part, the program has to decide between whether saving time or material is more important. When the optimization ratio is 0, only material savings are considered. When the ratio is 1, time savings are considered as important as material savings.
			</div>
			
			<div class="config_explain" id="explain_populationSize">
			
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="471.085px" height="514.583px" viewBox="0 0 471.085 514.583" enable-background="new 0 0 471.085 514.583"
	 xml:space="preserve">
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M158.493,247.101v20.722
	c0,0.671,0.546,1.219,1.218,1.219h15.846c0.674,0,1.219-0.546,1.219-1.219v-20.722c0-0.674-0.545-1.219-1.219-1.219h-15.846
	C159.039,245.881,158.493,246.427,158.493,247.101z M166.416,250.757c0,1.683-1.365,3.046-3.047,3.046
	c-1.683,0-3.046-1.363-3.046-3.046c0-1.682,1.363-3.047,3.046-3.047C165.05,247.709,166.416,249.075,166.416,250.757z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M198.79,250.758h-20.72
	c-0.673,0-1.219,0.544-1.219,1.216v15.848c0,0.673,0.546,1.219,1.219,1.219h20.72c0.674,0,1.219-0.546,1.219-1.219v-15.848
	C200.009,251.302,199.464,250.758,198.79,250.758z M195.133,258.68c-1.683,0-3.047-1.366-3.047-3.047
	c0-1.683,1.364-3.047,3.047-3.047c1.684,0,3.048,1.364,3.048,3.047C198.181,257.314,196.817,258.68,195.133,258.68z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M149.135,40.52h-20.72
	c-0.674,0-1.219,0.544-1.219,1.218v15.846c0,0.673,0.545,1.219,1.219,1.219h20.72c0.674,0,1.22-0.546,1.22-1.219V41.738
	C150.355,41.064,149.81,40.52,149.135,40.52z M145.479,48.443c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S147.162,48.443,145.479,48.443z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M172.16,40.52h-20.72
	c-0.674,0-1.22,0.544-1.22,1.218v15.846c0,0.673,0.546,1.219,1.22,1.219h20.72c0.674,0,1.22-0.546,1.22-1.219V41.738
	C173.38,41.064,172.834,40.52,172.16,40.52z M168.504,48.443c-1.683,0-3.048-1.364-3.048-3.047s1.365-3.047,3.048-3.047
	c1.682,0,3.046,1.364,3.046,3.047S170.186,48.443,168.504,48.443z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M149.135,21.981h-20.72
	c-0.674,0-1.219,0.544-1.219,1.218v15.846c0,0.673,0.545,1.22,1.219,1.22h20.72c0.674,0,1.22-0.547,1.22-1.22V23.199
	C150.355,22.525,149.81,21.981,149.135,21.981z M145.479,29.903c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S147.162,29.903,145.479,29.903z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M172.16,21.981h-20.72
	c-0.674,0-1.22,0.544-1.22,1.218v15.846c0,0.673,0.546,1.22,1.22,1.22h20.72c0.674,0,1.22-0.547,1.22-1.22V23.199
	C173.38,22.525,172.834,21.981,172.16,21.981z M168.504,29.903c-1.683,0-3.048-1.364-3.048-3.047s1.365-3.047,3.048-3.047
	c1.682,0,3.046,1.364,3.046,3.047S170.186,29.903,168.504,29.903z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M117.225,94.942h-20.72
	c-0.674,0-1.219,0.544-1.219,1.218v15.846c0,0.673,0.545,1.22,1.219,1.22h20.72c0.674,0,1.22-0.547,1.22-1.22V96.161
	C118.445,95.487,117.899,94.942,117.225,94.942z M113.569,102.865c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S115.251,102.865,113.569,102.865z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M140.25,94.942h-20.72
	c-0.674,0-1.22,0.544-1.22,1.218v15.846c0,0.673,0.546,1.22,1.22,1.22h20.72c0.674,0,1.22-0.547,1.22-1.22V96.161
	C141.47,95.487,140.924,94.942,140.25,94.942z M136.594,102.865c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.047,1.364,3.047,3.047S138.276,102.865,136.594,102.865z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M117.225,76.403h-20.72
	c-0.674,0-1.219,0.544-1.219,1.218v15.846c0,0.673,0.545,1.22,1.219,1.22h20.72c0.674,0,1.22-0.546,1.22-1.22V77.621
	C118.445,76.947,117.899,76.403,117.225,76.403z M113.569,84.326c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S115.251,84.326,113.569,84.326z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M117.091,113.226h-20.72
	c-0.674,0-1.219,0.544-1.219,1.218v15.846c0,0.673,0.545,1.22,1.219,1.22h20.72c0.674,0,1.219-0.547,1.219-1.22v-15.846
	C118.31,113.77,117.765,113.226,117.091,113.226z M113.435,121.149c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S115.117,121.149,113.435,121.149z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M187.308,99.727h-20.72
	c-0.674,0-1.22,0.544-1.22,1.218v15.846c0,0.673,0.546,1.219,1.22,1.219h20.72c0.674,0,1.219-0.546,1.219-1.219v-15.846
	C188.527,100.271,187.981,99.727,187.308,99.727z M183.651,107.649c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S185.333,107.649,183.651,107.649z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M210.333,118.01h-20.72
	c-0.674,0-1.22,0.544-1.22,1.218v15.846c0,0.673,0.545,1.22,1.22,1.22h20.72c0.674,0,1.219-0.546,1.219-1.22v-15.846
	C211.552,118.555,211.007,118.01,210.333,118.01z M206.676,125.933c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S208.358,125.933,206.676,125.933z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M187.308,81.188h-20.72
	c-0.674,0-1.22,0.544-1.22,1.218v15.846c0,0.673,0.546,1.22,1.22,1.22h20.72c0.674,0,1.219-0.547,1.219-1.22V82.405
	C188.527,81.731,187.981,81.188,187.308,81.188z M183.651,89.11c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S185.333,89.11,183.651,89.11z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M187.173,118.01h-20.72
	c-0.674,0-1.22,0.544-1.22,1.218v15.846c0,0.673,0.546,1.22,1.22,1.22h20.72c0.674,0,1.22-0.546,1.22-1.22v-15.846
	C188.393,118.555,187.847,118.01,187.173,118.01z M183.518,125.933c-1.684,0-3.048-1.364-3.048-3.047s1.364-3.047,3.048-3.047
	c1.682,0,3.046,1.364,3.046,3.047S185.199,125.933,183.518,125.933z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M90.543,287.625h-20.72
	c-0.674,0-1.22,0.545-1.22,1.219v15.846c0,0.673,0.545,1.219,1.22,1.219h20.72c0.674,0,1.219-0.546,1.219-1.219v-15.846
	C91.763,288.17,91.217,287.625,90.543,287.625z M86.887,295.548c-1.683,0-3.047-1.365-3.047-3.048s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S88.569,295.548,86.887,295.548z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M113.568,287.625h-20.72
	c-0.674,0-1.22,0.545-1.22,1.219v15.846c0,0.673,0.545,1.219,1.22,1.219h20.72c0.674,0,1.22-0.546,1.22-1.219v-15.846
	C114.788,288.17,114.242,287.625,113.568,287.625z M109.912,295.548c-1.683,0-3.047-1.365-3.047-3.048s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S111.594,295.548,109.912,295.548z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M90.543,269.086h-20.72
	c-0.674,0-1.22,0.544-1.22,1.219v15.846c0,0.672,0.545,1.22,1.22,1.22h20.72c0.674,0,1.219-0.547,1.219-1.22v-15.846
	C91.763,269.63,91.217,269.086,90.543,269.086z M86.887,277.009c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S88.569,277.009,86.887,277.009z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M113.568,269.086h-20.72
	c-0.674,0-1.22,0.544-1.22,1.219v15.846c0,0.672,0.545,1.22,1.22,1.22h20.72c0.674,0,1.22-0.547,1.22-1.22v-15.846
	C114.788,269.63,114.242,269.086,113.568,269.086z M109.912,277.009c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S111.594,277.009,109.912,277.009z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M58.633,342.048h-20.72
	c-0.674,0-1.22,0.544-1.22,1.218v15.846c0,0.673,0.545,1.219,1.22,1.219h20.72c0.673,0,1.219-0.546,1.219-1.219v-15.846
	C59.853,342.592,59.307,342.048,58.633,342.048z M54.977,349.971c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.048,3.047-3.048
	c1.682,0,3.046,1.365,3.046,3.048S56.659,349.971,54.977,349.971z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M81.658,342.048h-20.72
	c-0.674,0-1.22,0.544-1.22,1.218v15.846c0,0.673,0.545,1.219,1.22,1.219h20.72c0.674,0,1.22-0.546,1.22-1.219v-15.846
	C82.877,342.592,82.332,342.048,81.658,342.048z M78.002,349.971c-1.684,0-3.047-1.364-3.047-3.047s1.364-3.048,3.047-3.048
	c1.682,0,3.046,1.365,3.046,3.048S79.684,349.971,78.002,349.971z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M58.633,323.508h-20.72
	c-0.674,0-1.22,0.544-1.22,1.219v15.846c0,0.673,0.545,1.219,1.22,1.219h20.72c0.673,0,1.219-0.546,1.219-1.219v-15.846
	C59.853,324.052,59.307,323.508,58.633,323.508z M54.977,331.431c-1.683,0-3.047-1.364-3.047-3.047s1.364-3.047,3.047-3.047
	c1.682,0,3.046,1.364,3.046,3.047S56.659,331.431,54.977,331.431z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M58.499,360.331H37.778
	c-0.674,0-1.219,0.544-1.219,1.218v15.847c0,0.673,0.545,1.22,1.219,1.22h20.721c0.674,0,1.219-0.547,1.219-1.22v-15.847
	C59.718,360.875,59.173,360.331,58.499,360.331z M54.843,368.254c-1.684,0-3.048-1.364-3.048-3.047c0-1.684,1.364-3.048,3.048-3.048
	c1.682,0,3.046,1.364,3.046,3.048C57.889,366.89,56.524,368.254,54.843,368.254z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M128.715,346.832h-20.72
	c-0.674,0-1.219,0.544-1.219,1.218v15.846c0,0.673,0.545,1.219,1.219,1.219h20.72c0.674,0,1.219-0.546,1.219-1.219V348.05
	C129.935,347.376,129.389,346.832,128.715,346.832z M125.06,354.755c-1.684,0-3.048-1.364-3.048-3.048
	c0-1.683,1.364-3.047,3.048-3.047c1.682,0,3.046,1.364,3.046,3.047C128.105,353.391,126.741,354.755,125.06,354.755z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M151.74,365.115h-20.72
	c-0.674,0-1.219,0.545-1.219,1.22v15.846c0,0.672,0.545,1.219,1.219,1.219h20.72c0.674,0,1.219-0.547,1.219-1.219v-15.846
	C152.959,365.66,152.414,365.115,151.74,365.115z M148.084,373.038c-1.683,0-3.047-1.364-3.047-3.047
	c0-1.684,1.364-3.048,3.047-3.048c1.682,0,3.046,1.364,3.046,3.048C151.13,371.674,149.766,373.038,148.084,373.038z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M128.715,328.292h-20.72
	c-0.674,0-1.219,0.545-1.219,1.219v15.846c0,0.673,0.545,1.219,1.219,1.219h20.72c0.674,0,1.219-0.546,1.219-1.219v-15.846
	C129.935,328.837,129.389,328.292,128.715,328.292z M125.06,336.216c-1.684,0-3.048-1.364-3.048-3.048
	c0-1.683,1.364-3.047,3.048-3.047c1.682,0,3.046,1.364,3.046,3.047C128.105,334.852,126.741,336.216,125.06,336.216z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M128.581,365.115h-20.72
	c-0.674,0-1.219,0.545-1.219,1.22v15.846c0,0.672,0.545,1.219,1.219,1.219h20.72c0.674,0,1.22-0.547,1.22-1.219v-15.846
	C129.801,365.66,129.255,365.115,128.581,365.115z M124.925,373.038c-1.683,0-3.048-1.364-3.048-3.047
	c0-1.684,1.365-3.048,3.048-3.048c1.682,0,3.046,1.364,3.046,3.048C127.971,371.674,126.607,373.038,124.925,373.038z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M175.557,269.131h-20.72
	c-0.674,0-1.22,0.545-1.22,1.217v15.847c0,0.673,0.545,1.218,1.22,1.218h20.72c0.674,0,1.219-0.545,1.219-1.218v-15.847
	C176.776,269.677,176.231,269.131,175.557,269.131z M171.9,277.054c-1.684,0-3.046-1.365-3.046-3.048
	c0-1.683,1.363-3.046,3.046-3.046c1.683,0,3.047,1.363,3.047,3.046C174.947,275.688,173.583,277.054,171.9,277.054z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M195.132,291.071v-20.723
	c0-0.671-0.544-1.217-1.218-1.217h-15.845c-0.673,0-1.219,0.545-1.219,1.217v20.723c0,0.673,0.546,1.218,1.219,1.218h15.845
	C194.588,292.289,195.132,291.744,195.132,291.071z M187.21,287.414c0-1.683,1.363-3.048,3.046-3.048s3.047,1.365,3.047,3.048
	c0,1.683-1.364,3.047-3.047,3.047S187.21,289.096,187.21,287.414z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M181.652,327.837v20.721
	c0,0.671,0.546,1.219,1.218,1.219h15.846c0.674,0,1.22-0.546,1.22-1.219v-20.721c0-0.674-0.545-1.219-1.22-1.219H182.87
	C182.198,326.618,181.652,327.163,181.652,327.837z M189.575,331.493c0,1.683-1.365,3.046-3.047,3.046
	c-1.683,0-3.046-1.363-3.046-3.046c0-1.682,1.363-3.047,3.046-3.047C188.209,328.446,189.575,329.812,189.575,331.493z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M203.591,391.39h-20.72
	c-0.673,0-1.219,0.544-1.219,1.218v15.848c0,0.672,0.546,1.218,1.219,1.218h20.72c0.674,0,1.22-0.546,1.22-1.218v-15.848
	C204.811,391.934,204.266,391.39,203.591,391.39z M199.936,399.312c-1.683,0-3.047-1.365-3.047-3.048s1.364-3.047,3.047-3.047
	s3.047,1.364,3.047,3.047S201.619,399.312,199.936,399.312z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M198.716,349.867h-20.72
	c-0.674,0-1.219,0.545-1.219,1.218v15.847c0,0.673,0.545,1.218,1.219,1.218h20.72c0.674,0,1.22-0.545,1.22-1.218v-15.847
	C199.936,350.413,199.39,349.867,198.716,349.867z M195.059,357.79c-1.683,0-3.046-1.365-3.046-3.048
	c0-1.684,1.363-3.047,3.046-3.047c1.684,0,3.048,1.363,3.048,3.047C198.106,356.425,196.742,357.79,195.059,357.79z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M199.936,390.172v-20.723
	c0-0.671-0.544-1.218-1.218-1.218h-15.845c-0.673,0-1.22,0.545-1.22,1.218v20.723c0,0.673,0.547,1.218,1.22,1.218h15.845
	C199.391,391.39,199.936,390.845,199.936,390.172z M192.014,386.515c0-1.684,1.363-3.049,3.046-3.049s3.047,1.365,3.047,3.049
	c0,1.682-1.364,3.047-3.047,3.047S192.014,388.196,192.014,386.515z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M127.268,441.146h-20.721
	c-0.672,0-1.218,0.546-1.218,1.218v15.846c0,0.674,0.545,1.219,1.218,1.219h20.721c0.674,0,1.22-0.545,1.22-1.219v-15.846
	C128.488,441.692,127.942,441.146,127.268,441.146z M123.612,449.069c-1.683,0-3.046-1.365-3.046-3.048
	c0-1.684,1.363-3.047,3.046-3.047c1.682,0,3.047,1.363,3.047,3.047C126.66,447.704,125.294,449.069,123.612,449.069z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M86.965,444.802v-20.721
	c0-0.672-0.544-1.219-1.217-1.219H69.901c-0.673,0-1.218,0.547-1.218,1.219v20.721c0,0.674,0.545,1.22,1.218,1.22h15.847
	C86.421,446.021,86.965,445.476,86.965,444.802z M79.043,441.146c0-1.685,1.366-3.049,3.048-3.049c1.683,0,3.047,1.364,3.047,3.049
	c0,1.683-1.364,3.047-3.047,3.047C80.409,444.193,79.043,442.829,79.043,441.146z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M128.488,439.926v-20.72
	c0-0.674-0.544-1.22-1.217-1.22h-15.847c-0.673,0-1.218,0.546-1.218,1.22v20.72c0,0.674,0.545,1.221,1.218,1.221h15.847
	C127.942,441.146,128.488,440.6,128.488,439.926z M120.566,436.27c0-1.683,1.365-3.047,3.047-3.047c1.683,0,3.046,1.364,3.046,3.047
	c0,1.684-1.363,3.048-3.046,3.048C121.931,439.317,120.566,437.953,120.566,436.27z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M88.184,441.146h20.723
	c0.672,0,1.217-0.545,1.217-1.22v-15.844c0-0.673-0.544-1.22-1.217-1.22H88.184c-0.672,0-1.218,0.547-1.218,1.22v15.844
	C86.965,440.602,87.511,441.146,88.184,441.146z M91.841,433.224c1.683,0,3.049,1.363,3.049,3.047s-1.366,3.048-3.049,3.048
	c-1.682,0-3.047-1.364-3.047-3.048S90.159,433.224,91.841,433.224z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M201.193,454.554h-20.722
	c-0.671,0-1.218,0.546-1.218,1.218v15.847c0,0.675,0.545,1.22,1.218,1.22h20.722c0.674,0,1.22-0.545,1.22-1.22v-15.847
	C202.413,455.1,201.867,454.554,201.193,454.554z M197.538,462.477c-1.683,0-3.046-1.365-3.046-3.048s1.363-3.046,3.046-3.046
	c1.682,0,3.047,1.363,3.047,3.046S199.219,462.477,197.538,462.477z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M203.632,454.554h20.721
	c0.673,0,1.219-0.544,1.219-1.217V437.49c0-0.673-0.546-1.22-1.219-1.22h-20.721c-0.674,0-1.219,0.547-1.219,1.22v15.847
	C202.413,454.01,202.958,454.554,203.632,454.554z M207.289,446.632c1.683,0,3.047,1.366,3.047,3.048
	c0,1.683-1.364,3.047-3.047,3.047s-3.047-1.364-3.047-3.047C204.241,447.998,205.605,446.632,207.289,446.632z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M202.413,453.334v-20.72
	c0-0.674-0.544-1.219-1.217-1.219h-15.847c-0.673,0-1.218,0.545-1.218,1.219v20.72c0,0.675,0.545,1.22,1.218,1.22h15.847
	C201.867,454.554,202.413,454.009,202.413,453.334z M194.491,449.677c0-1.683,1.365-3.046,3.047-3.046
	c1.683,0,3.046,1.363,3.046,3.046c0,1.684-1.363,3.048-3.046,3.048C195.856,452.725,194.491,451.36,194.491,449.677z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M162.109,454.554h20.723
	c0.672,0,1.217-0.544,1.217-1.218v-15.845c0-0.673-0.544-1.221-1.217-1.221h-20.723c-0.672,0-1.218,0.548-1.218,1.221v15.845
	C160.891,454.01,161.437,454.554,162.109,454.554z M165.766,446.632c1.683,0,3.049,1.363,3.049,3.046
	c0,1.684-1.366,3.048-3.049,3.048c-1.682,0-3.047-1.364-3.047-3.048C162.719,447.995,164.084,446.632,165.766,446.632z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M270.242,370.59h-20.721
	c-0.671,0-1.218,0.547-1.218,1.218v15.846c0,0.674,0.545,1.22,1.218,1.22h20.721c0.674,0,1.219-0.546,1.219-1.22v-15.846
	C271.461,371.137,270.916,370.59,270.242,370.59z M266.585,378.513c-1.683,0-3.046-1.365-3.046-3.049
	c0-1.683,1.363-3.046,3.046-3.046c1.682,0,3.047,1.363,3.047,3.046C269.633,377.147,268.268,378.513,266.585,378.513z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M253.097,351.086v-20.72
	c0-0.674-0.544-1.22-1.217-1.22h-15.847c-0.672,0-1.218,0.546-1.218,1.22v20.72c0,0.674,0.545,1.219,1.218,1.219h15.847
	C252.553,352.306,253.097,351.761,253.097,351.086z M245.175,347.43c0-1.683,1.366-3.047,3.047-3.047
	c1.683,0,3.047,1.364,3.047,3.047s-1.364,3.047-3.047,3.047C246.541,350.478,245.175,349.113,245.175,347.43z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M271.461,369.369v-20.72
	c0-0.674-0.544-1.219-1.217-1.219h-15.847c-0.673,0-1.218,0.545-1.218,1.219v20.72c0,0.674,0.545,1.221,1.218,1.221h15.847
	C270.916,370.59,271.461,370.043,271.461,369.369z M263.54,365.713c0-1.683,1.365-3.047,3.047-3.047
	c1.683,0,3.046,1.364,3.046,3.047c0,1.684-1.363,3.048-3.046,3.048C264.905,368.761,263.54,367.396,263.54,365.713z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M231.158,370.59h20.723
	c0.671,0,1.217-0.545,1.217-1.219v-15.845c0-0.673-0.544-1.219-1.217-1.219h-20.723c-0.672,0-1.218,0.546-1.218,1.219v15.845
	C229.94,370.045,230.485,370.59,231.158,370.59z M234.815,362.667c1.683,0,3.049,1.363,3.049,3.047s-1.366,3.048-3.049,3.048
	s-3.048-1.364-3.048-3.048S233.132,362.667,234.815,362.667z"/>
<circle fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" cx="151.44" cy="90.605" r="87.42"/>
<circle fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" cx="151.44" cy="360.054" r="146.029"/>
</svg>
				<h1>Genetic population size</h1>
				Genetic algorithms are a form of machine learning that mimics biological evolution. A smaller population size may lead to results more quickly but will have less genetic diversity. A larger population size could give better results, at the cost of more processing time.
			</div>
			
			<div class="config_explain" id="explain_mutationRate">
			
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="339px" height="309px" viewBox="0 0 339 309" enable-background="new 0 0 339 309" xml:space="preserve">
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="73.283" y1="36.633" x2="50.273" y2="36.633"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="73.283" y1="36.633" x2="63.716" y2="27.064"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="73.283" y1="36.633" x2="63.872" y2="46.045"/>
<g>
	<path fill="#B5BCC9" d="M108.041,98.622V86.571h-4.365v-1.613c0.569,0,1.124-0.044,1.661-0.13c0.537-0.087,1.024-0.25,1.458-0.487
		c0.435-0.237,0.803-0.562,1.103-0.973c0.301-0.411,0.506-0.933,0.617-1.565h1.542v16.819H108.041z"/>
	<path fill="#B5BCC9" d="M115.845,88.445c0.032-0.665,0.111-1.313,0.237-1.945c0.127-0.633,0.309-1.234,0.546-1.803
		c0.236-0.57,0.561-1.068,0.973-1.495c0.411-0.427,0.929-0.767,1.554-1.02c0.625-0.253,1.372-0.379,2.242-0.379
		c0.87,0,1.617,0.126,2.242,0.379c0.625,0.253,1.143,0.593,1.554,1.02c0.411,0.427,0.735,0.925,0.973,1.495
		c0.237,0.569,0.419,1.17,0.545,1.803c0.126,0.632,0.206,1.281,0.237,1.945c0.032,0.664,0.047,1.304,0.047,1.921
		c0,0.617-0.016,1.258-0.047,1.922s-0.111,1.312-0.237,1.945s-0.308,1.229-0.545,1.791c-0.237,0.561-0.562,1.056-0.973,1.482
		c-0.412,0.427-0.925,0.763-1.542,1.008c-0.617,0.246-1.368,0.368-2.253,0.368c-0.87,0-1.617-0.122-2.242-0.368
		c-0.625-0.245-1.143-0.581-1.554-1.008c-0.412-0.427-0.736-0.921-0.973-1.482c-0.237-0.562-0.419-1.158-0.546-1.791
		c-0.126-0.633-0.206-1.281-0.237-1.945s-0.047-1.305-0.047-1.922C115.798,89.75,115.813,89.109,115.845,88.445z M117.993,92.466
		c0.039,0.783,0.167,1.518,0.379,2.206c0.213,0.688,0.558,1.27,1.032,1.744c0.474,0.474,1.139,0.711,1.993,0.711
		s1.518-0.237,1.993-0.711c0.474-0.475,0.818-1.056,1.032-1.744c0.214-0.688,0.34-1.423,0.379-2.206
		c0.04-0.783,0.06-1.49,0.06-2.123c0-0.412-0.003-0.867-0.012-1.365s-0.048-0.996-0.119-1.495c-0.071-0.498-0.175-0.984-0.309-1.458
		c-0.134-0.475-0.332-0.89-0.593-1.246c-0.26-0.356-0.589-0.644-0.984-0.866c-0.396-0.221-0.878-0.332-1.447-0.332
		c-0.569,0-1.052,0.111-1.447,0.332c-0.396,0.222-0.723,0.51-0.984,0.866c-0.261,0.356-0.459,0.771-0.593,1.246
		c-0.135,0.475-0.237,0.96-0.308,1.458c-0.071,0.499-0.111,0.997-0.119,1.495c-0.008,0.498-0.012,0.953-0.012,1.365
		C117.933,90.976,117.953,91.683,117.993,92.466z"/>
</g>
<g>
	<path fill="#B5BCC9" d="M102.917,279.025c0.222-0.728,0.565-1.356,1.032-1.886c0.466-0.53,1.047-0.945,1.743-1.246
		c0.696-0.3,1.487-0.45,2.373-0.45c0.727,0,1.411,0.107,2.052,0.32c0.641,0.213,1.199,0.522,1.672,0.925
		c0.475,0.403,0.851,0.906,1.127,1.507c0.277,0.601,0.415,1.297,0.415,2.088c0,0.743-0.114,1.399-0.344,1.968
		c-0.229,0.57-0.533,1.08-0.913,1.53c-0.379,0.451-0.814,0.858-1.305,1.222c-0.491,0.364-0.996,0.711-1.518,1.043
		c-0.522,0.316-1.043,0.629-1.565,0.937c-0.522,0.308-1,0.637-1.436,0.985c-0.436,0.348-0.807,0.723-1.115,1.126
		c-0.308,0.404-0.51,0.866-0.605,1.388h8.635v1.779h-10.984c0.079-0.996,0.257-1.847,0.534-2.55
		c0.276-0.704,0.629-1.317,1.055-1.838c0.427-0.522,0.91-0.98,1.447-1.376c0.538-0.395,1.1-0.767,1.685-1.115
		c0.711-0.442,1.336-0.85,1.874-1.221c0.538-0.372,0.984-0.748,1.34-1.127c0.356-0.379,0.625-0.79,0.807-1.233
		c0.182-0.443,0.273-0.957,0.273-1.542c0-0.458-0.087-0.874-0.261-1.245c-0.174-0.372-0.408-0.692-0.7-0.961
		c-0.293-0.269-0.636-0.475-1.032-0.617c-0.396-0.143-0.814-0.213-1.258-0.213c-0.585,0-1.087,0.122-1.506,0.368
		c-0.419,0.245-0.763,0.565-1.032,0.96s-0.462,0.842-0.581,1.34c-0.119,0.498-0.17,1-0.155,1.506h-2.017
		C102.608,280.544,102.696,279.752,102.917,279.025z"/>
	<path fill="#B5BCC9" d="M115.845,282.086c0.032-0.665,0.111-1.313,0.237-1.945c0.127-0.633,0.309-1.234,0.546-1.803
		c0.236-0.57,0.561-1.068,0.973-1.495c0.411-0.427,0.929-0.767,1.554-1.02c0.625-0.253,1.372-0.379,2.242-0.379
		c0.87,0,1.617,0.126,2.242,0.379c0.625,0.253,1.143,0.593,1.554,1.02c0.411,0.427,0.735,0.925,0.973,1.495
		c0.237,0.569,0.419,1.17,0.545,1.803c0.126,0.632,0.206,1.281,0.237,1.945c0.032,0.664,0.047,1.304,0.047,1.921
		c0,0.617-0.016,1.258-0.047,1.922s-0.111,1.312-0.237,1.945s-0.308,1.229-0.545,1.791s-0.562,1.056-0.973,1.483
		c-0.412,0.427-0.925,0.763-1.542,1.008c-0.617,0.246-1.368,0.368-2.253,0.368c-0.87,0-1.617-0.122-2.242-0.368
		c-0.625-0.245-1.143-0.581-1.554-1.008c-0.412-0.427-0.736-0.921-0.973-1.483c-0.237-0.562-0.419-1.158-0.546-1.791
		c-0.126-0.633-0.206-1.281-0.237-1.945s-0.047-1.305-0.047-1.922C115.798,283.39,115.813,282.75,115.845,282.086z M117.993,286.107
		c0.039,0.783,0.167,1.518,0.379,2.206c0.213,0.688,0.558,1.27,1.032,1.744c0.474,0.474,1.139,0.711,1.993,0.711
		s1.518-0.237,1.993-0.711c0.474-0.475,0.818-1.056,1.032-1.744c0.214-0.688,0.34-1.423,0.379-2.206
		c0.04-0.783,0.06-1.49,0.06-2.123c0-0.412-0.003-0.867-0.012-1.365s-0.048-0.996-0.119-1.495c-0.071-0.498-0.175-0.984-0.309-1.458
		c-0.134-0.475-0.332-0.89-0.593-1.246c-0.26-0.356-0.589-0.644-0.984-0.866c-0.396-0.221-0.878-0.332-1.447-0.332
		c-0.569,0-1.052,0.111-1.447,0.332c-0.396,0.222-0.723,0.51-0.984,0.866c-0.261,0.356-0.459,0.771-0.593,1.246
		c-0.135,0.475-0.237,0.96-0.308,1.458c-0.071,0.499-0.111,0.997-0.119,1.495c-0.008,0.498-0.012,0.953-0.012,1.365
		C117.933,284.617,117.953,285.324,117.993,286.107z"/>
</g>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M23.207,20.222H4.698
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.602,0.488,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089V21.31
	C24.296,20.708,23.809,20.222,23.207,20.222z M19.941,27.3c-1.503,0-2.722-1.219-2.722-2.723c0-1.503,1.218-2.722,2.722-2.722
	c1.502,0,2.722,1.219,2.722,2.722C22.663,26.081,21.443,27.3,19.941,27.3z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M23.087,52.887H4.579
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.487,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089V53.975
	C24.177,53.373,23.689,52.887,23.087,52.887z M19.821,59.964c-1.503,0-2.722-1.219-2.722-2.723c0-1.503,1.219-2.722,2.722-2.722
	s2.721,1.219,2.721,2.722C22.542,58.745,21.324,59.964,19.821,59.964z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M23.207,3.661H4.698
	c-0.602,0-1.089,0.487-1.089,1.089v14.154c0,0.601,0.488,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089V4.75
	C24.296,4.148,23.809,3.661,23.207,3.661z M19.941,10.739c-1.503,0-2.722-1.218-2.722-2.722s1.218-2.722,2.722-2.722
	c1.502,0,2.722,1.218,2.722,2.722S21.443,10.739,19.941,10.739z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M23.087,36.554H4.579
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.602,0.487,1.09,1.089,1.09h18.509c0.602,0,1.089-0.488,1.089-1.09V37.642
	C24.177,37.041,23.689,36.554,23.087,36.554z M19.821,43.632c-1.503,0-2.722-1.219-2.722-2.723s1.219-2.722,2.722-2.722
	s2.721,1.219,2.721,2.722S21.324,43.632,19.821,43.632z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M116.962,20.222H98.453
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.602,0.487,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089V21.31
	C118.051,20.708,117.564,20.222,116.962,20.222z M113.696,27.3c-1.503,0-2.722-1.219-2.722-2.723c0-1.503,1.219-2.722,2.722-2.722
	s2.721,1.219,2.721,2.722C116.417,26.081,115.199,27.3,113.696,27.3z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M137.648,36.554h-18.508
	c-0.603,0-1.089,0.486-1.089,1.088v14.155c0,0.602,0.487,1.09,1.089,1.09h18.508c0.603,0,1.09-0.488,1.09-1.09V37.642
	C138.738,37.041,138.251,36.554,137.648,36.554z M134.383,43.632c-1.503,0-2.723-1.219-2.723-2.723s1.219-2.722,2.723-2.722
	c1.502,0,2.721,1.219,2.721,2.722S135.886,43.632,134.383,43.632z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M116.962,3.661H98.453
	c-0.602,0-1.089,0.487-1.089,1.089v14.154c0,0.601,0.487,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089V4.75
	C118.051,4.148,117.564,3.661,116.962,3.661z M113.696,10.739c-1.503,0-2.722-1.218-2.722-2.722s1.219-2.722,2.722-2.722
	s2.721,1.218,2.721,2.722S115.199,10.739,113.696,10.739z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M116.841,36.554H98.333
	c-0.603,0-1.089,0.486-1.089,1.088v14.155c0,0.602,0.487,1.09,1.089,1.09h18.508c0.603,0,1.089-0.488,1.089-1.09V37.642
	C117.931,37.041,117.444,36.554,116.841,36.554z M113.576,43.632c-1.504,0-2.723-1.219-2.723-2.723s1.219-2.722,2.723-2.722
	c1.502,0,2.721,1.219,2.721,2.722S115.079,43.632,113.576,43.632z"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="187.853" y1="36.633" x2="164.843" y2="36.633"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="187.853" y1="36.633" x2="178.285" y2="27.064"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="187.853" y1="36.633" x2="178.44" y2="46.045"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M231.531,20.222h-18.508
	c-0.603,0-1.089,0.486-1.089,1.088v14.155c0,0.602,0.486,1.089,1.089,1.089h18.508c0.603,0,1.089-0.488,1.089-1.089V21.31
	C232.62,20.708,232.133,20.222,231.531,20.222z M228.266,27.3c-1.504,0-2.723-1.219-2.723-2.723c0-1.503,1.219-2.722,2.723-2.722
	c1.502,0,2.721,1.219,2.721,2.722C230.987,26.081,229.768,27.3,228.266,27.3z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M252.218,36.554h-18.509
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.602,0.487,1.09,1.089,1.09h18.509c0.602,0,1.089-0.488,1.089-1.09V37.642
	C253.308,37.041,252.82,36.554,252.218,36.554z M248.952,43.632c-1.504,0-2.722-1.219-2.722-2.723s1.218-2.722,2.722-2.722
	c1.502,0,2.721,1.219,2.721,2.722S250.455,43.632,248.952,43.632z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M231.531,52.887h-18.508
	c-0.603,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.486,1.089,1.089,1.089h18.508c0.603,0,1.089-0.488,1.089-1.089V53.975
	C232.62,53.373,232.133,52.887,231.531,52.887z M228.266,59.964c-1.504,0-2.723-1.219-2.723-2.723c0-1.503,1.219-2.722,2.723-2.722
	c1.502,0,2.721,1.219,2.721,2.722C230.987,58.745,229.768,59.964,228.266,59.964z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M231.411,36.554h-18.509
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.602,0.487,1.09,1.089,1.09h18.509c0.602,0,1.089-0.488,1.089-1.09V37.642
	C232.5,37.041,232.013,36.554,231.411,36.554z M228.145,43.632c-1.504,0-2.722-1.219-2.722-2.723s1.218-2.722,2.722-2.722
	c1.502,0,2.721,1.219,2.721,2.722S229.647,43.632,228.145,43.632z"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="73.283" y1="209.023" x2="50.273" y2="209.023"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="73.283" y1="209.023" x2="63.716" y2="199.455"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="73.283" y1="209.023" x2="63.872" y2="218.436"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M23.207,192.613H4.698
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.488,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089v-14.155
	C24.296,193.099,23.809,192.613,23.207,192.613z M19.941,199.69c-1.503,0-2.722-1.219-2.722-2.723c0-1.503,1.218-2.722,2.722-2.722
	c1.502,0,2.722,1.219,2.722,2.722C22.663,198.471,21.443,199.69,19.941,199.69z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M23.087,225.277H4.579
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.487,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089v-14.155
	C24.177,225.763,23.689,225.277,23.087,225.277z M19.821,232.354c-1.503,0-2.722-1.219-2.722-2.722c0-1.504,1.219-2.723,2.722-2.723
	s2.721,1.219,2.721,2.723C22.542,231.135,21.324,232.354,19.821,232.354z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M23.207,176.052H4.698
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.488,1.089,1.089,1.089h18.509c0.602,0,1.089-0.489,1.089-1.089V177.14
	C24.296,176.538,23.809,176.052,23.207,176.052z M19.941,183.129c-1.503,0-2.722-1.218-2.722-2.722c0-1.503,1.218-2.722,2.722-2.722
	c1.502,0,2.722,1.219,2.722,2.722C22.663,181.911,21.443,183.129,19.941,183.129z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M23.087,208.945H4.579
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.487,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089v-14.155
	C24.177,209.431,23.689,208.945,23.087,208.945z M19.821,216.022c-1.503,0-2.722-1.219-2.722-2.722c0-1.504,1.219-2.723,2.722-2.723
	s2.721,1.219,2.721,2.723C22.542,214.803,21.324,216.022,19.821,216.022z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M116.962,192.613H98.453
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.487,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089v-14.155
	C118.051,193.099,117.564,192.613,116.962,192.613z M113.696,199.69c-1.503,0-2.722-1.219-2.722-2.723
	c0-1.503,1.219-2.722,2.722-2.722s2.721,1.219,2.721,2.722C116.417,198.471,115.199,199.69,113.696,199.69z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M113.696,244.875v-18.509
	c0-0.602-0.486-1.089-1.088-1.089H98.453c-0.601,0-1.089,0.487-1.089,1.089v18.509c0,0.602,0.488,1.089,1.089,1.089h14.154
	C113.21,245.964,113.696,245.477,113.696,244.875z M106.619,241.609c0-1.504,1.219-2.722,2.722-2.722
	c1.504,0,2.723,1.218,2.723,2.722c0,1.502-1.219,2.721-2.723,2.721C107.837,244.33,106.619,243.111,106.619,241.609z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M134.383,207.855v-18.509
	c0-0.602-0.487-1.089-1.088-1.089h-14.155c-0.601,0-1.089,0.487-1.089,1.089v18.509c0,0.602,0.488,1.089,1.089,1.089h14.155
	C133.896,208.945,134.383,208.458,134.383,207.855z M127.306,204.589c0-1.503,1.219-2.722,2.722-2.722
	c1.504,0,2.722,1.219,2.722,2.722s-1.218,2.721-2.722,2.721C128.525,207.311,127.306,206.092,127.306,204.589z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M116.841,208.945H98.333
	c-0.603,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.487,1.089,1.089,1.089h18.508c0.603,0,1.089-0.488,1.089-1.089v-14.155
	C117.931,209.431,117.444,208.945,116.841,208.945z M113.576,216.022c-1.504,0-2.723-1.219-2.723-2.722
	c0-1.504,1.219-2.723,2.723-2.723c1.502,0,2.721,1.219,2.721,2.723C116.297,214.803,115.079,216.022,113.576,216.022z"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="187.853" y1="209.023" x2="164.843" y2="209.023"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="187.853" y1="209.023" x2="178.285" y2="199.455"/>
<line fill="none" stroke="#B5BCC9" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" x1="187.853" y1="209.023" x2="178.44" y2="218.436"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M211.813,189.133v18.509
	c0,0.602,0.486,1.089,1.088,1.089h14.155c0.601,0,1.089-0.488,1.089-1.089v-18.509c0-0.602-0.488-1.089-1.089-1.089h-14.155
	C212.299,188.043,211.813,188.531,211.813,189.133z M218.89,192.399c0,1.503-1.219,2.722-2.722,2.722
	c-1.504,0-2.722-1.218-2.722-2.722c0-1.502,1.218-2.722,2.722-2.722C217.671,189.677,218.89,190.896,218.89,192.399z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M252.218,208.945h-18.509
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.487,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089v-14.155
	C253.308,209.431,252.82,208.945,252.218,208.945z M248.952,216.022c-1.504,0-2.722-1.219-2.722-2.722
	c0-1.504,1.218-2.723,2.722-2.723c1.502,0,2.721,1.219,2.721,2.723C251.673,214.803,250.455,216.022,248.952,216.022z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M244.477,207.642v-18.509
	c0-0.602-0.486-1.089-1.088-1.089h-14.155c-0.601,0-1.089,0.487-1.089,1.089v18.509c0,0.602,0.488,1.089,1.089,1.089h14.155
	C243.991,208.731,244.477,208.243,244.477,207.642z M237.4,204.375c0-1.503,1.219-2.722,2.723-2.722
	c1.503,0,2.722,1.219,2.722,2.722s-1.218,2.721-2.722,2.721C238.619,207.097,237.4,205.878,237.4,204.375z"/>
<path fill="none" stroke="#B4BBC8" stroke-width="2" stroke-miterlimit="10" d="M231.411,208.945h-18.509
	c-0.602,0-1.089,0.486-1.089,1.088v14.155c0,0.601,0.487,1.089,1.089,1.089h18.509c0.602,0,1.089-0.488,1.089-1.089v-14.155
	C232.5,209.431,232.013,208.945,231.411,208.945z M228.145,216.022c-1.504,0-2.722-1.219-2.722-2.722
	c0-1.504,1.218-2.723,2.722-2.723c1.502,0,2.721,1.219,2.721,2.723C230.866,214.803,229.647,216.022,228.145,216.022z"/>
</svg>


				<h1>Genetic mutation rate</h1>
				How much to mutate the population in each successive trial. A higher mutation rate ensures that a large variety of nest arrangements are tried, but reduces the ability of the algorithm to build upon previous successes. Increase this value if there are obvious arrangements that it does not seem to explore.
			</div>
			
		</div>
		
		
		<div id="account" class="page">
			<a href="#" id="purchaseSingle">One credit</a>

		</div>
		
		
		<div id="info" class="page" style="text-align: center">
		<svg style="max-width: 20em; width: 75%; display: block; margin: 2em auto 0 auto" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
		 width="283.46px" height="283.46px" viewBox="0 0 283.46 283.46" enable-background="new 0 0 283.46 283.46" xml:space="preserve">
	<path class="fill" opacity="0.25" fill="none" stroke="#53B7DB" stroke-width="2.5" stroke-miterlimit="10" d="M58.207,177.084
		c19.709,0,35.742-16.035,35.742-35.746c0-19.709-16.033-35.742-35.742-35.742s-35.742,16.033-35.742,35.742
		C22.464,161.049,38.498,177.084,58.207,177.084z M55.708,94.926c7.932,0,14.385-6.453,14.385-14.385
		c0-7.93-6.453-14.383-14.385-14.383s-14.383,6.453-14.383,14.383C41.326,88.473,47.777,94.926,55.708,94.926z M78.611,72.159
		c7.932,0,14.383-6.453,14.383-14.385c0-7.93-6.451-14.383-14.383-14.383s-14.385,6.453-14.385,14.383
		C64.226,65.706,70.679,72.159,78.611,72.159z M126.435,23.184c-7.932,0-14.383,6.453-14.383,14.383
		c0,7.932,6.451,14.385,14.383,14.385s14.385-6.453,14.385-14.385C140.82,29.637,134.367,23.184,126.435,23.184z M155.265,65.963
		c7.932,0,14.387-6.453,14.387-14.385s-6.455-14.385-14.387-14.385c-7.93,0-14.383,6.453-14.383,14.385
		S147.335,65.963,155.265,65.963z M233.72,116.983c0-7.932-6.453-14.385-14.385-14.385s-14.385,6.453-14.385,14.385
		s6.453,14.385,14.385,14.385S233.72,124.915,233.72,116.983z M256.796,141.338c0-7.932-6.453-14.385-14.383-14.385
		c-7.934,0-14.387,6.453-14.387,14.385s6.453,14.387,14.387,14.387C250.343,155.725,256.796,149.27,256.796,141.338z M168.119,73.459
		c0,16.809,13.674,30.482,30.48,30.482s30.482-13.674,30.482-30.482c0-16.807-13.676-30.48-30.482-30.48
		S168.119,56.653,168.119,73.459z M198.599,178.737c-16.807,0-30.48,13.674-30.48,30.48s13.674,30.48,30.48,30.48
		s30.482-13.674,30.482-30.48S215.406,178.737,198.599,178.737z M81.339,88.62c0-2.873-2.338-5.211-5.211-5.211
		c-2.875,0-5.211,2.338-5.211,5.211s2.336,5.209,5.211,5.209C79.001,93.829,81.339,91.493,81.339,88.62z M85.123,84.047
		c2.873,0,5.211-2.338,5.211-5.211s-2.338-5.211-5.211-5.211s-5.211,2.338-5.211,5.211S82.25,84.047,85.123,84.047z M101.996,52.344
		c2.873,0,5.209-2.338,5.209-5.211s-2.336-5.211-5.209-5.211c-2.875,0-5.211,2.338-5.211,5.211S99.121,52.344,101.996,52.344z
		 M91.89,44.44c2.873,0,5.211-2.336,5.211-5.211c0-2.873-2.338-5.209-5.211-5.209s-5.211,2.336-5.211,5.209
		C86.679,42.104,89.017,44.44,91.89,44.44z M104.218,28.901c-2.873,0-5.211,2.336-5.211,5.209c0,2.875,2.338,5.211,5.211,5.211
		s5.211-2.336,5.211-5.211C109.429,31.237,107.091,28.901,104.218,28.901z M146.587,32.854c2.873,0,5.211-2.336,5.211-5.211
		c0-2.873-2.338-5.209-5.211-5.209s-5.211,2.336-5.211,5.209C141.376,30.518,143.714,32.854,146.587,32.854z M159.386,34.231
		c2.873,0,5.211-2.336,5.211-5.209c0-2.875-2.338-5.211-5.211-5.211c-2.875,0-5.213,2.336-5.213,5.211
		C154.173,31.895,156.511,34.231,159.386,34.231z M172.117,37.331c2.873,0,5.211-2.338,5.211-5.211s-2.338-5.211-5.211-5.211
		c-2.875,0-5.213,2.338-5.213,5.211S169.242,37.331,172.117,37.331z M184.509,41.708c2.873,0,5.211-2.336,5.211-5.209
		s-2.338-5.211-5.211-5.211s-5.211,2.338-5.211,5.211S181.636,41.708,184.509,41.708z M224.564,95.594
		c0,2.873,2.338,5.211,5.211,5.211s5.211-2.338,5.211-5.211s-2.338-5.211-5.211-5.211S224.564,92.721,224.564,95.594z
		 M235.492,88.743c2.875,0,5.213-2.338,5.213-5.211s-2.338-5.209-5.213-5.209c-2.873,0-5.211,2.336-5.211,5.209
		S232.619,88.743,235.492,88.743z M244.48,98.918c2.873,0,5.211-2.336,5.211-5.209c0-2.875-2.338-5.211-5.211-5.211
		c-2.875,0-5.211,2.336-5.211,5.211C239.269,96.583,241.605,98.918,244.48,98.918z M238.998,100.176
		c-2.873,0-5.211,2.336-5.211,5.209s2.338,5.211,5.211,5.211s5.211-2.338,5.211-5.211S241.871,100.176,238.998,100.176z
		 M236.32,119.141c0,2.875,2.338,5.213,5.213,5.213c2.873,0,5.211-2.338,5.211-5.213c0-2.873-2.338-5.209-5.211-5.209
		C238.658,113.932,236.32,116.268,236.32,119.141z M245.779,110.471c0,2.875,2.338,5.211,5.211,5.211
		c2.875,0,5.213-2.336,5.213-5.211c0-2.873-2.338-5.209-5.213-5.209C248.117,105.262,245.779,107.598,245.779,110.471z
		 M212.232,141.338c0,2.873,2.338,5.211,5.211,5.211s5.211-2.338,5.211-5.211s-2.338-5.209-5.211-5.209
		S212.232,138.465,212.232,141.338z M80.71,106.133c2.873,0,5.209-2.336,5.209-5.209s-2.336-5.211-5.209-5.211
		c-2.875,0-5.211,2.338-5.211,5.211S77.835,106.133,80.71,106.133z M89.152,116.014c2.873,0,5.211-2.338,5.211-5.211
		s-2.338-5.211-5.211-5.211s-5.209,2.338-5.209,5.211S86.279,116.014,89.152,116.014z M89.152,85.924
		c-2.873,0-5.209,2.336-5.209,5.209s2.336,5.211,5.209,5.211s5.211-2.338,5.211-5.211S92.025,85.924,89.152,85.924z M67.912,93.961
		c-2.873,0-5.211,2.338-5.211,5.211s2.338,5.211,5.211,5.211s5.211-2.338,5.211-5.211S70.785,93.961,67.912,93.961z M32.412,111.551
		c2.873,0,5.211-2.336,5.211-5.209s-2.338-5.211-5.211-5.211s-5.211,2.338-5.211,5.211S29.539,111.551,32.412,111.551z
		 M37.734,99.848c2.873,0,5.209-2.338,5.209-5.211s-2.336-5.211-5.209-5.211c-2.875,0-5.211,2.338-5.211,5.211
		S34.859,99.848,37.734,99.848z M70.093,202.477c0-7.932-6.453-14.387-14.385-14.387s-14.383,6.455-14.383,14.387
		s6.451,14.387,14.383,14.387S70.093,210.409,70.093,202.477z M92.994,225.245c0-7.932-6.451-14.387-14.383-14.387
		s-14.385,6.455-14.385,14.387s6.453,14.387,14.385,14.387S92.994,233.176,92.994,225.245z M126.437,231.067
		c-7.932,0-14.385,6.455-14.385,14.387c0,7.93,6.453,14.385,14.385,14.385s14.383-6.455,14.383-14.385
		C140.82,237.522,134.369,231.067,126.437,231.067z M155.265,217.057c-7.93,0-14.383,6.453-14.383,14.383
		c0,7.934,6.453,14.387,14.383,14.387c7.932,0,14.387-6.453,14.387-14.387C169.652,223.51,163.197,217.057,155.265,217.057z
		 M219.335,180.42c7.932,0,14.385-6.453,14.385-14.383c0-7.932-6.453-14.387-14.385-14.387s-14.385,6.455-14.385,14.387
		C204.951,173.967,211.404,180.42,219.335,180.42z M76.13,199.612c2.873,0,5.209-2.338,5.209-5.211s-2.336-5.213-5.209-5.213
		c-2.875,0-5.211,2.34-5.211,5.213S73.255,199.612,76.13,199.612z M85.123,209.393c2.873,0,5.211-2.338,5.211-5.209
		c0-2.873-2.338-5.213-5.211-5.213s-5.211,2.34-5.211,5.213C79.912,207.055,82.25,209.393,85.123,209.393z M107.205,235.887
		c0-2.873-2.336-5.213-5.209-5.213c-2.875,0-5.211,2.34-5.211,5.213s2.336,5.211,5.211,5.211
		C104.869,241.098,107.205,238.76,107.205,235.887z M91.89,238.579c-2.873,0-5.211,2.338-5.211,5.211s2.338,5.213,5.211,5.213
		s5.211-2.34,5.211-5.213S94.763,238.579,91.89,238.579z M104.218,243.696c-2.873,0-5.211,2.34-5.211,5.215
		c0,2.873,2.338,5.211,5.211,5.211s5.211-2.338,5.211-5.211C109.429,246.036,107.091,243.696,104.218,243.696z M146.587,250.163
		c-2.873,0-5.211,2.34-5.211,5.215c0,2.873,2.338,5.211,5.211,5.211s5.211-2.338,5.211-5.211
		C151.798,252.502,149.46,250.163,146.587,250.163z M159.386,248.788c-2.875,0-5.213,2.34-5.213,5.213
		c0,2.871,2.338,5.209,5.213,5.209c2.873,0,5.211-2.338,5.211-5.209C164.597,251.127,162.259,248.788,159.386,248.788z
		 M172.117,245.69c-2.875,0-5.213,2.336-5.213,5.211c0,2.873,2.338,5.211,5.213,5.211c2.873,0,5.211-2.338,5.211-5.211
		C177.328,248.026,174.99,245.69,172.117,245.69z M184.509,241.313c-2.873,0-5.211,2.338-5.211,5.209
		c0,2.873,2.338,5.213,5.211,5.213s5.213-2.34,5.213-5.213C189.722,243.651,187.382,241.313,184.509,241.313z M234.986,187.426
		c0-2.873-2.338-5.211-5.211-5.211s-5.211,2.338-5.211,5.211s2.338,5.211,5.211,5.211S234.986,190.299,234.986,187.426z
		 M235.492,194.276c-2.873,0-5.211,2.338-5.211,5.211s2.338,5.213,5.211,5.213c2.875,0,5.213-2.34,5.213-5.213
		S238.367,194.276,235.492,194.276z M244.48,184.1c-2.875,0-5.211,2.338-5.211,5.211s2.336,5.213,5.211,5.213
		c2.873,0,5.211-2.34,5.211-5.213S247.353,184.1,244.48,184.1z M233.787,177.635c0,2.873,2.338,5.211,5.211,5.211
		s5.211-2.338,5.211-5.211s-2.338-5.213-5.211-5.213S233.787,174.762,233.787,177.635z M246.744,163.877
		c0-2.873-2.338-5.211-5.211-5.211c-2.875,0-5.213,2.338-5.213,5.211s2.338,5.211,5.213,5.211
		C244.406,169.088,246.744,166.75,246.744,163.877z M250.99,167.336c-2.873,0-5.211,2.338-5.211,5.213
		c0,2.873,2.338,5.211,5.211,5.211c2.875,0,5.213-2.338,5.213-5.211C256.203,169.674,253.865,167.336,250.99,167.336z M80.71,187.307
		c2.873,0,5.209-2.338,5.209-5.211s-2.336-5.211-5.209-5.211c-2.875,0-5.211,2.338-5.211,5.211S77.835,187.307,80.71,187.307z
		 M89.152,167.004c-2.873,0-5.209,2.34-5.209,5.213s2.336,5.209,5.209,5.209s5.211-2.336,5.211-5.209S92.025,167.004,89.152,167.004z
		 M94.363,191.885c0-2.873-2.338-5.211-5.211-5.211s-5.209,2.338-5.209,5.211s2.336,5.211,5.209,5.211S94.363,194.758,94.363,191.885
		z M67.912,178.637c-2.873,0-5.211,2.336-5.211,5.211c0,2.873,2.338,5.211,5.211,5.211s5.211-2.338,5.211-5.211
		C73.123,180.973,70.785,178.637,67.912,178.637z M37.625,176.678c0-2.875-2.338-5.211-5.211-5.211c-2.875,0-5.213,2.336-5.213,5.211
		c0,2.873,2.338,5.211,5.213,5.211C35.287,181.889,37.625,179.551,37.625,176.678z M42.945,188.383c0-2.873-2.336-5.211-5.209-5.211
		c-2.875,0-5.213,2.338-5.213,5.211s2.338,5.211,5.213,5.211C40.609,193.594,42.945,191.256,42.945,188.383z"/>
	<g class="logo">
		<path fill="none" stroke="#26A7DF" stroke-width="2.5" stroke-miterlimit="10" d="M262.552,141.338
			c0-67.061-54.365-121.426-121.426-121.426c-67.064,0-121.426,54.365-121.426,121.426c0,67.064,54.361,121.426,121.426,121.426
			C208.187,262.764,262.552,208.403,262.552,141.338z"/>
		<circle fill="none" stroke="#26A7DF" stroke-width="2.5" stroke-miterlimit="10" cx="122.607" cy="80.139" r="25.865"/>
		<circle fill="none" stroke="#26A7DF" stroke-width="2.5" stroke-miterlimit="10" cx="122.607" cy="202.54" r="25.865"/>
		
			<line fill="none" stroke="#26A7DF" stroke-width="2.5" stroke-miterlimit="10" x1="148.472" y1="80.139" x2="148.472" y2="202.54"/>
		
			<rect x="127.33" y="67.287" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -33.3954 140.7444)" fill="none" stroke="#26A7DF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" width="51.732" height="86.793"/>
		
			<rect x="127.269" y="128.699" transform="matrix(0.7071 0.7071 -0.7071 0.7071 166.5478 -57.8764)" fill="none" stroke="#26A7DF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" width="51.731" height="86.792"/>
		<line fill="none" stroke="#26A7DF" stroke-width="2.5" stroke-miterlimit="10" x1="96.32" y1="202.198" x2="96.32" y2="79.799"/>
		<circle fill="none" stroke="#26A7DF" stroke-width="2.5" stroke-miterlimit="10" cx="183.807" cy="141.338" r="25.866"/>
	</g>
	</svg>
			<h1 style="margin: 0 0 0.2em 0; font-size: 3em; color:#26A9E0; text-align: center">Deepnest</h1>
			
			v<span id="package-version"></span>
			
		</div>
	</div>
	</body>
</html>