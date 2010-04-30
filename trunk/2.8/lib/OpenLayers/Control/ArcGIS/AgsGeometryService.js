/**
 * @requires OpenLayers/Control/ArcGIS/AgsControl.js 
 *
 * Class: OpenLayers.Control.AgsGeometryService
 *
 * Inherits from:
 *  - <OpenLayers.Control.AgsControl>
 */

OpenLayers.Control.AgsGeometryService = OpenLayers.Class(OpenLayers.Control.AgsControl, {
	/**
  	 * Property: multiple
  	 *   {Boolean} restrict multiple selection.
  	 *   Default is true, for AgsGeometryService to allow mulitple feature selection
  	 */
  	multiple: true, 
  
	/**
   	 * Property: asynchronous
   	 *   {Boolean} whether to deal with synchronous gp task or asynchronous gp job
   	 *   Default is false 
   	 */
    asynchronous: false,

    /**
     * Property: geometryServiceType
     *   {String} which geometry service operation to execute, buffer, project or simplify
	 *   default is "buffer"
	 *   applicable geometryServiceType values are "buffer", "areasAndLengths", "labelPoints", "lengths", "project", "relation", and "simplify" 
     */
    geometryServiceType: "buffer",	
	
	/**
     * Constructor: <OpenLayers.Control.ArcGIS.AgsGeometryService>
     *
     * Parameters:
     *   url - {String} URL to the ArcGIS Server REST resource that represents a geometry service
     *   layer - {OpenLayers.Layer.Vector} 
     *   callbacks - {Array of function}
     *   options - {Object} 
     */
	initialize: function(url, layer, callbacks, options) {
		// call parent initializer
		OpenLayers.Control.AgsControl.prototype.initialize.apply(this, [url, layer, callbacks, options]);
		// overwrite this.taskParameters for AgsGeometryService control
		this.taskParameters = {
			'bufferSpatialReference':   null,
			'distances':				[1],
			'features':					null,	
			'outSpatialReference':		null,
			'unionResults':				false,
			'unit':						"UNIT_KILOMETER",
			'spatialRelationship': 		"INTERSECTION",
			// non ESRI parameters
			'inSpatialReference':		"EPSG:4326",	
			'comparisonString':			null
		};
		// set task results parser for AgsGeometryService control
		this._resultsParser = {
			'parser': this.adapter.parseAgsGraphics,
			'context': this.adapter
		};	
		// use dojo if defined
		this.execute = this._bindFunction(this.execute, this);
		// hitch execute, use dojo anyway		 
		//this.execute = dojo.hitch(this, this.execute);
	},
    
    /**
     * API Method: execute 
     *   Execute geometry service operation against an ArcGIS Server Rest Geometry service
     *   
     * Parameters:
     *   olFeatures - {Array of OpenLayers.Feature.Vector} 
     *   taskParameters -{object}
     *   callbacks - {object} 
     */
	execute: function(olFeatures, taskParameters, callbacks) {	
		// assemble parameters to execute Task
		var _taskParameters = OpenLayers.Util.extend({}, taskParameters); 
		OpenLayers.Util.applyDefaults(
			_taskParameters,
			this.taskParameters
		);	
		// merge additional callbacks
		var _taskCallbacks = [];
		_taskCallbacks = _taskCallbacks.concat(this.taskCallbacks);
		_taskCallbacks = _taskCallbacks.concat(callbacks);
		var _singleTaskCallback = this._createCallbacks(
			this,
			_taskCallbacks,
			{}				 	    	
		);	
		if (this.asynchronous == false) {
			var agsGeometryService = new esri.tasks.GeometryService(this.url);
			// make a single callback for esri.tasks.GeometryService
			var _onExecuteComplete = this._createCallbacks(this, [this.onExecuteComplete], {
				callback: _singleTaskCallback
			});
			// error callback for esri.tasks.GeometryService
			var _onCompleteError = this.errback || null;
			try {
				switch (this.geometryServiceType) {
					case "buffer":
						_taskParameters['bufferSpatialReference'] = this.layer.map['projection'] ? this.layer.map['projection'] : _taskParameters['bufferSpatialReference'];
						_taskParameters['features'] = olFeatures ? olFeatures : _taskParameters['features'];
						var agsBufferParameters = this.adapter.encodeAgsBufferParameters(_taskParameters);
						agsGeometryService.buffer(agsBufferParameters, _onExecuteComplete, _onCompleteError);
						break;					
					case "project":
						_taskParameters['inSpatialReference'] = this.layer.map['projection'] ? this.layer.map['projection'] : _taskParameters['inSpatialReference'];
						_taskParameters['outSpatialReference'] = _taskParameters['outSpatialReference'] || _taskParameters['inSpatialReference'];
						var agsGraphics = this.adapter.encodeAgsGraphics(olFeatures, _taskParameters['inSpatialReference']);						
						var agsSpatialReference = this.adapter.encodeAgsSpatialReference(_taskParameters['outSpatialReference']);
						agsGeometryService.project(agsGraphics, agsSpatialReference, _onExecuteComplete, _onCompleteError);						
						break;
					/*
					 * only supports relation between two single feature instead of two array of features
					 *   no ESRI Shape Comparison Language support
					 */
					case "relation":
						// to do relation on map, you must set this.mode to 'select' instead of 'draw'
						_taskParameters['inSpatialReference'] = this.layer.map['projection'] ? this.layer.map['projection'] : _taskParameters['inSpatialReference'];
						// do relation operation between olFeature[0] and olFeature[1]
						var agsGraphics1 = this.adapter.encodeAgsGraphics([olFeatures[0]], _taskParameters['inSpatialReference']);
						var agsGraphics2 = this.adapter.encodeAgsGraphics([olFeatures[1]], _taskParameters['inSpatialReference']);
						var agsGeometryRelationship = this.adapter.encodeAgsGeometrySpatialRelationship(_taskParameters['spatialRelationship']);
						var agsComparisonString = _taskParameters['comparisonString'];
						agsGeometryService.relation(agsGraphics1, agsGraphics2, agsGeometryRelationship, agsComparisonString, _onExecuteComplete, _onCompleteError);	
						break;
					case "areasAndLengths":
					case "lengths":
					case "simplify":	
					case "labelPoints":
						_taskParameters['inSpatialReference'] = this.layer.map['projection'] ? this.layer.map['projection'] : _taskParameters['inSpatialReference'];
						var agsGraphics = this.adapter.encodeAgsGraphics(olFeatures, _taskParameters['inSpatialReference']);
						agsGeometryService[this.geometryServiceType].apply(agsGeometryService, [agsGraphics, _onExecuteComplete, _onCompleteError]);
						break;
					default:
						OpenLayers.Console.error("...invalid geometryServiceType...please call setGeometryServiceType() with valid geometryServiceType...");
						return;				
				}
			} catch(e) {
				throw e;
			}
		} else {
			OpenLayers.Console.error("...'asynchronous' should always be set to 'false' for AgsGeometryService...");
			throw "...'asynchronous' should always be set to 'false' for AgsGeometryService...";
		}			
	},
	
	/**
	 * APIMethod: setGeometryServiceType
	 *   Toggle between different types of geometry service operations
	 *
	 * Parameters: 
	 *   geometryServiceType - {String}
	 *     "buffer", 
	 *     "areasAndLengths", 
	 *     "labelPoints", 
	 *     "lengths", 
	 *     "project", 
	 *     "relation",
	 *     "simplify" 
	 */
	setGeometryServiceType: function(geometryServiceType) {
		this.geometryServiceType = geometryServiceType || this.geometryServiceType;
		switch (this.geometryServiceType) {
			case "buffer":
			case "labelPoints":
			case "project":						
			case "simplify":			
				this._resultsParser['parser'] = this.adapter.parseAgsGraphics;					
				break;
			case "relation":
				this._resultsParser['parser'] = this.adapter.parseAgsResults.relations;
				break;
			case "areasAndLengths":						
			case "lengths":
				this._resultsParser['parser'] = this.adapter.parseAgsResults.areasAndLengths;
				break;
			default:
				OpenLayers.Console.error("...invalid geometryServiceType...please call setGeometryServiceType() with valid geometryServiceType...");
				return;		
		}					
	},	
	CLASS_NAME: "OpenLayers.Control.AgsGeometryService"
});