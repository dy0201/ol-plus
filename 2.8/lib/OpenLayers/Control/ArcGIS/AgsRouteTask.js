/**
 * @requires OpenLayers/Control/ArcGIS/AgsControl.js 
 *
 * Class: OpenLayers.Control.AgsRouteTask
 *
 * Inherits from:
 *  - <OpenLayers.Control.AgsControl>
 */
 
OpenLayers.Control.AgsRouteTask = OpenLayers.Class(OpenLayers.Control.AgsControl, {	
	/**
  	 * Property: multiple
  	 *   {Boolean} restrict multiple selection.
  	 *   should always be true because AgsRouteTask allows multiple geometry inputs as stops or barriers
  	 */
  	 multiple: true, 
	  
	/**
	 * Property: asynchronous
     *   {Boolean} whether to deal with synchronous gp task or asynchronous gp job
     *   should always be false because AgsRouteTask now only supports synchronous mode
	 */
	 asynchronous: false,
	
	/**
	 * Property: stopsAdded
	 * {Array} in 'draw' mode, user can add route stops by hand-draw geomtry on map
	 *    and those stops will be stored in stopsAdded
	 */
	 stopsAdded: null,

	/**
	 * Property: stopsAddes
	 * {Array} in 'draw' mode, user can add route barriers by hand-draw geomtry on map
	 *    and those barriers will be stored in barriersAdded
	 */
	 barriersAdded: null,
	
	/**
	 * Property: stopOrBarrier
	 * {String} in 'draw' mode control whether to add stop or barrier when user draw geometry on map
	 */
	 stopOrBarrier: "stop",
			 
	/**
     * Constructor: <OpenLayers.Control.ArcGIS.AgsRouteTask>
     *
     * Parameters:
     *   url - {String} URL to the ArcGIS Server REST resource that represents a map service
     *   layer - {OpenLayers.Layer.Vector} 
     *   callbacks - {Array of functions}
     *   options - {Object} 
     */
	initialize: function(url, layer, callbacks, options) {
		// call parent initializer
		OpenLayers.Control.AgsControl.prototype.initialize.apply(this, [url, layer, callbacks, options]);	 			 			 
		
		// initialize this.stopsAdded and this.barrierAdded array
		this.stopsAdded = [];
		this.barriersAdded = [];
		
		// modify the default configuration for drawControl to support multiple geometries as 'stops' or 'barriers'
		/* 
		 * by default in DrawFeature control, a drawFeature() will be called each time user finishes drawing a geometry
		 *   in drawFeature(), layer's 'sketchcomplete' event will triggered and if the callback for 'sketchcomplete' returns
		 *   false nothing will be done after, but if it returns 'true' a feature will be added to associated layer
		 */
		// override the default "sketchcomplete" event handler with a function that return 'false', see DrawFeature control for details
		this.drawControl.layer.events.register(
			"sketchcomplete",
			this,
			function(evt) {												
				// when user draw points on the map, it could be a stop or a barrier
				//   depends on the value this.stopOrBarrier add them to this.stopsAdded or this.barriersAdded
				this.hideStopsAndBarriers();
				if(this.stopOrBarrier == "stop") {
					OpenLayers.Console.debug("...add 'stop'...");
					this.addStops([evt.feature]);	
				} else if(this.stopOrBarrier == "barrier") {
					OpenLayers.Console.debug("...add 'barrier'...");
					this.addBarriers([evt.feature]);
				} else {
					OpenLayers.Console.error("...invalid 'stopOrBarrier' value...please set it to 'stop' or 'barrier'...");
					throw "...invalid 'stopOrBarrier' value...please set it to 'stop' or 'barrier'...";
				}
				this.showStopsAndBarriers();
				return false;
			}
		);											
					
		//  how user tiggers to solve the route should be defined in application
		//  below is what you can add in app
		//    modify the dblclick callback of handler for drawControl to tigger route solving
		/*
		this.drawControl.handler.dblclick = this._bindFunction(
												function(evt) {
													OpenLayers.Console.debug("...dblclick detected in 'draw' mode...solving route by added stops and barriers...");
													OpenLayers.Event.stop(evt);
        											return false;
												}
											);
		*/
		
		// overwrite this.taskParameters for AgsRouteTask control
		this.taskParameters = {
			'returnDirections': true,
			'returnRoutes': true,
			'returnStops': true,
			'returnBarriers': true		
			// TODO: to add more default route parameters
		};		
				
		// set parser for AgsRouteTask results
		this._resultsParser = {
			'parser': this.adapter.parseAgsResults['routeResults'],
			'context': this.adapter
		};		
				
		// use dojo if defined
		this.execute = this._bindFunction(this.execute, this);
		// hitch execute, use dojo anyway		 
		//this.execute = dojo.hitch(this, this.execute);	
	},
	
	/**
     * API Method: execute 
     *   Execute solve operation 
     *   
     * Parameters:
     * 	 olFeatures - {Array of OpenLayers.Feature.Vector}	
     *   taskParameters - {object}
     *   callbacks - {Array of functions}
     */
	execute: function(olFeatures, taskParameters, callbacks) {			     	
		// assemble parameters to execute Task
		var _taskParameters = OpenLayers.Util.extend({}, taskParameters); 
		OpenLayers.Util.applyDefaults(
			_taskParameters,
			this.taskParameters
		);		
		// set 'outSpatialReference' parameter based on current map projection
		if(this._isDefined(this.layer.map)) {
			_taskParameters['outSpatialReference'] = this.layer.map['projection'] ? this.layer.map['projection'] : _taskParameters['outSpatialReference']; 
		}		
		
		// multiple feature selection should always be enabled for AgsRouteTask control
		// input 'olFeatures' should be an array containing more than one features
		//   which will be used as 'stops'
		//   user should encode 'barriers' feature array in taskParameters along with other parameters 		
		if(olFeatures instanceof Array) {
			_taskParameters['stops'] = olFeatures;
		} else if(!this._isDefined(_taskParameters['stops'])) {
			OpenLayers.Console.error("...can not execute route task...input geometry is not valid...");
   			throw "...can not execute route task...input geometry is not valid...";
		}
		 				
		// merge additional callbacks
		var _taskCallbacks = [];
		_taskCallbacks = _taskCallbacks.concat(this.taskCallbacks);
		_taskCallbacks = _taskCallbacks.concat(callbacks);
		var _singleTaskCallback = this._createCallbacks(
			this,
			_taskCallbacks,
			{}				 	    	
		);	
		
		// callbacks for synchronous route tasks
		if (this.asynchronous == false) {
			var agsRouteTask = new esri.tasks.RouteTask(this.url);
			// make a single callback for esri.tasks.RouteTask
			var _onExecuteComplete = this._createCallbacks(this, [this.onExecuteComplete], {
				callback: _singleTaskCallback
			});
			// error callback for esri.tasks.RouteTask
			var _onCompleteError = this.errback || null;
			try {
				var agsRouteParameters = this.adapter.encodeAgsRouteParameters(_taskParameters);
			} catch (e) {
				OpenLayers.Console.error(e.toString());
				throw e;
			}
			//OpenLayers.Console.debug("...ready to solve the route...");
			agsRouteTask.solve(agsRouteParameters, _onExecuteComplete, _onCompleteError);
		} else {
			OpenLayers.Console.error("...'asynchronous' should always be set to 'false' for AgsRouteTask ...");
			throw "...'asynchronous' should always be set to 'false' for AgsRouteTask ...";
		} 				
	},
	
	/**
     * APIMethod: addStops
     *   add stops to map
     * 
     * Parameters:
     *   olStops - {Array of OpenLayers.Feature.Vector} array
     */
	addStops: function(olStops) {		
		//OpenLayers.Console.debug("...addStops start...");
		for(var i=0; i<olStops.length; i++) {
			var olStop = olStops[i];
			if(olStop instanceof OpenLayers.Feature.Vector && olStop.geometry instanceof OpenLayers.Geometry.Point) {				
				olStop.style = { // hard code a style for 'stop'
					fillColor: "#FFFF00",
			        fillOpacity: 1, 	        
			        strokeColor: "#FF0000",
			        strokeOpacity: 1,
			        strokeWidth: 2,
			        strokeLinecap: "round",
			        strokeDashstyle: "solid",	        
			        pointRadius: 10,
				};
				this.stopsAdded.push(olStop);
			} else {
				OpenLayers.Console.debug("...skip adding 'stop' because it's not OpenLayers.Feature.Vector");
			}
		}
		//OpenLayers.Console.debug("...addStops end...");
	},
	
	/**
     * APIMethod: hideStops 
     *   remove stops from map
     * 
     */
	hideStops: function() {		
		// OpenLayers.Console.debug("...hideStops...");
		// hide stops
		if(this.stopsAdded && this.stopsAdded.length > 0) {
			this.layer.removeFeatures(this.stopsAdded);
		}			
	},
	
	/**
     * APIMethod: cleanupStops
     *   remove stops from map and destroy them
     */
	cleanupStops: function() {							
		//OpenLayers.Console.debug("...cleanupStops start...");
		this.hideStops();
		if(this.stopsAdded && this.stopsAdded.length>0) {
			for(var i=0; i<this.stopsAdded.length; i++) {
				this.stopsAdded[i].destroy();
			}	
		}		
		this.stopsAdded.length = 0;
		//OpenLayers.Console.debug("...cleanupStops end...");
	},
	
	/**
     * APIMethod: addBarriers
     *   add barriers to map
     * 
     * Parameters:
     *   olBarriers - {Array of OpenLayers.Feature.Vector} array
     */
	addBarriers: function(olBarriers) {		
		//OpenLayers.Console.debug("...addBarriers start...");
		for(var i=0; i<olBarriers.length; i++) {
			var olBarrier = olBarriers[i];
			if(olBarrier instanceof OpenLayers.Feature.Vector && olBarrier.geometry instanceof OpenLayers.Geometry.Point) {
				olBarrier.style = {
					fillColor: "#FF0000",
			        fillOpacity: 1, 	        
			        strokeColor: "#FFFF00",
			        strokeOpacity: 1,
			        strokeWidth: 2,
			        strokeLinecap: "round",
			        strokeDashstyle: "solid",	        
			        pointRadius: 10,
				};
				this.barriersAdded.push(olBarrier);
			} else {
				OpenLayers.Console.debug("...skip adding 'barrier' because it's not OpenLayers.Feature.Vector");
			}
		}
		//OpenLayers.Console.debug("...addBarriers end...");
	},
	
	/**
     * APIMethod: cleanupBarriers
     *   remove barriers from map and destroy them
     */
	cleanupBarriers: function() {							
		//OpenLayers.Console.debug("...cleanupBarriers start...");
		this.hideBarriers();
		if(this.barriersAdded && this.barriersAdded.length>0) {
			for(var i=0; i<this.barriersAdded.length; i++) {
				this.barriersAdded[i].destroy();
			}	
		}
		this.barriersAdded.length = 0;;
		//OpenLayers.Console.debug("...cleanupBarriers end...");
	},
	
	/**
     * APIMethod: hideBarriers 
     *   remove barriers from map
     * 
     */
	hideBarriers: function() {		
		//OpenLayers.Console.debug("...hideBarriers...");
		// hide barriers
		if(this.barriersAdded && this.barriersAdded.length > 0) {
			this.layer.removeFeatures(this.barriersAdded);
		}			
	},
	
	/**
     * APIMethod: hideStopsAndBarriers 
     *   remove stops and barriers from map
     * 
     */
	hideStopsAndBarriers: function() {		
		this.hideStops();
		this.hideBarriers();		
	},
	
	/**
     * APIMethod: showStopsAndBarriers
     *   show stops and barriers from map
     * 
     */
	showStopsAndBarriers: function() {
		//OpenLayers.Console.debug("...showStopsAndBarriers...");
		// show stops and barriers
		if(this.stopsAdded && this.stopsAdded.length > 0) {
			this.layer.addFeatures(this.stopsAdded);
		}
		if(this.barriersAdded && this.barriersAdded.length > 0) {
			this.layer.addFeatures(this.barriersAdded);
		}
	},

	CLASS_NAME: "OpenLayers.Control.AgsRouteTask"
});