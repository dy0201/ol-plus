/**
 * @requires OpenLayers/Format.js
 *
 * Class OpenLayers.Format.AgsJsAdapter
 *
 * converting between ArcGIS JavaScript library model and OpenLayers model
 */
OpenLayers.Format.AgsJsAdapter = (function() {	
	
	/*************************************************************************************
     * STATIC ATTRIBUTES
     *************************************************************************************/
		
	/**
	 * _AGS_UNITS - constant variable representing unit
	 *
	 * reference: http://edndoc.esri.com/arcobjects/9.2/ComponentHelp/esriGeometry/esriSRUnitType.htm
     *   or http://edndoc.esri.com/arcobjects/9.2/ComponentHelp/esriGeometry/esriSRUnit2Type.htm
	 */
	var _AGS_UNITS = {
		'UNIT_METER': 		9001,
		'UNIT_FOOT': 		9002, 
		'UNIT_KILOMETER': 	9036,
		'UNIT_DEGREE':		9102
		// TODO: add more if necessary
	};
	
	/**
	 * _AGS_SPATIALRELATIONSHIP - constant variable representing spatial relationship
	 */
	var _AGS_SPATIALRELATIONSHIP = {
		'INTERSECTS': 			"esriSpatialRelIntersects",
        'CONTAINS': 			"esriSpatialRelContains",
        'CROSSES': 				"esriSpatialRelCrosses",
        'ENVELOPE_INTERSECTS': 	"esriSpatialRelEnvelopeIntersects",
        'INDEX_INTERSECTS': 	"esriSpatialRelIndexIntersects",
        'OVERLAPS': 			"esriSpatialRelOverlaps",
        'TOUCHES': 				"esriSpatialRelTouches",
        'WITHIN': 				"esriSpatialRelWithin"
	};
	
	/**
	 * _AGS_GEOMETRY_SPATIALRELATIONSHIP - constant variable representing geometry spatial relationship
	 */
	var _AGS_GEOMETRY_SPATIALRELATIONSHIP = {
		'CROSS': 					"esriGeometryRelationCross",
        'DISJOINT':	 				"esriGeometryRelationDisjoint",
        'IN':	 					"esriGeometryRelationIn",
        'INTERIOR_INTERSECTION': 	"esriGeometryRelationInteriorIntersection",
        'INTERSECTION': 			"esriGeometryRelationIntersection",
        'LINE_COINCIDENCE': 		"esriGeometryRelationLineCoincidence",
        'LINE_TOUCHE': 				"esriGeometryRelationLineTouch",
        'OVERLAP': 					"esriGeometryRelationOverlap",
		'POINT_TOUCH': 				"esriGeometryRelationPointTouch",
		'RELATION': 				"esriGeometryRelationRelation",
		'TOUCH': 					"esriGeometryRelationTouch",
		'WITHIN': 					"esriGeometryRelationWithin",
	};

	/**
	 * _UNMATCH_AGS_WKID - wkid of 'spheric mecator' is different in ArcGIS and OpenLayers  
	 *   "900913" in OpenLayers and "102113" in ArcGIS 
	 */
	var _UNMATCH_AGS_WKID = {
		'900913': "102113"
		// TODO: add more if necessary
	};
	
	/**
	 * _UNMATCH_OL_WKID - wkid of 'spheric mecator' is different in ArcGIS and OpenLayers  
	 *   "900913" in OpenLayers and "102113" in ArcGIS
	 */
	var _UNMATCH_OL_WKID = {
		'102113': "900913" 
		// add more
	};
	
	/**
	 * _OL_GEOMETRY_MAP - map a OpenLayers geometry type to a general geometry type
	 */
	var _OL_GEOMETRY_MAP = {
		'OpenLayers.Geometry.Point' 			: "point",
   		'OpenLayers.Geometry.MultiLineString' 	: "polyline",
   		'OpenLayers.Geometry.Polygon' 			: "polygon",
   		'OpenLayers.Bounds' 					: "extent"
	};
	
	/**
	 * _OL_AGS_STYLE_MAP - map an OpenLayers geometry type to a AgsJs symbol
	 */
	var _OL_AGS_STYLE_MAP = {		
		'OpenLayers.Geometry.Point' 			: "SimpleMarkerSymbol",
   		'OpenLayers.Geometry.MultiLineString' 	: "SimpleLineSymbol",
   		'OpenLayers.Geometry.Polygon' 			: "SimpleFillSymbol",
   		'OpenLayers.Bounds' 					: "SimpleFillSymbol",
		'simplemarkersymbol'					: "SimpleMarkerSymbol",
		'picturemarkersymbol'					: "PictureMarkerSymbol",
		'simplelinesymbol'						: "SimpleLineSymbol",
		'cartographiclinesymbol'				: "CartographicLineSymbol",
		'picturefillsymbol'						: "PictureFillSymbol",
		
	};
	
	/**
	 * _OL_AGS_SIMPLE_MARKER_MAP - map an OpenLayers marker symbol to an AGS JS marker symbol
	 */
	// OpenLayers seems only support circle at least for SVG
	/*
	var _OL_AGS_SIMPLE_MARKERSYMBOL_MAP = {
		// TODO:
		''										: "STYLE_CIRCLE",
		''										: "STYLE_CROSS",
		''										: "STYLE_DIAMOND",
		''										: "STYLE_SQUARE",
		''										: "STYLE_X"
	};
	*/
	
	/**
	 * _AGS_OL_SIMPLE_MARKER_MAP - map an AGS JS marker symbol to an OpenLayers marker symbol 
	 */
	// OpenLayers seems only support circle at least for SVG
	/*
	var _AGS_OL_SIMPLE_MARKERSYMBOL_MAP = {
		// TODO:
		'STYLE_CIRCLE'							: "",
		'STYLE_CROSS'							: "",
		'STYLE_DIAMOND'							: "",
		'STYLE_SQUARE'							: "",
		'STYLE_X'								: ""
	};
	*/
	/**
	 * _OL_AGS_SIMPLE_LINESYMBOL_MAP - map an OpenLayers line symbol to an AGS JS line symbol
	 */
	var _OL_AGS_SIMPLE_LINESYMBOL_MAP = {
		'dash'									: "STYLE_DASH",
		'dashdot'								: "STYLE_DASHDOT",
		'longdashdot'							: "STYLE_DASHDOTDOT",
		'dot'									: "STYLE_DOT",
		'solid'									: "STYLE_NULL",
		'solid'									: "STYLE_SOLID"
	};
	
	/**
	 * _AGS_OL_SIMPLE_LINESYMBOL_MAP - map an AGS JS line symbol to an OpenLayers line symbol 
	 */
	var _AGS_OL_SIMPLE_LINESYMBOL_MAP = {		
		'STYLE_DASH'							: "dash",
		'STYLE_DASHDOT'							: "dashdot",
		'STYLE_DASHDOTDOT'						: "longdashdot",
		'STYLE_DOT'								: "dot",
		'STYLE_NULL'							: "solid",
		'STYLE_SOLID'							: "solid"
	};
	
	/**
	 * _OL_AGS_SIMPLE_FILLSYMBOL_MAP
	 *   different fill styles are not supported in OpenLayers 
	 */
	/*
	var _OL_AGS_SIMPLE_LINESYMBOL_MAP = {
		''										: "STYLE_BACKWARD_DIAGONAL",
		''										: "STYLE_CROSS",
		''										: "STYLE_DIAGONAL_CROSS",
		''										: "STYLE_FORWARD_DIAGONAL",
		''										: "STYLE_HORIZONTAL",
		''										: "STYLE_NULL",
		''										: "STYLE_SOLID",
		''										: "STYLE_VERTICAL",
	};
	*/
	
	/**
	 * _AGS_OL_SIMPLE_FILLSYMBOL_MAP
	 *   different fill styles are not supported in OpenLayers 
	 */
	/*
	var _AGS_OL_SIMPLE_LINESYMBOL_MAP = {		
		'STYLE_BACKWARD_DIAGONAL'				: "",
		'STYLE_CROSS'							: "",
		'STYLE_DIAGONAL_CROSS'					: "",
		'STYLE_FORWARD_DIAGONAL'				: "",
		'STYLE_HORIZONTAL'						: "",
		'STYLE_NULL'							: "",
		'STYLE_SOLID'							: "",
		'STYLE_VERTICAL'						: "",
	};
	*/
		
	/**
	 * _OL_AGS_NAUTURN_MAP
	 *   map an OpenLayers na u-turn type to an esri.tasks.NAUTurn
	 */
	var _OL_AGS_NAUTURN_MAP = {
		'ALLOW_BACKTRACK'						: "allow_backtrack",
		'AT_DEAD_ENDS_ONLY'						: "at_dead_ends_only",
		'NO_BACKTRACK'							: "no_backtrack"
	};
	
	/**
	 * _OL_AGS_NAUTURN_MAP
	 *   map an OpenLayers na u-turn type to an esri.tasks.NAUTurn
	 */
	var _AGS_OL_NAUTURN_MAP = {		
		'allow_backtrack'						: "ALLOW_BACKTRACK",						
		'at_dead_ends_only'						: "AT_DEAD_ENDS_ONLY",
		'no_backtrack'							: "NO_BACKTRACK"
	};
	
	/**
	 * _OL_AGS_NAOUTPUTLINE_MAP
	 *   map an OpenLayers na output line type to an esri.tasks.NAOutputLine
	 */
	var _OL_AGS_NAOUTPUTLINE_MAP = {
		'NONE'									: "none",
		'STRAIGHT'								: "straight",
		'TRUE_SHAPE'							: "true_shape",
		'TRUE_SHAPE_WITH_MEASURE'				: "true_shape_with_measure"
	};
	
	/**
	 * _OL_AGS_NAOUTPUTLINE_MAP
	 *   map an OpenLayers na output line type to an esri.tasks.NAOutputLine
	 */
	var _AGS_OL_NAOUTPUTLINE_MAP = {		
		'none'									: "NONE",
		'straight'								: "STRAIGHT",
		'true_shape'							: "TRUE_SHAPE",
		'true_shape_with_measure'				: "TRUE_SHAPE_WITH_MEASURE"
	};
	
	/*************************************************************************************
     * Static style objects for routes, stops, and barriers in routeResult
     *************************************************************************************/
	var _OL_ROUTETASK_STYLE = {
		'route': {
	        strokeColor: "#00FF00",
	        strokeOpacity: 1,
	        strokeWidth: 2,
	        strokeLinecap: "round",
	        strokeDashstyle: "solid",	        
		},
		'stop': {
			fillColor: "#FFFF00",
	        fillOpacity: 1, 	        
	        strokeColor: "#FF0000",
	        strokeOpacity: 1,
	        strokeWidth: 2,
	        strokeLinecap: "round",
	        strokeDashstyle: "solid",	        
	        pointRadius: 10,	        	        
		},
		'barrier': {
			fillColor: "#FF0000",
	        fillOpacity: 1, 	        
	        strokeColor: "#FFFF00",
	        strokeOpacity: 1,
	        strokeWidth: 2,
	        strokeLinecap: "round",
	        strokeDashstyle: "solid",	        
	        pointRadius: 10,
		}
	};
	
	/*************************************************************************************
     * Utility methods from OpenLayers.Util.AgsUtil
     *************************************************************************************/
	var _isDefined = OpenLayers.Util.AgsUtil.isDefined;
	var _isNumber = OpenLayers.Util.AgsUtil.isNumber;
	var _isBoolean = OpenLayers.Util.AgsUtil.isBoolean;
	var _isAgsGeometry = OpenLayers.Util.AgsUtil.isAgsGeometry;
	var _isOLGeometry = OpenLayers.Util.AgsUtil.isOLGeometry;
	var _isSameOLPoint = OpenLayers.Util.AgsUtil.isSameOLPoint;
	
	/*************************************************************************************
     * STATIC PRIVATE METHODS
     *************************************************************************************/

	/**
	 * Static method: _toAgsWkid
	 *
	 * Get wkid in ArcGIS JavaScript from a wkid in OpenLayers
	 */
	function _toAgsWkid(olWkid) {
	    if(_isDefined(_UNMATCH_AGS_WKID[olWkid])) {
	   		return _UNMATCH_AGS_WKID[olWkid];
	   	} else {
	   		return olWkid;
	   	}
    };
	
	/**
	 * Static method: _toOlWkid
	 *
	 * Get wkid in OpenLayers from a wkid in ArcGIS JavaScript
	 */  	   
    function _toOlWkid(agsWkid) {
    	if(_isDefined(_UNMATCH_OL_WKID[agsWkid])) {
    		return _UNMATCH_OL_WKID[agsWkid];
    	} else {
    		return agsWkid;
    	}
    };	
	
	/**
	 * Static method: bind a function to a specific context/scope
	 *     if dojo is defined, use dojo.hitch(), otherwise use OpenLayers.Function.bind()
	 */
	function __bindFunction(func, scope) {
		if(window.dojo !== undefined) {
			//OpenLayers.Console.log("...dojo found...use dojo.hitch() to bind function to scope...");
			return dojo.hitch(scope, func);
		} else {
			OpenLayers.Console.log("...dojo not found...use OpenLayers.Function.bind() to bind function to scope...");
			return OpenLayers.Function.bind(func, scope);
		}
	}
	
	/**
	 * Return OpenLayers.Format.AgsJsAdapter constructor
	 */
	return function(config) {
		
		/**
		 * API Properties: config - object
		 */
		this.config = {
			// OpenLayers.Geometry.* does not have a spatial reference (wkid), use this config parameter
			//   to encode an AgsJs geometry from an OpenLayers.Geometry.* if spatial reference is unknown 
			'defaultEncodeWkid': "EPSG:900913"
		};		        		
	    
	    /*************************************************************************************
     	 * PUBLIC INSTANCE METHODS
     	 *************************************************************************************/

	    /**
	     * APIMethod: parseAgsGeometry
	     *   convert esri.geometry.* object to OpenLayers.Geometry.*
	     *
	     * Parameters:
	     *   agsGeometry - (esri.geometry.*) object 
		 *
	     * Returns: 
	     *   (OpenLayers.Geometry.*) object 
	     */    
	    this.parseAgsGeometry = {
	    	/**
	    	 * APIMethod: parseAgsGeometry.point
	    	 *   parses an esri.geometry.Point object to an OpenLayers.Geometry.Point
	    	 *
	    	 * Parameters:
	     	 *   agsPoint - {esri.geometry.Point} object 
		 	 *
	     	 * Returns: 
	      	 *   {OpenLayers.Geometry.Point} object 	
	    	 */
	    	"point": function(agsPoint) {	    		
	    		var olPoint = null;
	    		if(agsPoint instanceof esri.geometry.Point && _isNumber(agsPoint.x) && _isNumber(agsPoint.y)) {	    				    			
	    			olPoint = new OpenLayers.Geometry.Point(agsPoint.x, agsPoint.y);	    			
	    			return olPoint;
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsGeometry.point...invalid esri.geometry.Point...");
	    			throw "...AgsAdapter.parseAgsGeometry.point...invalid esri.geometry.Point..." + agsPoint;
	    		}	    		
	    	},
	    	
	    	/**
	   		 * a coordinate in esri.geometry.Polyline or esri.geometry.Polygon is an array [x,y]
	   		 *  
	   		 * APIMethod: parseAgsGeometry.coordinate
	   	 	 *   parses array [x,y] to an OpenLayers.Geometry.Point object
	   	 	 *
	   	 	 * Parameters:
	    	 *   agsCoordinate - {Array} [x,y] 
	 	 	 *
	    	 * Returns: 
	     	 *   {OpenLayers.Geometry.Point} object
	   		 */
	    	"coordinate": function(agsCoordinate) {
	    		var olCoordinate = null;
	    		if(agsCoordinate instanceof Array && _isNumber(agsCoordinate[0]) && _isNumber(agsCoordinate[1])) {	    			
	    			olCoordinate = new OpenLayers.Geometry.Point(agsCoordinate[0], agsCoordinate[1]);
	    			return olCoordinate;	
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsGeometry.coordinate...invalid array [x, y]...");
	    			throw "...AgsAdapter.parseAgsGeometry.coordinate...invalid array [x, y]..." + agsCoordinate;
	    		}	    		
	    	},
	    	
	    	/**
	   		 * a path in esri.geometry.Polyline is an array of [x,y]
	   		 *  
	   		 * APIMethod: parseAgsGeometry.path
	   	 	 *   parses an array of array [x,y] to an OpenLayers.Geometry.LineString object
	   	 	 *
	   	 	 * Parameters:
	    	 *   agsPointArray - {Array of Array} Array of [x,y] 
	 	 	 *
	    	 * Returns: 
	     	 *   {OpenLayers.Geometry.LineString} object
	   		 */
	    	"path": function(agsPointArray) {
	    		var olLineString = null;
				if(agsPointArray instanceof Array) {
	    			var olPoints = [];
	    			for(var i=0; i<agsPointArray.length; i++) {    				
	    				var olPoint = null;
	    				try {
	    					olPoint = this.parseAgsGeometry['coordinate'].apply(this, [agsPointArray[i]]);    				
	    					olPoints.push(olPoint);
	    				} catch(e) {
	    					throw e;
	    				}
	    			}
	    			olLineString = new OpenLayers.Geometry.LineString(olPoints);
	    			return olLineString;
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsGeometry.path...invalid array of coordinates...");
	    			throw "...AgsAdapter.parseAgsGeometry.path...invalid array of array [x,y]..." + agsPointArray;
	    		}	    		
	    	},
	    	
	    	/**
	   		 * a ring in esri.geometry.Polygon is an array of [x,y]
	   		 *  
	   		 * APIMethod: parseAgsGeometry.ring
	   	 	 *   parses an array of array [x,y] to an OpenLayers.Geometry.LinearRing object
	   	 	 *
	   	 	 * Parameters:
	    	 *   agsPointArray - {Array of Array} Array of [x,y] 
	 	 	 *
	    	 * Returns: 
	     	 *   {OpenLayers.Geometry.LinearRing} object
	   		 */
	    	"ring": function(agsPointArray) {	    		
				// check if it is a closed ring, otherwise throws exception
				var beginPoint = agsPointArray[0];
				var endPoint = agsPointArray[agsPointArray.length-1];
				if(beginPoint[0] != endPoint[0] || beginPoint[1] != endPoint[1]) {
					OpenLayers.Console.error("...AgsAdapter.parseAgsGeometry.ring...not a closed ring...");
	    			throw "...AgsAdapter.parseAgsGeometry.ring...not a closed ring..." + agsPointArray;
				}
				
				var olLinearRing = null;
				var olLineString = null;
				try {
					olLineString = this.parseAgsGeometry['path'].apply(this, [agsPointArray]);										
	    		} catch(e) {
	    			throw e;
	    		}
	    		olLinearRing = new OpenLayers.Geometry.LinearRing(olLineString.components);
	    		return olLinearRing;
	    	},
	    	
	    	/**
	    	 * APIMethod: parseAgsGeometry.polyline
	    	 *   parses an esri.geometry.Polyline object to an OpenLayers.Geometry.MultiLineString
	    	 *
	    	 * Parameters:
	     	 *   agsPolyline - {esri.geometry.Polyline} object 
		 	 *
	     	 * Returns: 
	      	 *   {OpenLayers.Geometry.MultiLineString} object 	
	    	 */
	    	"polyline": function(agsPolyline) {
	    		var olMultiLineString = null;    		
	    		if(_isDefined(agsPolyline.paths) && agsPolyline.paths instanceof Array) {
	    			var paths = agsPolyline.paths;
	    			var lineStrings = [];
	    			for(var i=0; i<paths.length; i++) {	    				
	    				try {
	    					var lineString = this.parseAgsGeometry['path'].apply(this, [paths[i]]);
	    					lineStrings.push(lineString);
	    				} catch(e) {
	    					throw e;
	    				}
	    			}
	    			olMultiLineString = new OpenLayers.Geometry.MultiLineString(lineStrings);
	    			return olMultiLineString;
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsGeometry.polyline...invalid esri.geometry.Polyline...");
	    			throw "...AgsAdapter.parseAgsGeometry.polyline...invalid esri.geometry.Polyline..." + agsPolyline;
	    		}	    		
	    	},
	    	
	    	/**
	    	 * APIMethod: parseAgsGeometry.polygon
	    	 *   convert an esri.geometry.Polygon object to an OpenLayers.Geometry.Polygon
	    	 *
	    	 * Parameters:
	     	 *   agsPolygon - {esri.geometry.Polygon} object 
		 	 *
	     	 * Returns: 
	      	 *   {OpenLayers.Geometry.Polygon} object 	
	    	 */
	    	"polygon": function(agsPolygon) {
	    		var olPolygon = null;
	    		if(_isDefined(agsPolygon.rings) && agsPolygon.rings instanceof Array) {
	    			var rings = agsPolygon.rings;
	    			var linearRings = [];
	    			for(var i=0; i<rings.length; i++) {
	    				try {
	    					var linearRing = this.parseAgsGeometry['ring'].apply(this, [rings[i]]);
	    					linearRings.push(linearRing);
	    				} catch(e) {
	    					throw e;
	    				}
	    			}
	    			olPolygon = new OpenLayers.Geometry.Polygon(linearRings);    			
	    			return olPolygon;
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsGeometry.polygon...invalid esri.geometry.Polygon...");
	    			throw "...AgsAdapter.parseAgsGeometry.polygon...invalid esri.geometry.Polygon..." + agsPolygon;
	    		}	    		
	    	},
	    	
	    	/**
	    	 * APIMethod: parseAgsGeometry.multipoint
	    	 *   convert an esri.geometry.MultiPoint object to an array of OpenLayers.Geometry.Point
	    	 *
	    	 * Parameters:
	     	 *   agsMultipoint - {esri.geometry.MultiPoint} object 
		 	 *
	     	 * Returns: 
	      	 *   {Array of OpenLayers.Geometry.Point} Array	
	    	 */	    	
	    	"multipoint": function(agsMultipoint) {
				var olPoints = [];
				if(_isDefined(agsMultipoint.points) && agsMultipoint.points instanceof Array) {
					var agsPoints = agsMultipoint.points;
					for(var i=0; i<agsPoints.length; i++) {
						try {
	    					var olPoint = this.parseAgsGeometry['coordinate'].apply(this, [agsPoints[i]]);
							olPoints.push(olPoint);
	    				} catch(e) {
	    					throw e;
	    				}
					}
					return olPoints;
				} else {
					OpenLayers.Console.error("...AgsAdapter.parseAgsGeometry.multipoint...invalid esri.geometry.MultiPoint...");
	    			throw "...AgsAdapter.parseAgsGeometry.multipoint...invalid esri.geometry.MultiPoint..." + agsPolygon;
				}
	    	},
	    		    	
	    	/**
	    	 * APIMethod: parseAgsGeometry.extent
	    	 *   convert an esri.geometry.Extent object to an OpenLayers.Bounds
	    	 *
	    	 * Parameters:
	     	 *   agsPolygon - {esri.geometry.Extent} object 
		 	 *
	     	 * Returns: 
	      	 *   {OpenLayers.Bounds} object 	
	    	 */
	    	"extent": function(agsExtent) {
	    		var olBounds = null;
	    		if(_isDefined(agsExtent.xmin) && _isDefined(agsExtent.xmax) && _isDefined(agsExtent.ymin) && _isDefined(agsExtent.ymax)) {
	    			olBounds = new OpenLayers.Bounds(agsExtent.xmin, agsExtent.ymin, agsExtent.xmax, agsExtent.ymax);	 		
	    			return olBounds;
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsGeometry.extent...invalid esri.geometry.Extent...");
	    			throw "...AgsAdapter.parseAgsGeometry.extent...invalid esri.geometry.Extent..." + agsExtent;
	    		}	    		
	    	}
	    };
	    
	      
		 
		/**
		 * How OpenLayers symbol works: 		
 		 *   OpenLayers features can have a number of style attributes. The 'default' 
 		 *   style will typically be used if no other style is specified.
 		 *
 		 * Default style properties:
 		 *
		 *  - fillColor: "#ee9900",
		 *  - fillOpacity: 0.4, 
		 *  - hoverFillColor: "white",
		 *  - hoverFillOpacity: 0.8,
		 *  - strokeColor: "#ee9900",
		 *  - strokeOpacity: 1,
		 *  - strokeWidth: 1,
		 *  - strokeLinecap: "round",  [butt | round | square]
		 *  - strokeDashstyle: "solid", [dot | dash | dashdot | longdash | longdashdot | solid]
		 *  - hoverStrokeColor: "red",
		 *  - hoverStrokeOpacity: 1,
		 *  - hoverStrokeWidth: 0.2,
		 *  - pointRadius: 6,
		 *  - hoverPointRadius: 1,
		 *  - hoverPointUnit: "%",
		 *  - pointerEvents: "visiblePainted"
		 *  - cursor: ""
		 *
		 * Other style properties that have no default values:
		 *
		 *  - externalGraphic,
		 *  - graphicWidth,
		 *  - graphicHeight,
		 *  - graphicOpacity,
		 *  - graphicXOffset,
		 *  - graphicYOffset,
		 *  - graphicName,
		 *  - display
		 */ 
		 
		/**
	     * APIMethod: parseAgsSymbol
	     *   converts esri.symbol.Symbol.* object to OpenLayers.Feature.Vector.style
	     *
	     * Parameters:
	     *   agsSymbol - (esri.symbol.Symbol.*) object 
		 *
	     * Returns: 
	     *   {OpenLayers.Feature.Vector.style} object 
	     */ 		 
	    this.parseAgsSymbol = {	  
			/**
	    	 * APIMethod: parseAgsSymbol.SimpleMarkerSymbol
	    	 *   convert an esri.symbol.SimpleMarkerSymbol object to an object for OpenLayers style 
	    	 *
	    	 * Parameters:
	     	 *   agsSimpleMarkerSymbol - {esri.symbol.SimpleMarkerSymbol} object 
		 	 *
	     	 * Returns: 
	      	 *   {} Object
	    	 */	 	
	    	"SimpleMarkerSymbol" : function(agsSimpleMarkerSymbol) {
	    		if(_isDefined(agsSimpleMarkerSymbol) && agsSimpleMarkerSymbol instanceof esri.symbol.SimpleMarkerSymbol) {
	    			var olStyle = {};		    				    		
					olStyle['pointRadius'] = agsSimpleMarkerSymbol.size || 6; // marker size in pixel, default is 6
					olStyle['fillColor'] = agsSimpleMarkerSymbol.color.toHex() || "#ee9900"; // marker fillColor, default "#ee9900"
		    		olStyle['fillOpacity'] = agsSimpleMarkerSymbol.color.toRgba()[3] || 0.49; // marker fillOpacity, default is 0.49   		
		    		// TODO: angle		    		
		    		olStyle['graphicXOffset'] = agsSimpleMarkerSymbol.xoffset || 0; // marker xoffset, default is 0
					olStyle['graphicYOffset'] = agsSimpleMarkerSymbol.yoffset || 0; // marker yoffset, default is 0		    		
		    		//olStyle['graphicName'] = _AGS_OL_SIMPLE_MARKER_MAP[agsSimpleMarkerSymbol.style]; // marker style, default is "circle" 					
		    		olStyle['strokeDashstyle'] = _AGS_OL_SIMPLE_LINESYMBOL_MAP[agsSimpleMarkerSymbol.outline.style] || "solid"; // marker outline style, default is "solid" 		    		 
					olStyle['strokeWidth'] = agsSimpleMarkerSymbol.outline.width || 1; // marker outline width, default is 1		    		
		    		olStyle['strokeColor'] = agsSimpleMarkerSymbol.outline.color.toHex() || "#ee9900"; // marker outline color, default is "#ee9900"  
		    		olStyle['strokeOpacity'] = agsSimpleMarkerSymbol.outline.color.toRgba()[3] || 1.0; // marker outline opacity, default is 1.0  
		    		return olStyle;
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsSymbol.SimpleMarkerSymbol...missing or invalid SimpleMarkerSymbol...");
	    	 		throw "...AgsAdapter.parseAgsSymbol.SimpleMarkerSymbol...invalid or invalid SimpleMarkerSymbol..." + agsSimpleMarkerSymbol;
	    		}	    		
	    	},
	    	
			/**
	    	 * APIMethod: parseAgsSymbol.PictureMarkerSymbol
	    	 *   converts an esri.symbol.PictureMarkerSymbol object to an object for OpenLayers style 
	    	 *
	    	 * Parameters:
	     	 *   agsPictureMarkerSymbol - {esri.symbol.PictureMarkerSymbol} object 
		 	 *
	     	 * Returns: 
	      	 *   {} Object
	    	 */
	    	"PictureMarkerSymbol" : function(agsPictureMarkerSymbol) {
	    		if(_isDefined(agsPictureMarkerSymbol) && agsPictureMarkerSymbol instanceof esri.symbol.PictureMarkerSymbol) {
	    			var olStyle = {};		    				    		
					olStyle['pointRadius'] = agsPictureMarkerSymbol.size || 6; // external marker size in pixel, default is 6
					olStyle['externalGraphic'] = agsPictureMarkerSymbol.url || "../../img/marker.png"; // external marker url, default is "marker.png"
					olStyle['graphicWidth'] = agsPictureMarkerSymbol.width || 21; // external marker width, default is 21
					olStyle['graphicHeight'] = agsPictureMarkerSymbol.height || 25; // external marker height, default is 25
					olStyle['graphicXOffset'] = agsPictureMarkerSymbol.xoffset || 0; // external marker xoffset, default is 0
					olStyle['graphicYOffset'] = agsPictureMarkerSymbol.yoffset || 0; // external marker yoffset, default is 0 
		    		// TODO: angle		    		
					return olStyle;
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsSymbol.PictureMarkerSymbol...missing or invalid PictureMarkerSymbol...");
	    	 		throw "...AgsAdapter.parseAgsSymbol.PictureMarkerSymbol...invalid or invalid PictureMarkerSymbol..." + agsPictureMarkerSymbol;
	    		}	
	    	},
			
	    	/**
	    	 * APIMethod: parseAgsSymbol.SimpleLineSymbol
	    	 *   converts an esri.symbol.SimpleLineSymbol object to an object for OpenLayers style 
	    	 *
	    	 * Parameters:
	     	 *   agsSimpleLineSymbol - {esri.symbol.SimpleLineSymbol} object 
		 	 *
	     	 * Returns: 
	      	 *   {} Object
	    	 */	
	    	"SimpleLineSymbol" : function(agsSimpleLineSymbol) {
	    		if(_isDefined(agsSimpleLineSymbol) && agsSimpleLineSymbol instanceof esri.symbol.SimpleLineSymbol) {
		    		var olStyle = {};
		    		olStyle['strokeDashstyle'] = _AGS_OL_SIMPLE_LINESYMBOL_MAP[agsSimpleLineSymbol.style] || "solid"; // line style, default is "solid" 		    		 
					olStyle['strokeWidth'] = agsSimpleLineSymbol.width || 1; // line width, default is 1		    		
		    		olStyle['strokeColor'] = agsSimpleLineSymbol.color.toHex() || "#ee9900"; // line color, default is "#ee9900"  
		    		olStyle['strokeOpacity'] = agsSimpleLineSymbol.color.toRgba()[3] || 1.0; // line opacity, default is 1.0  		    		
		    		return olStyle;
		    	} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsSymbol.SimpleLineSymbol...missing or invalid SimpleLineSymbol...");
	    	 		throw "...AgsAdapter.parseAgsSymbol.SimpleLineSymbol...missing or invalid SimpleLineSymbol..." + agsSimpleLineSymbol;
	    		}	 
	    	},
	    	
	    	"CartographicLineSymbol" : function(agsCartographicLineSymbol) {
	    		// TODO: to be implemented
	    	},
	    	
			/**
	    	 * APIMethod: parseAgsSymbol.SimpleFillSymbol
	    	 *   converts an esri.symbol.SimpleFillSymbol object to an object for OpenLayers style 
	    	 *
	    	 * Parameters:
	     	 *   agsSimpleFillSymbol - {esri.symbol.SimpleFillSymbol} object 
		 	 *
	     	 * Returns: 
	      	 *   {} Object
	    	 */	
	    	"SimpleFillSymbol" : function(agsSimpleFillSymbol) {
	    		if(_isDefined(agsSimpleFillSymbol) && agsSimpleFillSymbol instanceof esri.symbol.SimpleFillSymbol) {
		    		var olStyle = {};
		    		olStyle['fillColor'] = agsSimpleFillSymbol.color.toHex() || "#ee9900"; // fillColor, default "#ee9900"
		    		olStyle['fillOpacity'] = agsSimpleFillSymbol.color.toRgba()[3] || 0.49; // fillOpacity, default is 0.49   				    		 				
		    		// TODO: 'fillStyle' like "STYLE_BACKWARD_DIAGONAL", "STYLE_VERTICAL", etc. are not supported in OpenLayers
					olStyle['strokeDashstyle'] = _AGS_OL_SIMPLE_LINESYMBOL_MAP[agsSimpleFillSymbol.outline.style] || "solid"; // outline style, default is "solid" 		    		 
					olStyle['strokeWidth'] = agsSimpleFillSymbol.outline.width || 1; // outline width, default is 1		    		
		    		olStyle['strokeColor'] = agsSimpleFillSymbol.outline.color.toHex() || "#ee9900"; // outline color, default is "#ee9900"  
		    		olStyle['strokeOpacity'] = agsSimpleFillSymbol.outline.color.toRgba()[3] || 1.0; // outline opacity, default is 1.0  
		    		return olStyle;
		    	} else {
	    			OpenLayers.Console.error("...AgsAdapter.parseAgsSymbol.SimpleFillSymbol...missing or invalid SimpleFillSymbol...");
	    	 		throw "...AgsAdapter.parseAgsSymbol.SimpleFillSymbol...missing or invalid SimpleFillSymbol..." + agsSimpleFillSymbol;
	    		}
	    	},
	    	
	    	"PictureFillSymbol" : function(agsPictureFillSymbol) {
	    		// TODO: to be implemented
	    	}
	    };
	    
	    /**
	     * APIMethod: parseAgsSpatialReference
	     *   converts esri.SpatialReference object to a String representing a projection in OpenLayers
	     *
	     * Parameters:
	     *   agsSpatialReference - {esri.SpatialReference} object 
		 *
	     * Returns: 
	     *   {String}  
	     */   
	    this.parseAgsSpatialReference = function(agsSpatialReference) {
	    	var olGeometrySpatialReference = null;    	
	    	if(_isDefined(agsSpatialReference.wkid) && agsSpatialReference instanceof esri.SpatialReference) {
	    		// check whether wkid of same spatial reference could be different in OpenLayers and ArcGIS Server JS
	    		//   e.g. wkid of spheric mecator in AgsJs is "102113" but "900913" in OpenLayers 
	    		var olWkid = _toOlWkid(agsSpatialReference.wkid);
	    		olGeometrySpatialReference = "EPSG:" + olWkid;
	    		return olGeometrySpatialReference;
	    	} else {
	    		OpenLayers.Console.error("...AgsAdapter.parseAgsSpatialReference...missing or invalid esri.SpatialReference...");
	    		throw "...AgsAdapter.parseAgsSpatialReference...missing or invalid esri.SpatialReference..." + agsSpatialReference;
	    	}	    	
	    };
	    
	    /**
	     * APIMethod: parseAgsGraphic
	     *   converts esri.Graphic object to OpenLayers.Feature.Vector
	     *
	     * Parameters:
	     *   agsGraphic - {esri.Graphic} object 
		 *
	     * Returns: 
	     *   {OpenLayers.Feature.Vector} object 
	     */
	    this.parseAgsGraphic = function(agsGraphic) {
	    	var olFeature = null;
	    	var geometryType = null;
	    	var geometry = null;
	    	var style = null;
	    	
	    	if(_isDefined(agsGraphic.geometry.type)) {
	    		geometryType = agsGraphic.geometry.type;
	    	} else {
	    		OpenLayers.Console.error("...AgsAdapter.parseAgsGraphic...invalid esri.Graphic...");
	    		throw "...AgsAdapter.parseAgsGraphic...invalid esri.Graphic..." + agsGraphic;
	    	}    	
	    	try {
	    		geometry = this.parseAgsGeometry[geometryType].apply(this, [agsGraphic.geometry]);
	    	} catch(e) {
	    		throw e;
	    	}
	    	if(_isDefined(geometry)) {
	    		var attributes = agsGraphic.attributes;
	    		// parse 'infoTemplate' from esri.Graphic
	    		if(_isDefined(agsGraphic.infoTemplate)) {
	    			attributes['infoTemplateTitle'] = agsGraphic.infoTemplate.title ? agsGraphic.infoTemplate.title : "";
	    			attributes['infoTemplateContent'] = agsGraphic.infoTemplate.content ? agsGraphic.infoTemplate.content : "";    		
	    		}
	    		// parse 'symbol' from esri.Graphic    		
	    		if(_isDefined(agsGraphic.symbol)) {	    			
	    			try {	    			 
	    				if(_isDefined(agsGraphic.symbol.type)) {
							// select symbol parser based on agsGraphic.symbol.type
							style = this.parseAgsSymbol[_OL_AGS_STYLE_MAP[agsGraphic.symbol.type]].apply(this, [agsGraphic.symbol]);
						} else {
							// select symbol parser based on geometry type
							style = this.parseAgsSymbol[_OL_AGS_STYLE_MAP[geometry.CLASS_NAME]].apply(this, [agsGraphic.symbol]);	
						}						
	    			} catch(e) {
	    				throw e;
	    			}  		    		
	    		}
	    		olFeature = new OpenLayers.Feature.Vector(geometry, attributes, style);
	    		return olFeature;
	    	} else {
	    		OpenLayers.Console.error("...AgsAdapter.parseAgsGraphic...invalid esri.Graphic.geometry...");
	    		throw "...AgsAdapter.parseAgsGraphic...invalid esri.Graphic.geometry..." + agsGraphic;
	    	}    	
	    };
	    
	    /**
	     * APIMethod: parseAgsGraphics
	     *   parses an array of esri.Graphic object to an array of OpenLayers.Feature.Vector
	     *   
	     * Parameters:
	     *   agsGraphics - {Array of esri.Graphic} Array
	     *   
	     * Returns:
	     *   {Array of OpenLayers.Feature.Vector} Array
	     */
	    this.parseAgsGraphics = function(agsGraphics) {
	    	 var olFeatures = [];
	    	 if(_isDefined(agsGraphics) && agsGraphics instanceof Array) {
	    	 	for(var i=0; i<agsGraphics.length; i++) {
	    	 		try {
	    	 			var olFeature = this.parseAgsGraphic.apply(this, [agsGraphics[i]]);
	    	 			olFeatures.push(olFeature);
	    	 		} catch(e) {
	    	 			throw e;
	    	 		}
	    	 	}
	    	 	return olFeatures;
	    	 } else {
	    	 	OpenLayers.Console.error("...AgsAdapter.parseAgsGraphics...invalid esri.Graphic array...");
	    	 	throw "...AgsAdapter.parseAgsGraphic...invalid esri.Graphic array..." + agsGraphics;
	    	 }	    	 
	    };
	    
	    /**
	     * APIMethod: parseAgsResults
	     *   parses results object of ags tasks to OpenLayers.Feature.Vector or array of OpenLayers.Feature.Vector
	     *   ags tasks results object include: IdentifyResult, AddressCandidate, FeatureSet, FindResult
	     */
	    this.parseAgsResults = {	    		    
		    /**
		     * APIMethod: parseAgsIdentifyResult
		     *   parses esri.tasks.IdentifyResult object to OpenLayers.Feature.Vector
		     *
		     * Parameters:
		     *   agsGraphic - {esri.tasks.IdentifyResult} object 
			 *
		     * Returns: 
		     *   {OpenLayers.Feature.Vector} object 
		     */
		    'identifyResult': function(agsIdentifyResult) {
		    	var olFeature = null;
		    	if(_isDefined(agsIdentifyResult.feature)) {
		    		try {
		    			olFeature = this.parseAgsGraphic.apply(this, [agsIdentifyResult.feature]);
		    		} catch(e) {
		    			throw e;
		    		}
		    		if(_isDefined(agsIdentifyResult.displayFieldName)) {
		    			olFeature.attributes['displayFieldName'] = agsIdentifyResult.displayFieldName;
		    		}	    		
		    		if(_isNumber(agsIdentifyResult.layerId) && agsIdentifyResult.layerId >= 0) { 
		    			olFeature.attributes['layerId'] = agsIdentifyResult.layerId;
		    		}
		    		if(_isDefined(agsIdentifyResult.layerName)) {
		    			olFeature.attributes['layerName'] = agsIdentifyResult.layerName;
		    		}
		    		return olFeature;
		    	} else {
		    		OpenLayers.Console.error("...AgsAdapter.parseAgsResults.identifyResult...parses esri.tasks.IdentifyResult...missing or invalid feature in IdentifyResult...");
		    		throw "...AgsAdapter.parseAgsResults.identifyResult...parses esri.tasks.IdentifyResult...missing or invalid feature in IdentifyResult..." + agsIdentifyResult;
		    	}	    	
		    },
		    
		    /**
		     * APIMethod: parseAgsIdentifyResults
		     *   parses an array of esri.tasks.IdentifyResult object to an array of OpenLayers.Feature.Vector
		     *   
		     * Parameters:
		     *   agsIdentifyResults - {Array of esri.tasks.IdentifyResult} Array
		     *   
		     * Retures:
		     *   {Array of OpenLayers.Feature.Vector} Array
		     */
		    'identifyResults': function(agsIdentifyResults) {
		    	var olFeatures = [];
		    	 if(_isDefined(agsIdentifyResults) && agsIdentifyResults instanceof Array) {
		    	 	for(var i=0; i<agsIdentifyResults.length; i++) {
		    	 		try {
		    	 			var olFeature = this.parseAgsResults['identifyResult'].apply(this, [agsIdentifyResults[i]]);
		    	 			olFeatures.push(olFeature);
		    	 		} catch(e) {
		    	 			throw e;
		    	 		}
		    	 	}
		    	 	return olFeatures;
		    	 } else {
		    	 	OpenLayers.Console.error("...AgsAdapter.parseAgsResults.identifyResults...parses array esri.tasks.IdentifyResult...missing or invalid array...");
		    	 	throw "...AgsAdapter.parseAgsResults.identifyResults...parses array esri.tasks.IdentifyResult...missing or invalid array..." + agsIdentifyResults;
		    	 }	    	 
		    },
		    
		    /**
		     * APIMethod: parseAddressCandidate
		     *   parses esri.tasks.AddressCandidate object to OpenLayers.Feature.Vector
		     *
		     * Parameters:
		     *   agsAddressCandidate - {esri.tasks.AddressCandidate} object 
			 *
		     * Returns: 
		     *   {OpenLayers.Feature.Vector} object 
		     */ 
		    'addressCandidate': function(agsAddressCandidate) {
		    	var olFeature = null;
		    	var geometry = null;
		    	var attributes = {};    	
		    	if(_isDefined(agsAddressCandidate.location)) {
		    		try {
		    			geometry = this.parseAgsGeometry['point'].apply(this, [agsAddressCandidate.location]);
		    		} catch(e) {
		    			throw e;
		    		}
		    		if(_isDefined(agsAddressCandidate.address)) {
			    		if(typeof agsAddressCandidate.address === "string") {
			    			attributes['address'] = agsAddressCandidate.address;
			    		} else { 			    		
				    		for(key in agsAddressCandidate.address) {
				    			if(typeof agsAddressCandidate.address[key] === "string") {
				    				attributes['addr_' + key] = agsAddressCandidate.address[key];
				    			}
				    		}   
			    		} 		
			    	}
			    	if(_isDefined(agsAddressCandidate.attributes)) {
			    		//attributes['attributes'] = agsAddressCandidate.attributes;	
			    		for(key in agsAddressCandidate.attributes) {
			    			if(typeof agsAddressCandidate.attributes[key] === "string") {
			    				attributes['attr_' + key] = agsAddressCandidate.attributes[key];
			    			}
			    		}    		
			    	}
			    	if(_isDefined(agsAddressCandidate.score)) {
			    		attributes['score'] = agsAddressCandidate.score;
			    	}
			    	olFeature = new OpenLayers.Feature.Vector(geometry, attributes);
		    		return olFeature;
		    	} else {
		    		OpenLayers.Console.error("...AgsAdapter.parseAgsResults.addressCandidate...parses an agsAddressCandidates...missing or invalid 'location'...");
		    		throw "...AgsAdapter.parseAgsResults.addressCandidate...parses an agsAddressCandidates...missing or invalid 'location'..." + agsAddressCandidate;
		    	}        		    	
		    },
		    
		    /**
		     * APIMethod: parseAddressCandidates
		     *   parses an array of esri.tasks.AddressCandidate object to an array of OpenLayers.Feature.Vector
		     *   
		     * Parameters:
		     *   agsAddressCandidates - {Array of esri.tasks.AddressCandidate}
		     *   
		     * Returns:
		     *   {Array of esri.tasks.AddressCandidate} Array
		     */
		    'addressCandidates': function(agsAddressCandidates) {
		   		var olFeatures = [];
		    	if(_isDefined(agsAddressCandidates) && agsAddressCandidates instanceof Array) {
		    		for(var i=0; i<agsAddressCandidates.length; i++) {
		    	 		try {
		    	 			var olFeature = this.parseAgsResults['addressCandidate'].apply(this, [agsAddressCandidates[i]]);
		    	 			olFeatures.push(olFeature);
		    	 		} catch(e) {
		    	 			throw e;
		    	 		}
		    	 	}
		    		return olFeatures;
		    	} else {
		    	 	OpenLayers.Console.error("...AgsAdapter.parseAgsResults.addressCandidates...parses array agsAddressCandidates...missing or invalid array...");
		    		throw "...AgsAdapter.parseAgsResults.addressCandidates...parses array agsAddressCandidates...missing or invalid array..." + agsAddressCandidates;
		    	}	    	
		    },
		    
		    /**
		     * APIMethod: parseAgsFindResult
		     *   parses esri.tasks.FindResult object to OpenLayers.Feature.Vector
		     *
		     * Parameters:
		     *   agsFindResult - {esri.tasks.FindResult} object 
			 *
		     * Returns: 
		     *   {OpenLayers.Feature.Vector} object 
		     */ 
		    'findResult': function(agsFindResult) {    	
		    	var olFeature = null;	    	
		    	if(_isDefined(agsFindResult.feature)) {
		    		var agsGraphic = agsFindResult.feature;
		    		try {
		    			olFeature = this.parseAgsGraphic.apply(this, [agsGraphic]);
		    		} catch(e) {
		    			throw e;
		    		}
		     		if(_isDefined(agsFindResult.displayFieldName)) {
		     			olFeature.attributes['displayFieldName'] = agsFindResult.displayFieldName;
		     		}
		     		if(_isDefined(agsFindResult.foundFieldName)) {
		     			olFeature.attributes['foundFieldName'] = agsFindResult.foundFieldName;
		     		}
		     		if(_isNumber(agsFindResult.layerId) && agsFindResult.layerId >= 0) {
		     			olFeature.attributes['layerId'] = agsFindResult.layerId;
		     		}
		     		if(_isDefined(agsFindResult.layerName)) {
		     			olFeature.attributes['layerName'] = agsFindResult.layerName;
		     		} 
		     		return olFeature;
		     	} else {
		    		OpenLayers.Console.error("...AgsAdapter.parseAgsResults.findResult...parse esri.tasks.FindResult...missing or invalid FindResult...");    		
		    		throw "...AgsAdapter.parseAgsResults.findResult...parse esri.tasks.FindResult...missing or invalid FindResult..." + agsFindResult;
		    	}    	 	    	
		    },
		    
		    /**
		     * APIMethod: parseAgsFindResults
		     *   parses an array of esri.tasks.FindResult object to an array of OpenLayers.Feature.Vector
		     *   
			 * Parameters:
			 *   agsFindResults - {Array of esri.tasks.FindResult} Array
		     *
		     * Returns:
		     *   {Array of OpenLayers.Feature.Vector} object
		     */
		    'findResults': function(agsFindResults) {
		    	var olFeatures = [];	    	
		    	if(_isDefined(agsFindResults) && agsFindResults instanceof Array) {
		    		for(var i=0; i<agsFindResults.length; i++) {
		    	 		try {
		    	 			var olFeature = this.parseAgsResults['findResult'].apply(this, [agsFindResults[i]]);
		    	 			olFeatures.push(olFeature);
		    	 		} catch(e) {
		    	 			throw e;
		    	 		}
		    	 	}
		    	 	return olFeatures;
		    	} else {
		    	 	OpenLayers.Console.warn("...AgsAdapter.parseAgsResults.findResults...parse array of agsFindResults...missing or invalid array...");
		    		throw "...AgsAdapter.parseAgsResults.findResults...parse array of agsFindResults...missing or invalid array..." + agsFindResults
		    	}
		    },
		    
		    /**
		     * APIMethod: parseAgsFeatureSet
		     *   parses esri.tasks.FeatureSet object to array of OpenLayers.Feature.Vector
		     *
		     * Parameters:
		     *   agsFeatureSet - {esri.tasks.FeatureSet} object
			 *
		     * Returns: 
		     *   {Array of OpenLayers.Feature.Vector} Array 
		     */ 
		    'featureSet': function(agsFeatureSet) {
		    	var olFeatures = [];
		    	if(_isDefined(agsFeatureSet.features)) {
		    		try {
		    			var agsGraphics = agsFeatureSet.features;    		
		    			olFeatures = this.parseAgsGraphics.apply(this, [agsGraphics]);
		    		} catch(e) {
		    			throw e;
		    		}
		     		return olFeatures;
		     	} else {
		    		OpenLayers.Console.warn("...AgsAdapter.parseAgsResults.featureSet...parse esri.tasks.FeatureSet...missing or invalid FeatureSet...");    		
		    		throw "...AgsAdapter.parseAgsResults.featureSet...parse esri.tasks.FeatureSet...missing or invalid FeatureSet..." + agsFeatureSet;
		    	}    	 	    	
		    },
			
			/**
			 * APIMethod: parseAgsAreasAndLengths
			 *   parses structure results of a 'length'/'areasAndLengths' operation of an esri.tasks.GeometryService
			 *   
			 * Parameters:
			 *   agsAreasAndLengths - {object} object
			 * 
			 * Returns:
			 *   {object} object
			 *   {
			 *   	areas: [],
			 *   	lengths: []
			 *   }
			 */
			'areasAndLengths': function(agsAreasAndLengths) {
				if(_isDefined(agsAreasAndLengths.areas) || _isDefined(agsAreasAndLengths.lengths)) {
					return agsAreasAndLengths;
				} else {
					OpenLayers.Console.warn("...AgsAdapter.parseAgsResults.areasAndLengths...parse esri areasAndLengths...missing or invalid areasAndLengths...");    		
		    		throw "...AgsAdapter.parseAgsResults.areasAndLengths...parse esri areasAndLengths...missing or invalid areasAndLengths..." + agsAreasAndLengths;
				}
			},
			
			/**
			 * APIMethod: parseAgsRelations
			 *   parses a single 'relation' in result of relation operation of an esri.tasks.GeometryService
			 *   
			 * Parameters:
			 *   agsRelation - {object} object
			 * 
			 * Returns:
			 *   {object} object
			 *   
			 */
			'relation': function(agsRelation) {				
				var olRelation = {};
				if(_isDefined(agsRelation.geometry1Index) && _isDefined(agsRelation.geometry2Index)) {
					olRelation.geometry1Index = agsRelation.geometry1Index;
					olRelation.geometry2Index = agsRelation.geometry2Index;
				} else {
					OpenLayers.Console.warn("...AgsAdapter.parseAgsResults.relation...parse esri relation result...missing or invalid relation result...");    		
		    		throw "...AgsAdapter.parseAgsResults.relation...parse esri relation result...missing or invalid relation result..." + agsRelation;
				}
				
				if(_isDefined(agsRelation.graphic1) && _isDefined(agsRelation.graphic2)) {
					try {
						olRelation.feature1 = this.parseAgsGraphic.apply(this, [agsRelation.graphic1]);;
						olRelation.feature2 = this.parseAgsGraphic.apply(this, [agsRelation.graphic2]);;
					} catch(e) {
						throw e;
					}
				} else {
					OpenLayers.Console.warn("...AgsAdapter.parseAgsResults.relation...parse esri relation result...missing or invalid relation result...");    		
		    		throw "...AgsAdapter.parseAgsResults.relation...parse esri relation result...missing or invalid relation result..." + agsRelation;
				}
				return olRelation;
			},
			
			/**
			 * APIMethod: parseAgsRelations
			 *   parses structure results of a 'relation' operation of an esri.tasks.GeometryService
			 *   
			 * Parameters:
			 *   agsRelations - {object} object
			 * 
			 * Returns:
			 *   {object} object
			 *   
			 */
			'relations': function(agsRelations) {				
				var olRelations = [];
				if(_isDefined(agsRelations) && agsRelations instanceof Array) {
					try {
						for(var i=0; i<agsRelations.length; i++) {
							var olRelation = this.parseAgsResults['relation'].apply(this, [agsRelations[i]]);
		    	 			olRelations.push(olRelation);	
						}						
					} catch(e) {
						throw e;
					}
 				} else {
					OpenLayers.Console.warn("...AgsAdapter.parseAgsResults.relationw...parse esri relation result array...missing or invalid relation result array...");    		
		    		throw "...AgsAdapter.parseAgsResults.relationw...parse esri relation result array...missing or invalid relation result array..." + agsRelations;
				}
				return olRelations;
			},
			
			/**
			 * APIMethod: parseAgsDirectionFeatureSet
			 *   parses an esri.tasks.DirectionFeatureSet to an OpenLayers feature
			 *   
			 * Parameters:
			 *   agsDirectionFeatureSet - {esri.tasks.DirectionFeatureSet} object
			 * 
			 * Returns:
			 *   OpenLayers.Feature.Vector
			 */
			'directionsFeatureSet': function(agsDirectionsFeatureSet){
				var olFeature = null;	    	
		    	if(_isDefined(agsDirectionsFeatureSet.mergedGeometry)) {
		    		
					var agsPolyline = agsDirectionsFeatureSet.mergedGeometry;
					var agsExtent = agsDirectionsFeatureSet.extent;
		    		
					var olMultiLineString = this.parseAgsGeometry['polyline'].apply(this, [agsPolyline]);
					
					var attributes = {};
					if(agsExtent != null) {
						var olExtent = this.parseAgsGeometry['extent'].apply(this, [agsExtent]);
						attributes['extent'] = olExtent;
					}										
					attributes['routeId'] = agsDirectionsFeatureSet.routeId || "";
					attributes['routeName'] = agsDirectionsFeatureSet.routeName || "";
					attributes['totalDriveTime'] = agsDirectionsFeatureSet.totalDriveTime || 0;
					attributes['totalLength'] = agsDirectionsFeatureSet.totalLength || 0;
					attributes['totalTime'] = agsDirectionsFeatureSet.totalTime || 0;
					
					olFeature = new OpenLayers.Feature.Vector(olMultiLineString, attributes);
		     		return olFeature;
		     	} else {
		    		OpenLayers.Console.error("...AgsAdapter.parseAgsResults.directionsFeatureSet...parse esri.tasks.DirectionFeatureSet...missing or invalid FindResult...");    		
		    		throw "...AgsAdapter.parseAgsResults.directionsFeatureSet...parse esri.tasks.DirectionFeatureSet...missing or invalid DirectionFeatureSet..." + agsDirectionFeatureSet;
		    	}   
			},
			
			/**
			 * APIMethod: parseAgsRouteResult
			 *   parses an esri.tasks.RouteResult to an OpenLayers 
			 *   
			 * Parameters:
			 *   agsRouteResult - {esri.tasks.RouteResult} object
			 * 
			 * Returns:
			 *   object
			 */
			'routeResult': function(agsRouteResult){				
				var olRouteResult = {};				
				try {
					if(_isDefined(agsRouteResult.directions)) {
						olRouteResult.directions = this.parseAgsResults['directionsFeatureSet'].apply(this, [agsRouteResult.directions]);						
					}				
					if(_isDefined(agsRouteResult.route)) {
						olRouteResult.route = this.parseAgsGraphic.apply(this, [agsRouteResult.route]);
					}				
					if(_isDefined(agsRouteResult.routeName)) {
						olRouteResult.routeName = agsRouteResult.routeName;
					}				
					if(_isDefined(agsRouteResult.stops)) {
						olRouteResult.stops = this.parseAgsGraphics.apply(this, [agsRouteResult.stops]);
					}	
					return olRouteResult;
				} catch(e) {
					throw e;
				}										
			},
			
			/**
			 * APIMethod: parseAgsRouteResults
			 *   parses an esri.tasks.RouteResult to an array of OpenLayers vectors 
			 *   
			 * Parameters:
			 *   agsRouteResults - {[esri.tasks.RouteResult]} object
			 * 
			 * Returns:
			 *   array
			 */
			'routeResults': function(agsRouteResults, args_list){				
				var olRouteResults = [];
				if(_isDefined(agsRouteResults) && agsRouteResults instanceof Array) {
					try {
						for(var i=0; i<agsRouteResults.length; i++) {
							var olRouteResult = this.parseAgsResults['routeResult'].apply(this, [agsRouteResults[i]]);
		    	 			// since the final output of routeResults parse must be an array of OpenLayers features
							//   so all routes, stops, barriers must be added in the same array with different styles
							
							// add 'route' or 'direction' to results
							if(_isDefined(olRouteResult.route) && olRouteResult.route instanceof OpenLayers.Feature.Vector) {
								// if 'route' is returned then add it to results, otherwise check returned direction
								olRouteResult.route.style = _OL_ROUTETASK_STYLE['route'];
								olRouteResults.push(olRouteResult.route);
							} else if(_isDefined(olRouteResult.directions) && olRouteResult.directions instanceof OpenLayers.Feature.Vector) {
								// add 
								olRouteResult.directions.style = _OL_ROUTETASK_STYLE['route'];
								olRouteResults.push(olRouteResult.directions);
							}
							// add 'stops' to the results
							if(_isDefined(olRouteResult.stops) && olRouteResult.stops instanceof Array) {
								for(var i=0; i<olRouteResult.stops.length; i++) {
									if(olRouteResult.stops[i] instanceof OpenLayers.Feature.Vector) {
										olRouteResult.stops[i].style = _OL_ROUTETASK_STYLE['stop'];
									}
									olRouteResults.push(olRouteResult.stops[i]);
									OpenLayers.Console.debug("...stop in route results has been added...");
								}	
							}																												
						}
						// add 'barriers' to the results
						// according to AGS JS API, 'barriers' array is the 2nd input parameter of callback method
						//   so take 'barriers' from args_list[1]
						if(_isDefined(args_list[1]) && args_list[1] instanceof Array) {
							var barriers = args_list[1];
							var olBarriers = this.parseAgsGraphics.apply(this, [barriers]);
							for(var i=0; i<olBarriers.length; i++) {
								if(olBarriers[i] instanceof OpenLayers.Feature.Vector) {
									olBarriers[i].style = _OL_ROUTETASK_STYLE['barrier'];
								}
								olRouteResults.push(olBarriers[i]);
							}	
						}													
					} catch(e) {						
						throw e;
					}
 				} else {
					OpenLayers.Console.warn("...AgsAdapter.parseAgsResults.relations...parse esri route results array...missing or invalid route results array...");    		
		    		throw "...AgsAdapter.parseAgsResults.relations...parse esri route results array...missing or invalid route results array..." + agsRouteResults;
				}
				return olRouteResults;
			},
		};
	    
	    /**
	     * APIMethod: encodeAgsUnit
	     *   take a general unit string to internal unit representation in AgsJs
	     *   see static attribute _AGS_UNITS
	     *
	     * Parameters:
	     *   olUnit - {String}
	     *
	     * Returns:
	     *   {number}	     
	     */
		this.encodeAgsUnit = function(olUnit) {
			if(_isDefined(olUnit)) {
				if(_isDefined(_AGS_UNITS[olUnit])) {
					return _AGS_UNITS[olUnit];
				} else {
					OpenLayers.Console.error("...AgsAdapter.encodeAgsUnit...encode ags unit...unit string not supported...");
					throw "...AgsAdapter.encodeAgsUnit...encode ags unit...unit string not supported..." + olUnit;
				}				
			} else {
				OpenLayers.Console.error("...AgsAdapter.encodeAgsUnit...encode ags unit...missing or invalid unit string...");
				throw "...AgsAdapter.encodeAgsUnit...encode ags unit...missing or invalid unit string..." + olUnit;
			}
		};
		
		/**
	     * APIMethod: encodeAgsSpatialReference
	     *   parses a String representing a projection in OpenLayers to esri.SpatialReference object 
	     *
	     * Parameters:
	     *   {String} - olSpatialReference
		 *
	     * Returns: 
	     *   agsSpatialReference - {esri.SpatialReference} object   
	     */
		this.encodeAgsSpatialReference = function(olSpatialReference) {
	    	if(!_isDefined(olSpatialReference)) {
	    		OpenLayers.Console.error("...AgsAdapter.encodeAgsSpatialReference...encode ags spatial reference...missing or invalid input spatial reference...");
	    		throw "...AgsAdapter.encodeAgsSpatialReference...encode ags spatial reference...missing or invalid input spatial reference..." + olSpatialReference;
	    	}	    	
	    	// expect a OpenLayers spatial reference string in syntax "EPSG:XXXXX"	    	
	    	var namespace = olSpatialReference.split(":")[0];
	    	//var identifier = olSpatialReference.split(":")[1];
			var identifier = olSpatialReference.split(":")[1];
				    	
	    	if(namespace === "EPSG" && _isDefined(identifier)) {
	    		var agsSpatialReference = {};
	    		agsSpatialReference['wkid'] = parseInt(_toAgsWkid(identifier));
	    		return new esri.SpatialReference(agsSpatialReference);
	    	} else {
	    		OpenLayers.Console.error("...AgsAdapter.encodeAgsSpatialReference...encode ags spatial reference...invalid spatial reference in EPSG:XXXXX syntax...");
	    		throw "...AgsAdapter.encodeAgsSpatialReference...encode ags spatial reference...invalid spatial reference in EPSG:XXXXX syntax..." + olSpatialReference;
	    	}
	    };
	    
	    /**
	     * APIMethod: encodeAgsGeometry.*
	     *   encodes OpenLayers.Geometry.* object to esri.geometry.*
	     *
	     * Parameters:
	     *   olGeometry - {OpenLayers.Geometry.Geometry} object 
		 *
	     * Returns: 
	     *   {esri.geometry.Geometry} object 
	     */    
	    this.encodeAgsGeometry = {
	    	/**
		     * APIMethod: encodeAgsGeometry.point
		     *   encodes OpenLayers.Geometry.Point object to esri.geometry.Point
		     *
		     * Parameters:
		     *   olPoint - {OpenLayers.Geometry.Point} object 
		     *   olSpatialReference - {String} e.g. "EPSG:102113", "EPSG:4326" must be in syntax "Namespace:Idetifier"
			 *
		     * Returns: 
		     *   {esri.geometry.Point} object 
		     */
	    	'point': function(olPoint, olSpatialReference) {    		    		
	    		if(_isDefined(olPoint) && olPoint instanceof OpenLayers.Geometry.Point) { 
	    			var agsPoint = null;
	    			var agsSpatialReference = null;
	    			try {
	    				if(_isDefined(olSpatialReference)) {
	    					agsSpatialReference = this.encodeAgsSpatialReference(olSpatialReference);	
	    				} else {
	    					// if input spatial reference string is invalid, use default one
	    					agsSpatialReference = this.encodeAgsSpatialReference(this.config['defaultEncodeWkid']);
	    				}	    				
	    			} catch(e) {
	    				throw e;
	    			}	    			
	    			agsPoint = new esri.geometry.Point(olPoint.x, olPoint.y, agsSpatialReference);    				
	    			return agsPoint;
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.encodeAgsGeometry.point...encode esri.geometry.Point...missing or invalid OpenLayers.Geometry.Point...");
	    			throw "...AgsAdapter.encodeAgsGeometry.point...encode esri.geometry.Point...missing or invalid OpenLayers.Geometry.Point..." + olPoint;
	    		}
	    	},
	    	
	    	/**
		     * APIMethod: encodeAgsGeometry.coordinate
		     *   encodes OpenLayers.Geometry.Point object to array [x, y]
		     *
		     * Parameters:
		     *   olPoint - {OpenLayers.Geometry.Point} object 	    
			 *
		     * Returns: 
		     *   {Array} [x, y] 
		     */
	    	'coordinate': function(olPoint) {
	        	if(_isDefined(olPoint) && olPoint instanceof OpenLayers.Geometry.Point) {   				
					var agsCoordinate = new Array();			
	   				agsCoordinate.push(olPoint.x);
	   				agsCoordinate.push(olPoint.y);	   						   				
					return agsCoordinate;
	   			} else {
	   				OpenLayers.Console.error("...AgsAdapter.encodeAgsGeometry.coordinate...encode [x, y]...missing or invalid OpenLayers.Geometry.Point...");
	   				throw "...AgsAdapter.encodeAgsGeometry.coordinate...encode [x, y]...missing or invalid OpenLayers.Geometry.Point..." + olPoint;
	   			} 
	        },
	        
	        /**
		     * APIMethod: encodeAgsGeometry.path
		     *   encodes OpenLayers.Geometry.LineString object to array of array [x, y]
		     *
		     * Parameters:
		     *   olLineString - {OpenLayers.Geometry.LineString} object 	    
			 *
		     * Returns: 
		     *   {Array of [x, y]} Array 
		     */
	        'path': function(olLineString) {
	        	if(_isDefined(olLineString) && olLineString instanceof OpenLayers.Geometry.LineString) {   				
					var agsPath = new Array();
					for(var i=0; i<olLineString.components.length; i++) {
	     				var olPoint = olLineString.components[i];
	     				try {
	     					var agsCoordinate = this.encodeAgsGeometry['coordinate'].apply(this, [olPoint]);
	     			 		agsPath.push(agsCoordinate);
	     				} catch(e) {
	     					throw e;
	     				}
	     			}
	     			return agsPath;
	   			} else {
	   				OpenLayers.Console.error("...AgsAdapter.encodeAgsGeometry.path...encode array of [x, y]...missing or invalid OpenLayers.Geometry.LineString...");
	   				throw "...AgsAdapter.encodeAgsGeometry.path...encode array of [x, y]...missing or invalid OpenLayers.Geometry.LineString..." + olLineString;
	   			}      			
	        },
	        
	        /**
		     * APIMethod: encodeAgsGeometry.linearring
		     *   encodes OpenLayers.Geometry.LinearRing object to array of array [x, y]
		     *
		     * Parameters:
		     *   olLinearRing - {OpenLayers.Geometry.LinearRing} object 	    
			 *
		     * Returns: 
		     *   {Array of [x, y]} Array 
		     */
	        'linearring': function(olLinearRing) {
	        	if(_isDefined(olLinearRing) && olLinearRing instanceof OpenLayers.Geometry.LinearRing) {   				
					var agsRing = new Array();
					// check if linearring is a closed ring
					var beginPoint = olLinearRing.components[0];
					var endPoint = olLinearRing.components[olLinearRing.components.length-1];
					if(_isSameOLPoint(beginPoint, endPoint) == false) {
						OpenLayers.Console.error("...AgsAdapter.parseAgsGeometry.ring...not a closed ring...");
	    				throw "...AgsAdapter.encodeAgsGeometry.linearring...not a closed ring..." + olLinearRing;
					}
					for(var i=0; i<olLinearRing.components.length; i++) {
	     				var olPoint = olLinearRing.components[i];
	     				try {
	     					var agsCoordinate = this.encodeAgsGeometry['coordinate'].apply(this, [olPoint]);
	     			 		agsRing.push(agsCoordinate);
	     				} catch(e) {
	     					throw e;
	     				}
	     			}
	     			return agsRing;
	   			} else {
	   				OpenLayers.Console.error("...AgsAdapter.encodeAgsGeometry.linearring...encode array of [x, y]...missing or invalid OpenLayers.Geometry.LinearRing...");
	   				throw "...AgsAdapter.encodeAgsGeometry.linearring...encode array of [x, y]...missing or invalid OpenLayers.Geometry.LinearRing..." + olLinearRing;
	   			}      			
	        },
	    	
	    	/**
		     * APIMethod: encodeAgsGeometry.polyline
		     *   encodes OpenLayers.Geometry.MultiLineString object to esri.geometry.Polyline
		     *
		     * Parameters:
		     *   olMultiLineString - {OpenLayers.Geometry.MultiLineString} object 
		     *   olSpatialReference - {String} e.g. "EPSG:102113", "EPSG:4326" must be in syntax "Namespace:Idetifier"
			 *
		     * Returns: 
		     *   {esri.geometry.Polyline} object 
		     */
	    	'polyline': function(olMultiLineString, olSpatialReference) {
	    		if(_isDefined(olMultiLineString) && olMultiLineString instanceof OpenLayers.Geometry.MultiLineString) {   				
					var agsPolyline = new esri.geometry.Polyline();
					var agsSpatialReference = null;
					try {
						if(_isDefined(olSpatialReference)) {
	    					agsSpatialReference = this.encodeAgsSpatialReference(olSpatialReference);	
	    				} else {
	    					// if input spatial reference string is invalid, use default one
	    					agsSpatialReference = this.encodeAgsSpatialReference(this.config['defaultEncodeWkid']);
	    				} 
					} catch(e) {
						throw e;
					}
					agsPolyline.spatialReference = agsSpatialReference;
					for(var i=0; i<olMultiLineString.components.length; i++) {
	     				var olLineString = olMultiLineString.components[i];
	     				try {
	     					var agsPath = this.encodeAgsGeometry['path'].apply(this, [olLineString]);
	     					agsPolyline.addPath(agsPath);
	     				} catch(e) {
	     					throw e;
	     				}
	     			}     				    		     					
					return agsPolyline;
	   			} else {
	   				OpenLayers.Console.error("...AgsAdapter.encodeAgsGeometry.polyline...encode esri.geometry.polyline...missing or invalid OpenLayers.Geometry.MultiLineString...");
	   				throw "...AgsAdapter.encodeAgsGeometry.polyline...encode esri.geometry.polyline...missing or invalid OpenLayers.Geometry.MultiLineString..." + olMultiLineString;
	   			}
	    	},
	    	
	    	/**
		     * APIMethod: encodeAgsGeometry.polygon
		     *   encodes OpenLayers.Geometry.Polygon object to esri.geometry.Polygon
		     *
		     * Parameters:
		     *   olPolygon - {OpenLayers.Geometry.Polygon} object 
		     *   olSpatialReference - {String} e.g. "EPSG:102113", "EPSG:4326" must be in syntax "Namespace:Idetifier"
			 *
		     * Returns: 
		     *   {esri.geometry.Polygon} object 
		     */
	    	'polygon': function(olPolygon, olSpatialReference) {
	    		if(_isDefined(olPolygon) && olPolygon instanceof OpenLayers.Geometry.Polygon) {   				
	     			var agsPolygon = new esri.geometry.Polygon();				
					var agsSpatialReference = null;
					try {
						if(_isDefined(olSpatialReference)) {
	    					agsSpatialReference = this.encodeAgsSpatialReference(olSpatialReference);	
	    				} else {
	    					// if input spatial reference string is invalid, use default one
	    					agsSpatialReference = this.encodeAgsSpatialReference(this.config['defaultEncodeWkid']);
	    				} 
					} catch(e) {
						throw e;
					}
					agsPolygon.spatialReference = agsSpatialReference;
					for(var i=0; i<olPolygon.components.length; i++) {
	     				var olLinearRing = olPolygon.components[i];
	     				try {
	     					var agsRing = this.encodeAgsGeometry['linearring'].apply(this, [olLinearRing]);
	     					agsPolygon.addRing(agsRing);     					
	     				} catch(e) {
	     					throw e;
	     				}
	     			}     			     		  			
					return agsPolygon;
	   			} else {
	   				OpenLayers.Console.error("...AgsAdapter.encodeAgsGeometry.polygon...encode esri.geometry.polygon...missing or invalid OpenLayers.Geometry.Polygon...");
	   				throw "...AgsAdapter.encodeAgsGeometry.polygon...encode esri.geometry.polygon...missing or invalid OpenLayers.Geometry.Polygon..." + olPolygon;
	   			}
	    	},
	    	
	    	/**
		     * APIMethod: encodeAgsGeometry.extent
		     *   encodes OpenLayers.Bounds object to esri.geometry.Extent
		     *
		     * Parameters:
		     *   olBounds - {OpenLayers.Bounds} object 
		     *   olSpatialReference - {String} e.g. "EPSG:102113", "EPSG:4326" must be in syntax "Namespace:Idetifier"
			 *
		     * Returns: 
		     *   {esri.geometry.Extent} object 
		     */
	    	'extent': function(olBounds, olSpatialReference) {
	    		if(_isDefined(olBounds) && olBounds instanceof OpenLayers.Bounds) {   								
					var agsExtent = null;
					var agsSpatialReference = null;
					try {
						if(_isDefined(olSpatialReference)) {
	    					agsSpatialReference = this.encodeAgsSpatialReference(olSpatialReference);	
	    				} else {
	    					// if input spatial reference string is invalid, use default one
	    					agsSpatialReference = this.encodeAgsSpatialReference(this.config['defaultEncodeWkid']);
	    				} 
					} catch(e) {
						throw e;
					}	     			
	     			agsExtent = new esri.geometry.Extent(olBounds.toArray()[0], olBounds.toArray()[1], olBounds.toArray()[2], olBounds.toArray()[3], agsSpatialReference);     					     			   					     				
					return agsExtent;
	   			} else {
	   				OpenLayers.Console.error("...AgsAdapter.encodeAgsGeometry.extent...encode esri.geometry.Extent...missing or invalid OpenLayers.Bounds...");
	   				throw "...AgsAdapter.encodeAgsGeometry.extent...encode esri.geometry.Extent...missing or invalid OpenLayers.Bounds..." + olBounds;
	   			}
	    	}
	    };
	    
	    /**
		 * How OpenLayers symbol works: 		
 		 *   OpenLayers features can have a number of style attributes. The 'default' 
 		 *   style will typically be used if no other style is specified.
 		 *
 		 * Default style properties:
 		 *
		 *  - fillColor: "#ee9900",
		 *  - fillOpacity: 0.4, 
		 *  - hoverFillColor: "white",
		 *  - hoverFillOpacity: 0.8,
		 *  - strokeColor: "#ee9900",
		 *  - strokeOpacity: 1,
		 *  - strokeWidth: 1,
		 *  - strokeLinecap: "round",  [butt | round | square]
		 *  - strokeDashstyle: "solid", [dot | dash | dashdot | longdash | longdashdot | solid]
		 *  - hoverStrokeColor: "red",
		 *  - hoverStrokeOpacity: 1,
		 *  - hoverStrokeWidth: 0.2,
		 *  - pointRadius: 6,
		 *  - hoverPointRadius: 1,
		 *  - hoverPointUnit: "%",
		 *  - pointerEvents: "visiblePainted"
		 *  - cursor: ""
		 *
		 * Other style properties that have no default values:
		 *
		 *  - externalGraphic,
		 *  - graphicWidth,
		 *  - graphicHeight,
		 *  - graphicOpacity,
		 *  - graphicXOffset,
		 *  - graphicYOffset,
		 *  - graphicName,
		 *  - display
		 */ 
		
		/**
	     * APIMethod: encodeAgsSymbol
	     *   encodes OpenLayers.Feature.Vector.style object to esri.symbol.Symbol
	     *
	     * Parameters:
	     *   olStyle - {OpenLayers.Feature.Vector.style} object 
		 *
	     * Returns: 
	     *   {esri.symbol.Symbol} object 
	     */   
	    this.encodeAgsSymbol = {
	    	/**
		     * APIMethod: SimpleMarkerSymbol
		     *   encodes OpenLayers.Feature.Vector.style object to esri.symbol.SimpleMarkerSymbol
		     *
		     * Parameters:
		     *   olStyle - {OpenLayers.Feature.Vector.style} object 
			 *
		     * Returns: 
		     *   {esri.symbol.SimpleMarkerSymbol} object 
		     */
	    	"SimpleMarkerSymbol": function(olStyle) {
	    		if(_isDefined(olStyle)) {
		    		var agsSimpleMarkerSymbol = null;
		    		var style = "STYLE_CIRCLE"; // 'style' of esri.symbol.SimpleMarkerSymbol, 'STYLE_CIRCLE' is the only supported simple marker style in OpenLayers
		    		var size = olStyle['pointRadius'] || 6;	// 'size' of esri.symbol.SimpleMarkerSymbol, default is 6
		    		var color = null
					var opacity = olStyle['fillOpacity'] || 1;
					if(_isDefined(olStyle['fillColor'])) {
						color = new dojo.Color(olStyle['fillColor']); // 'color' of esri.symbol.SimpleMarkerSymbol, default is null	
						color.a = opacity; // opacity of esri.symbol.SimpleMarkerSymbol, default is 1
					}
					
					var xoffset = olStyle['graphicXOffset'] || 0; // 'xoffset' of esri.symbol.SimpleMarkerSymbol
					var yoffset = olStyle['graphicYOffset'] || 0; // 'yoffset' of esri.symbol.SimpleMarkerSymbol
					
					var outline_color = null;
					var outline_opacity = olStyle['strokeOpacity'] || 1;
					if(_isDefined(olStyle['strokeColor'])) {
						outline_color = new dojo.Color(olStyle['strokeColor']); // outline color of esri.symbol.SimpleMarkerSymbol, default is null	
						outline_color.a = outline_opacity; // outline opacity of esri.symbol.SimpleMarkerSymbol, default is 1
					}
																    	
		    		var outline_width = olStyle['strokeWidth'] || 1; // outline width of esri.symbol.SimpleMarkerSymbol, default is 1
		    		var outline_style = _OL_AGS_SIMPLE_LINESYMBOL_MAP[olStyle['strokeDashstyle']] || "STYLE_SOLID"; // outline style of esri.symbol.SimpleMarkerSymbol, default is 'STYLE_SOLID' 
		    		
					var agsSimpleLineSymbol = new esri.symbol.SimpleLineSymbol(outline_style, outline_color, outline_width);		    		
		    		agsSimpleMarkerSymbol = new esri.symbol.SimpleMarkerSymbol(style, size, agsSimpleLineSymbol, color);
					agsSimpleMarkerSymbol.setOffset(xoffset, yoffset);
					
		    		return agsSimpleMarkerSymbol;
		    	} else {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsSymbol.SimpleMarkerSymbol...encode esri.symbol.SimpleMarkerSymbol...missing or invalid openlayers style...");
	   				throw "...AgsAdapter.encodeAgsSymbol.SimpleMarkerSymbol...encode esri.symbol.SimpleMarkerSymbol...missing or invalid openlayers style..." + olStyle;
		    	}
	    	},
			
			/**
		     * APIMethod: PictureMarkerSymbol
		     *   encodes OpenLayers.Feature.Vector.style object to esri.symbol.PictureMarkerSymbol
		     *
		     * Parameters:
		     *   olStyle - {OpenLayers.Feature.Vector.style} object 
			 *
		     * Returns: 
		     *   {esri.symbol.PictureMarkerSymbol} object 
		     */
			"PictureMarkerSymbol": function(olStyle) {
				if(_isDefined(olStyle)) {
		    		var agsPictureMarkerSymbol = null;
		    		var size = olStyle['pointRadius'] || 6;	// 'size' of esri.symbol.PictureMarkerSymbol, default is 6
		    		var offsetX = olStyle['graphicXOffset'] || 0; // 'xoffset' of esri.symbol.PictureMarkerSymbol
					var offsetY = olStyle['graphicYOffset'] || 0; // 'yoffset' of esri.symbol.PictureMarkerSymbol	    		
		    		
					var url = olStyle['externalGraphic'] || "../../img/marker.png"; // 'url' of esri.symbol.PictureMarkerSymbol
					var width = olStyle['graphicWidth'] || 21; // 'width' of esri.symbol.PictureMarkerSymbol
					var height = olStyle['graphicHeight'] || 25; // 'height' of esri.symbol.PictureMarkerSymbol
					
					var agsPictureMarkerSymbol = new esri.symbol.PictureMarkerSymbol(url, width, height);
					agsPictureMarkerSymbol.setSize(size);
					agsPictureMarkerSymbol.setOffset(offsetX, offsetY);
					
		    		return agsPictureMarkerSymbol;
		    	} else {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsSymbol.PictureMarkerSymbol...encode esri.symbol.PictureMarkerSymbol...missing or invalid openlayers style...");
	   				throw "...AgsAdapter.encodeAgsSymbol.PictureMarkerSymbol...encode esri.symbol.PictureMarkerSymbol...missing or invalid openlayers style..." + olStyle;
		    	}	
			},
	    	
			/**
		     * APIMethod: PictureMarkerSymbol
		     *   encodes OpenLayers.Feature.Vector.style object to esri.symbol.SimpleLineSymbol
		     *
		     * Parameters:
		     *   olStyle - {OpenLayers.Feature.Vector.style} object 
			 *
		     * Returns: 
		     *   {esri.symbol.SimpleLineSymbol} object 
		     */
	    	"SimpleLineSymbol": function(olStyle) {
	    		if(_isDefined(olStyle)) {
		    		var color = null;
					var opacity = olStyle['strokeOpacity'] || 1;
					if(_isDefined(olStyle['strokeColor'])) {
						color = new dojo.Color(olStyle['strokeColor']); // 'color' of esri.symbol.SimpleMarkerSymbol, default is null	
						color.a = opacity; // 'opacity' of esri.symbol.SimpleMarkerSymbol, default is 1
					}
																    	
		    		var width = olStyle['strokeWidth'] || 1; // 'width' of esri.symbol.SimpleMarkerSymbol, default is 1
		    		var style = _OL_AGS_SIMPLE_LINESYMBOL_MAP[olStyle['strokeDashstyle']] || "STYLE_SOLID"; // 'style' of esri.symbol.SimpleMarkerSymbol, default is 'STYLE_SOLID' 
		    		
					var agsSimpleLineSymbol = new esri.symbol.SimpleLineSymbol(style, color, width);	
		    		return agsSimpleLineSymbol;
		    	} else {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsSymbol.SimpleLineSymbol...encode esri.symbol.SimpleLineSymbol...missing or invalid openlayers style...");
	   				throw "...AgsAdapter.encodeAgsSymbol.SimpleLineSymbol...encode esri.symbol.SimpleLineSymbol...missing or invalid openlayers style..." + olStyle;
		    	}
	    	},
			
			/**
		     * APIMethod: CartographicLineSymbol
		     *   encodes OpenLayers.Feature.Vector.style object to esri.symbol.CartographicLineSymbol
		     *
		     * Parameters:
		     *   olStyle - {OpenLayers.Feature.Vector.style} object 
			 *
		     * Returns: 
		     *   {esri.symbol.CartographicLineSymbol} object 
		     */ 
			"CartographicLineSymbol": function(olStyle) {
				OpenLayers.Console.error("...AgsAdapter.encodeAgsSymbol.CartographicLineSymbol is not implemented yet...");
	   			throw "...AgsAdapter.encodeAgsSymbol.CartographicLineSymbol is not implemented yet...";
			},
			
			/**
		     * APIMethod: SimpleFillSymbol
		     *   encodes OpenLayers.Feature.Vector.style object to esri.symbol.SimpleFillSymbol
		     *
		     * Parameters:
		     *   olStyle - {OpenLayers.Feature.Vector.style} object 
			 *
		     * Returns: 
		     *   {esri.symbol.SimpleFillSymbol} object 
		     */ 	
	    	"SimpleFillSymbol": function(olStyle) {
	    		if(_isDefined(olStyle)) {
		    		var agsSimpleFillSymbol = null;
		    		var style = "STYLE_SOLID"; // 'style' of esri.symbol.SimpleFillSymbol, 'STYLE_SOLID' is the only supported simple fill style in OpenLayers
		    		var color = null
					var opacity = olStyle['fillOpacity'] || 1;
					if(_isDefined(olStyle['fillColor'])) {
						color = new dojo.Color(olStyle['fillColor']); // 'color' of esri.symbol.SimpleFillSymbol, default is null	
						color.a = opacity; // opacity of esri.symbol.SimpleFillSymbol, default is 1
					}
					var outline_color = null;
					var outline_opacity = olStyle['strokeOpacity'] || 1;
					if(_isDefined(olStyle['strokeColor'])) {
						outline_color = new dojo.Color(olStyle['strokeColor']); // outline color of esri.symbol.SimpleFillSymbol, default is null	
						outline_color.a = outline_opacity; // outline opacity of esri.symbol.SimpleFillSymbol, default is 1
					}									    	
		    		var outline_width = olStyle['strokeWidth'] || 1; // outline width of esri.symbol.SimpleFillSymbol, default is 1
		    		var outline_style = _OL_AGS_SIMPLE_LINESYMBOL_MAP[olStyle['strokeDashstyle']] || "STYLE_SOLID"; // outline style of esri.symbol.SimpleFillSymbol, default is 'STYLE_SOLID' 
		    		
					var agsSimpleLineSymbol = new esri.symbol.SimpleLineSymbol(outline_style, outline_color, outline_width);		    		
		    		agsSimpleFillSymbol = new esri.symbol.SimpleFillSymbol(style, agsSimpleLineSymbol, color);
					
		    		return agsSimpleFillSymbol;
		    	} else {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsSymbol.SimpleFillSymbol...encode esri.symbol.SimpleFillSymbol...missing or invalid openlayers style...");
	   				throw "...AgsAdapter.encodeAgsSymbol.SimpleFillSymbol...encode esri.symbol.SimpleFillSymbol...missing or invalid openlayers style..." + olStyle;
		    	}
	    	},
			
			/**
		     * APIMethod: PictureFillSymbol
		     *   encodes OpenLayers.Feature.Vector.style object to esri.symbol.PictureFillSymbol
		     *
		     * Parameters:
		     *   olStyle - {OpenLayers.Feature.Vector.style} object 
			 *
		     * Returns: 
		     *   {esri.symbol.PictureFillSymbol} object 
		     */ 
			"PictureFillSymbol": function(olStyle) {
				OpenLayers.Console.error("...AgsAdapter.encodeAgsSymbol.PictureFillSymbol is not implemented yet...");
	   			throw "...AgsAdapter.encodeAgsSymbol.PictureFillSymbol is not implemented yet...";
			}
	    };
	    
	    /**
	     * APIMethod: encodeAgsGraphic
	     *   enocdes OpenLayers.Feature.Vector to esri.Graphic object
	     *
	     * Parameters:
	     *   olFeature - {OpenLayers.Feature.Vector} object 
	     *   olSpatialReference - {string}
		 *
	     * Returns: 
	     *   {esri.Graphic} object 
	     */
	    this.encodeAgsGraphic = function(olFeature, olSpatialReference) {
	    	if(olFeature instanceof OpenLayers.Feature.Vector && _isDefined(olFeature.geometry)) {
	    		var agsGraphic = null;
	    		var geometryType = _OL_GEOMETRY_MAP[olFeature.geometry.CLASS_NAME];
	    		var geometry = null;
	    		try {
	    			geometry = this.encodeAgsGeometry[geometryType].apply(this, [olFeature.geometry, olSpatialReference]);
	    		} catch(e) {
	    			throw e;
	    		}
	    		var attributes = _isDefined(olFeature.attributes) ? olFeature.attributes : {};				
	    		var symbol = null;
	    		if(_isDefined(olFeature.style)) {
	    			// there is no way to tell the type of an OpenLayers style, so always tell by geometry type
					// TODO: tell if style is PictureMarkerSymbol
					var symbol_type = _OL_AGS_STYLE_MAP[olFeature.geometry.CLASS_NAME];    		
	    			try {
	    				symbol = this.encodeAgsSymbol[symbol_type].apply(this, [olFeature.style]);
	    			} catch(e) {
	    				throw e;
	    			}	
	    		}
	    		var infoTemplate = null;
	    		if(_isDefined(attributes['infoTemplateTitle']) && _isDefined(attributes['infoTemplateContent'])) {
	    			infoTemplate = new esri.InfoTemplate(attributes['infoTemplateTitle'], attributes['infoTemplateContent']);
	    		}	    		
	    		agsGraphic = new esri.Graphic(geometry, symbol, attributes, infoTemplate);				
	    		return agsGraphic;
	    	} else {
	    		OpenLayers.Console.error("...AgsAdapter.encodeAgsGraphic...encode esri.geometry.Geometry...missing or invalid OpenLayers.Feature.Vector...");    	
	    		throw "...AgsAdapter.encodeAgsGraphic...encode esri.geometry.Geometry...missing or invalid OpenLayers.Feature.Vector..." + olFeature;
	    	}
	    };
	    
	    /**
	     * APIMethod: encodeAgsGraphic
	     *   enocdes array of OpenLayers.Feature.Vector to array of esri.Graphic object
	     *
	     * Parameters:
	     *   olFeatures - {Array of OpenLayers.Feature.Vector} Array
	     *   olSpatialReference - {string}
		 *
	     * Returns: 
	     *   {esri.Graphic} object 
	     */
	    this.encodeAgsGraphics = function(olFeatures, olSpatialReference) {
	   		var agsGraphics = [];
	    	if(_isDefined(olFeatures) && olFeatures instanceof Array) {
	    		for(var i=0; i<olFeatures.length; i++) {
	    	 		try {
	    	 			var agsGraphic = this.encodeAgsGraphic.apply(this, [olFeatures[i], olSpatialReference]);
	    	 			agsGraphics.push(agsGraphic);
	    	 		} catch(e) {
	    	 			throw e;
	    	 		}
	    	 	} 
	    	 	return agsGraphics;   		
	    	} else {
	    	 	OpenLayers.Console.error("...AgsAdapter.encodeAgsGraphics...encode array esri.Graphic...missing or invalid array of OpenLayers.Feture.Vector...");
	    		throw "...AgsAdapter.encodeAgsGraphics...encode array esri.Graphic...missing or invalid array of OpenLayers.Feture.Vector..." + olFeatures;
	    	}	    	
	    };

	    /**
	     * APIMethod: encodeAgsFindParameters
	     *   encode an esri.tasks.FindParameters from an object literal
	     *
	     * Parameters:
	     *   findParameters - {object} object 
		 *
	     * Returns: 
	     *   {esri.tasks.FindParameters} object 
	     */
	    this.encodeAgsFindParameters = function(findParameters) {
	    	if(_isDefined(findParameters)) {
		    	var agsFindParameters = new esri.tasks.FindParameters();		    			    	
		    	// 'contains' parameter
		    	agsFindParameters['contains'] = findParameters['contains'] || false;     			    	
		    	// 'outSpatialReference' parameter
		    	if(!_isDefined(findParameters['outSpatialReference'])) {
		    		agsFindParameters['outSpatialReference'] = null;
		    	} else {		    				    		
		    		if(!(findParameters['outSpatialReference'] instanceof esri.SpatialReference)) {
		    			try {
		    				// try to encode AgsJs spatial reference
		    				findParameters['outSpatialReference'] = this.encodeAgsSpatialReference(findParameters['outSpatialReference']);
		    			} catch(e) {
		    				throw e;
		    			}
		    		}
		    		agsFindParameters['outSpatialReference'] = findParameters['outSpatialReference'];
		    	}
		    	// 'returnGeometry' parameter
		    	agsFindParameters['returnGeometry'] = findParameters['returnGeometry'] || true;
		    	// 'layerIds' parameter
		    	if(!_isDefined(findParameters['layerIds'])) {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsFindParameters...parameter 'layerIds' can not be null or empty...");
		    		throw "...AgsAdapter.encodeAgsFindParameters...parameter 'layerIds' can not be null or empty...";
		    	} else {
		    		agsFindParameters['layerIds'] = findParameters['layerIds'];
		    	}
		    	// 'searchFields' parameter
		    	if(!_isDefined(findParameters['searchFields'])) {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsFindParameters...parameter 'searchFields' can not be null or empty...");
		    		throw "...AgsAdapter.encodeAgsFindParameters...parameter 'searchFields' can not be null or empty...";
		    	} else {
		    		agsFindParameters['searchFields'] = findParameters['searchFields'];
		    	}
		    	// 'searchText' parameter
		    	if(!_isDefined(findParameters['searchText'])) {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsFindParameters...parameter 'searchText' can not be null or empty...");
		    		throw "...AgsAdapter.encodeAgsFindParameters...parameter 'searchText' can not be null or empty...";
		    	} else {
		    		agsFindParameters['searchText'] = findParameters['searchText'];
		    	}		    	
		    	return agsFindParameters;
	    	} else {
	    		OpenLayers.Console.error("...AgsAdapter.encodeAgsFindParameters...encode ags FindParameter...missing or invalid input object literal...");
	    		throw "...AgsAdapter.encodeAgsFindParameters...encode ags FindParameter...missing or invalid input object literal..." + findParameters;
	    	}
	    };
	    
	    /**
	     * APIMethod: encodeAgsIdentifyParameters
	     *   encodes an esri.tasks.IdentifyParameters from an object literal
	     *
	     * Parameters:
	     *   identifyParameters - {object} object 
		 *
	     * Returns: 
	     *   {esri.tasks.IdentifyParameters} object 
	     */
	    this.encodeAgsIdentifyParameters = function(identifyParameters) {
	    	if(_isDefined(identifyParameters)) {
		    	var agsIdentifyParameters = new esri.tasks.IdentifyParameters();			
		    	// 'dpi' parameter
		    	if(_isNumber(identifyParameters['dpi'])) {
		    		agsIdentifyParameters['dpi'] = identifyParameters['dpi'];
		    	} else {
		    		agsIdentifyParameters['dpi'] = 96;
		    	}		 
		    	// 'geometry' parameter	
		    	if(_isAgsGeometry(identifyParameters['geometry'])) { // input is already esri.geometry.Geometry
		    		agsIdentifyParameters['geometry'] = identifyParameters['geometry'];
		    	} else if(_isOLGeometry(identifyParameters['geometry'])) { // input is OpenLayers.Geometry.Geometry
		    		var geometryType = _OL_GEOMETRY_MAP[identifyParameters['geometry'].CLASS_NAME];
		    		var agsGeometry = this.encodeAgsGeometry[geometryType].apply(this, [identifyParameters['geometry'], this.config['defaultEncodeWkid']]);
		    		agsIdentifyParameters['geometry'] = agsGeometry;
		    	} else if(identifyParameters['geometry'] instanceof OpenLayers.Feature.Vector) { // input is OpenLayers.Feature.Vector
		    		var geometryType = _OL_GEOMETRY_MAP[identifyParameters['geometry'].geometry.CLASS_NAME];
		    		var agsGeometry = this.encodeAgsGeometry[geometryType].apply(this, [identifyParameters['geometry'].geometry, this.config['defaultEncodeWkid']]);
		    		agsIdentifyParameters['geometry'] = agsGeometry;
		    	} else {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsIdentifyParameters...parameter 'geometry' missing or invalid...");
		    		throw "...AgsAdapter.encodeAgsIdentifyParameters...parameter 'geometry' missing or invalid...";
		    	}		    	
		    	// 'height' parameter
		    	if(!_isNumber(identifyParameters['height'])) {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsIdentifyParameters...parameter 'height' is missing or invalid...");
		    		throw "...AgsAdapter.encodeAgsIdentifyParameters...parameter 'height' is missing or invalid...";
		    	} else {
		    		agsIdentifyParameters['height'] = identifyParameters['height'];
		    	}
		    	// 'layersIds' parameter
		    	if(!_isDefined(identifyParameters['layerIds'])) {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsIdentifyParameters...parameter 'layerIds' is missing or invalid...");
		    		throw "...AgsAdapter.encodeAgsIdentifyParameters...parameter 'layerIds' is missing or invalid...";
		    	} else {
		    		agsIdentifyParameters['layerIds'] = identifyParameters['layerIds'];
		    	}		    	
		    	// 'layerOption' parameter
		    	if(_isDefined(identifyParameters['layerOption'])) {
		    		agsIdentifyParameters['layerOption'] = identifyParameters['layerOption'];
		    	} else {
		    		agsIdentifyParameters['layerOption'] = "all";
		    	}
		    	// 'mapExtent' parameter		    			    		
	    		if(identifyParameters['mapExtent'] instanceof OpenLayers.Bounds) {
	    			try {
	    				agsIdentifyParameters['mapExtent'] = this.encodeAgsGeometry['extent'].apply(this, [identifyParameters['mapExtent'], this.config['defaultEncodeWkid']]);
	    			} catch(e) {
	    				throw e;
	    			}
	    		} else if(identifyParameters['mapExtent'] instanceof esri.geometry.Extent){		    		
	    			agsIdentifyParameters['mapExtent'] = identifyParameters['mapExtent'];
	    		} else {
	    			OpenLayers.Console.error("...AgsAdapter.encodeAgsIdentifyParameters...parameter 'mapExtent' is missing or invalid...");
	    			throw "...AgsAdapter.encodeAgsIdentifyParameters...parameter 'mapExtent' is missing or invalid...";
	    		}		    			    	
		    	// 'returnGeometry' parameter
		    	if(_isBoolean(identifyParameters['returnGeometry'])) {
		    		agsIdentifyParameters['returnGeometry'] = identifyParameters['returnGeometry'];
		    	} else {
		    		agsIdentifyParameters['returnGeometry'] = true;
		    	}		    	
		    	// 'spatialReference' parameter		    		    
		    	if(!_isDefined(identifyParameters['spatialReference'])) {
		    		agsIdentifyParameters['spatialReference'] = null;
		    	} else {
		    		if(!(identifyParameters['spatialReference'] instanceof esri.SpatialReference)) {
		    			try {
		    				agsIdentifyParameters['spatialReference'] = this.encodeAgsSpatialReference(identifyParameters['spatialReference']);
		    			} catch(e) {
		    				throw e;
		    			}
		    		} else {
		    			agsIdentifyParameters['spatialReference'] = identifyParameters['spatialReference'];
		    		}
		    	}
				// 'tolerance' parameter		    	
		    	if(_isDefined(identifyParameters['tolerance'])) {
		    		agsIdentifyParameters['tolerance'] = identifyParameters['tolerance'];
		    	} else {
		    		agsIdentifyParameters['tolerance'] = 0;
		    	}
		    	// 'width' parameter
		    	if(!_isNumber(identifyParameters['width'])) {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsIdentifyParameters...parameter 'width' is missing or invalid...");
		    		throw "...AgsAdapter.encodeAgsIdentifyParameters...parameter 'width' is missing or invalid...";
		    	} else {
		    		agsIdentifyParameters['width'] = identifyParameters['width'];
		    	}		    	
		    	return agsIdentifyParameters;
		    } else {
		    	OpenLayers.Console.error("...AgsAdapter.encodeAgsIdentifyParameters...encode ags IdentifyParameters...missing or invalid input object literal...");
	    		throw "...AgsAdapter.encodeAgsIdentifyParameters...encode ags IdentifyParameters...missing or invalid input object literal..." + identifyParameters;
		    }
	    };
	    
	    /**
	     * APIMethod: encodeAgsBufferParameters
	     *   encode an esri.tasks.BufferParameters from an object literal
	     *
	     * Parameters:
	     *   bufferParameters - {} object 
		 *
	     * Returns: 
	     *   {esri.tasks.BufferParameters} object 
	     */
	    this.encodeAgsBufferParameters = function(bufferParameters) {
	    	if(_isDefined(bufferParameters)) {
		    	var agsBufferParameters = new esri.tasks.BufferParameters();	    	
		    	// 'bufferSpatialReference' parameter		    		    
		    	if(!_isDefined(bufferParameters['bufferSpatialReference'])) {
		    		agsBufferParameters['bufferSpatialReference'] = null;
		    	} else {
		    		if(!(bufferParameters['bufferSpatialReference'] instanceof esri.SpatialReference)) {
		    			try {
		    				agsBufferParameters['bufferSpatialReference'] = this.encodeAgsSpatialReference(bufferParameters['bufferSpatialReference']);
		    			} catch(e) {
		    				throw e;
		    			}
		    		} else {
		    			agsBufferParameters['bufferSpatialReference'] = bufferParameters['bufferSpatialReference'];
		    		}
		    	}
		    	// 'distance' parameter
		    	if(bufferParameters['distances'] instanceof Array) {
		    		agsBufferParameters['distances'] = bufferParameters['distances'];
		    	} else {
		    		agsBufferParameters['distances'] = [50];
		    	}	
		    	// 'features' parameter    				
				if(_isDefined(bufferParameters['features']) && bufferParameters['features'] instanceof Array) {
		    		var agsGraphics = [];
		    		for(var i=0; i<bufferParameters['features'].length; i++) {
		    			if(bufferParameters['features'][i] instanceof esri.Graphic) {
		    				agsGraphics.push(bufferParameters['features'][i]);
		    			} else if(bufferParameters['features'][i] instanceof OpenLayers.Feature.Vector) {
		    				agsGraphics.push(this.encodeAgsGraphic(bufferParameters['features'][i], this.config['defaultEncodeWkid']));
		    			} else if(_isOLGeometry(bufferParameters['features'][i])) {
		    				var olFeature = new OpenLayers.Feature.Vector(bufferParameters['features'][i]);
		    				agsGraphics.push(this.encodeAgsGraphic(olFeature, this.config['defaultEncodeWkid']));
		    			} else {
		    				OpenLayers.Console.error("...AgsAdapter.encodeAgsBufferParameters...parameter 'features' is missing or invalid...");
		    				throw "...AgsAdapter.encodeAgsBufferParameters...parameter 'features' is missing or invalid...";	
		    			}
		    		}
		    		agsBufferParameters['features'] = agsGraphics;	    		
		    	} else {	    		
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsBufferParameters...parameter 'features' is missing or invalid...");
		    		throw "...AgsAdapter.encodeAgsBufferParameters...parameter 'features' is missing or invalid...";
		    	}
				// 'outSpatialReference'
				if(!_isDefined(bufferParameters['outSpatialReference'])) {
		    		agsBufferParameters['outSpatialReference'] = null;
		    	} else {
		    		if(!(bufferParameters['outSpatialReference'] instanceof esri.SpatialReference)) {
		    			try {
		    				agsBufferParameters['outSpatialReference'] = this.encodeAgsSpatialReference(bufferParameters['outSpatialReference']);
		    			} catch(e) {
		    				throw e;
		    			}
		    		} else {
		    			agsBufferParameters['outSpatialReference'] = bufferParameters['outSpatialReference'];
		    		}
		    	}	    	
		    	// 'unionResults' parameter
		    	if(_isDefined(bufferParameters['unionResults'])) {
		    		agsBufferParameters['unionResults'] = bufferParameters['unionResults'];
		    	} else {
		    		agsBufferParameters['unionResults'] = false;
		    	}
			    // 'unit' parameter
			    if(_isDefined(_AGS_UNITS[bufferParameters['unit']])) {
			    	agsBufferParameters['unit'] = _AGS_UNITS[bufferParameters['unit']];
			    } else {
			    	agsBufferParameters['unit'] = _AGS_UNITS["UNIT_KILOMETER"];
			    }		  		   
		    	return agsBufferParameters;
		    } else {
		    	OpenLayers.Console.error("...AgsAdapter.encodeAgsBufferParameters...encode ags BufferParameters...missing or invalid input object literal...");
	    		throw "...AgsAdapter.encodeAgsBufferParameters...encode ags BufferParameters...missing or invalid input object literal..." + bufferParameters;
		    }
	    };
		
		/**
	     * APIMethod: encodeAgsRouteParameters
	     *   encode an esri.tasks.RouteParameters from an object literal
	     *
	     * Parameters:
	     *   routeParameters - {} object 
		 *
	     * Returns: 
	     *   {esri.tasks.RouteParameters} object 
	     */
		this.encodeAgsRouteParameters = function(routeParameters) {
			if (_isDefined(routeParameters)) {
				// initialize an esri.tasks.RouteParameters
				var agsRouteParameters = new esri.tasks.RouteParameters();
											
				// TODO: 'accumulateAttributes' - String
				
				if(_isDefined(routeParameters['barriers'])) {
					// encode array of OpenLayers.Feature.Vector into esri.tasks.FeatureSet
					try {
						agsRouteParameters['barriers'] = this.encodeAgsFeatureSet(routeParameters['barriers'], this.config['defaultEncodeWkid'], {});	
					} catch(e) {
						OpenLayers.Console.error("...error encoding esri.tasks.RouteParameters.barriers...");
						throw e;
					}					
				} 
				
				// TODO: 'directionsLanguage' - String
				// TODO: 'directionsLengthUnits' - String
				// TODO: 'directionsTimeAttribute' - String
				// TODO: 'doNotLocateOnRestrictedElements' - boolean
				// TODO: 'findBestSequence' - boolean
				// TODO: 'ignoreInvalidLocations' - boolean
				// TODO: 'impedanceAttribute' - String
				// TODO: 'outputGeometryPrecision' - Number
				// TODO: 'outputGeometryPrecisionUnits' - String
				// TODO: 'outputLines' - String 
				
				// 'outSpatialReference'
				if(!_isDefined(routeParameters['outSpatialReference'])) {
		    		agsRouteParameters['outSpatialReference'] = null;
		    	} else {
		    		if(!(routeParameters['outSpatialReference'] instanceof esri.SpatialReference)) {
		    			try {
		    				agsRouteParameters['outSpatialReference'] = this.encodeAgsSpatialReference(routeParameters['outSpatialReference']);
		    			} catch(e) {
		    				throw e;
		    			}
		    		} else {
		    			agsRouteParameters['outSpatialReference'] = routeParameters['outSpatialReference'];
		    		}
		    	}	
				
				// TODO: 'preserveFirstStop' - boolean
				// TODO: 'preserveLastStrop' - boolean
				
				if(_isDefined(routeParameters['restrictionAttributes'])) {
					// TODO: configure 'restrictionAttributes'
				}
				
				// TODO: 'restrictUTurns' - String
				
				if(_isDefined(routeParameters['returnBarriers'])) {
					agsRouteParameters['returnBarriers'] = routeParameters['returnBarriers'];
				}
				if(_isDefined(routeParameters['returnDirections'])) {
					agsRouteParameters['returnDirections'] = routeParameters['returnDirections'];
				}
				if(_isDefined(routeParameters['returnRoutes'])) {
					agsRouteParameters['returnRoutes'] = routeParameters['returnRoutes'];
				}
				if(_isDefined(routeParameters['returnStops'])) {
					agsRouteParameters['returnStops'] = routeParameters['returnStops'];
				}
							
				// TODO: 'startTime' - Date
				
				if(_isDefined(routeParameters['stops']) && routeParameters['stops'] instanceof Array) {
					var agsStops = new esri.tasks.FeatureSet(); // either be an esri.tasks.FeatureSet or esri.tasks.DataLayer
					for(var i=0; i<routeParameters['stops'].length; i++) {
						// in case 'stop' is esri.Graphic
						if(routeParameters['stops'][i] instanceof esri.Graphic) {
		    				agsStops.features.push(routeParameters['stops'][i]);
		    			} else if(routeParameters['stops'][i] instanceof OpenLayers.Feature.Vector) { // in case 'stop' is OpenLayers.Vector.Feature
		    				agsStops.features.push(this.encodeAgsGraphic(routeParameters['stops'][i], this.config['defaultEncodeWkid']));
		    			} else if(_isOLGeometry(routeParameters['stops'][i])) { // in case 'stop' is one of OpenLayers.Geometry.*
		    				var olFeature = new OpenLayers.Feature.Vector(routeParameters['stops'][i]);
		    				agsStops.features.push(this.encodeAgsGraphic(olFeature, this.config['defaultEncodeWkid']));
		    			} else { // throw exception in case none of those above
		    				OpenLayers.Console.error("...AgsAdapter.encodeAgsRouteParameters...one of the 'stops' is invalid...");
		    				throw "...AgsAdapter.encodeAgsRouteParameters...one of the 'stops' is invalid...";	
		    			} 
					}
					agsRouteParameters['stops'] = agsStops;
				} else {
					OpenLayers.Console.error("...error encoding esri.tasks.RouteParameters.stops...invalid array input...");
					throw "...error encoding esri.tasks.RouteParameters.stops...invalid array input...";
				}
				
				// TODO: 'useHierarchy' - Boolean
				// TODO: 'useTimeWindows' - Boolean
				
				return agsRouteParameters;
			} else {
				OpenLayers.Console.error("...AgsAdapter.encodeAgsRouteParameters...encode ags routeParameters...missing or invalid input object literal...");
	    		throw "...AgsAdapter.encodeAgsRouteParameters...encode ags routeParameters...missing or invalid input object literal..." + routeParameters;
			}
		};
	    
	    /**
	     * APIMethod: encodeAgsQuery
	     *   encodes an esri.tasks.Query from an object literal
	     *
	     * Parameters:
	     *   query - {} object 
		 *
	     * Returns: 
	     *   {esri.tasks.Query} object 
	     */
	    this.encodeAgsQuery = function(query) {
	    	if(_isDefined(query)) {
		    	var agsQuery = new esri.tasks.Query();	    	
		    	// 'geometry' parameter	
		    	if(_isAgsGeometry(query['geometry'])) { // input is already esri.geometry.Geometry
		    		agsQuery['geometry'] = query['geometry'];
		    	} else if(_isOLGeometry(query['geometry'])) { // input is OpenLayers.Geometry.Geometry
		    		var geometryType = _OL_GEOMETRY_MAP[query['geometry'].CLASS_NAME];
		    		var agsGeometry = this.encodeAgsGeometry[geometryType].apply(this, [query['geometry'], this.config['defaultEncodeWkid']]);
		    		agsQuery['geometry'] = agsGeometry;
		    	} else if(query['geometry'] instanceof OpenLayers.Feature.Vector) { // input is OpenLayers.Feature.Vector
		    		var geometryType = _OL_GEOMETRY_MAP[query['geometry'].geometry.CLASS_NAME];
		    		var agsGeometry = this.encodeAgsGeometry[geometryType].apply(this, [query['geometry'].geometry, this.config['defaultEncodeWkid']]);
		    		agsQuery['geometry'] = agsGeometry;
		    	} else {
		    		// can 'geometry' be null or empty?
		    		//OpenLayers.Console.error("...AgsAdapter.encodeAgsQuery...parameter 'geometry' missing or invalid...");
		    		//throw "...AgsAdapter.encodeAgsQuery...parameter 'geometry' missing or invalid...";
		    	}		
				// 'outFields'
		    	if(!_isDefined(query['outFields'])) {
		    		OpenLayers.Console.error("...AgsAdapter.encodeAgsQuery...parameter 'outFields' is mandatory...");
		    		throw "...AgsAdapter.encodeAgsQuery...parameter 'outFields' is mandatory...";
		    	} else {
		    		agsQuery['outFields'] = query['outFields'];
		    	}			
				// 'outSpatialReference'
				if(!_isDefined(query['outSpatialReference'])) {
		    		agsQuery['outSpatialReference'] = null;
		    	} else {
		    		if(!(query['outSpatialReference'] instanceof esri.SpatialReference)) {
		    			try {
		    				agsQuery['outSpatialReference'] = this.encodeAgsSpatialReference(query['outSpatialReference']);
		    			} catch(e) {
		    				throw e;
		    			}
		    		} else {
		    			agsQuery['outSpatialReference'] = query['outSpatialReference'];
		    		}
		    	}	
				// 'returnGeometry' parameter
				if(_isDefined(query['returnGeometry'])) {
					agsQuery['returnGeometry'] = query['returnGeometry'];
				} else {
					agsQuery['returnGeometry'] = true;
				}
				// 'spatialRelationship' parameter			
				if(_isDefined(_AGS_SPATIALRELATIONSHIP[query['spatialRelationship']])) {
					agsQuery['spatialRelationship'] = _AGS_SPATIALRELATIONSHIP[query['spatialRelationship']];
				} else {
					agsQuery['spatialRelationship'] = _AGS_SPATIALRELATIONSHIP["INTERSECTS"];
				}					
				// 'text' parameter
				agsQuery['text'] = query['text'] ? query['text'] : "";
				// 'where' parameter
				agsQuery['where'] = query['where'] ? query['where'] : "";			
		    	return agsQuery;
		    } else {
		    	OpenLayers.Console.error("...AgsAdapter.encodeAgsQuery...encode ags Query...missing or invalid input object literal...");
	    		throw "...AgsAdapter.encodeAgsQuery...encode ags Query...missing or invalid input object literal..." + query;
		    }
	    };
	    
	    /**
	     * APIMethod: encodeAgsLocation
	     *   encodes 'location' parameter from a geometry
	     *
	     * Parameters:
	     *   location - {} object 
		 *
	     * Returns: 
	     *   {esri.geometry.Point} object 
	     */
	    this.encodeAgsLocation = function(location) {
	    	if(_isDefined(location)) {
	    		try {
			    	if(location instanceof esri.geometry.Point) { // location is already esri.geometry.Point
			    		return location;
			    	} else if(location instanceof OpenLayers.Geometry.Point) { // input is OpenLayers.Geometry.Point		    		
			    		var agsPoint = this.encodeAgsGeometry['point'].apply(this, [location, this.config['defaultEncodeWkid']]);
			    		return agsPoint;
			    	} else if(location instanceof OpenLayers.Feature.Vector) { // input is OpenLayers.Feature.Vector		    		
			    		var agsPoint = this.encodeAgsGeometry['point'].apply(this, [location.geometry, this.config['defaultEncodeWkid']]);
			    		return agsPoint;
			    	} else {		    		
			    		OpenLayers.Console.error("...AgsAdapter.encodeAgsLocation...'location' is invalid...");
			    		throw "...AgsAdapter.encodeAgsLocation...'location' is invalid...";
			    	}
	    		} catch(e) {
	    			throw e;
	    		}
	    	} else {
	    		OpenLayers.Console.error("...AgsAdapter.encodeAgsLocation...encode location...missing or invalid 'location'...");
	    		throw "...AgsAdapter.encodeAgsLocation...encode location...missing or invalid 'location'...";
	    	}
	    };
		
		/**
	     * APIMethod: encodeAgsFeatureSet
	     *   encodes an array of OpenLayers.Feature.Vector to an esri.tasks.FeatureSet
	     *
	     * Parameters:
	     *   olFeatures - {Array of OpenLayers.Feature.Vector} Array
	     *   olSpatialReference - {String}
	     *   options - {} object
		 *
	     * Returns: 
	     *   {esri.tasks.FeatureSet} object 
	     */
		this.encodeAgsFeatureSet = function(olFeatures, olSpatialReference, options) {
			if(_isDefined(olFeatures)) {
				var featureSet = new esri.tasks.FeatureSet();
				try {
					featureSet.features = this.encodeAgsGraphics.apply(this, [olFeatures, olSpatialReference]);
					featureSet.spatialReference = this.encodeAgsSpatialReference.apply(this, [olSpatialReference]);
					featureSet.displayFieldName = options['displayFieldName'] || undefined;
					featureSet.fieldAliases = options['fieldAliases'] || undefined;
					featureSet.geometryType = options['geometryType'] || undefined;				
				} catch(e) {
					throw e;
				}				
			} else {
				OpenLayers.Console.error("...AgsAdapter.encodeAgsFeatureSet...encode FeatureSet...missing or invalid OpenLayers.Feature.Vector array...");
	    		throw "...AgsAdapter.encodeAgsFeatureSet...encode FeatureSet...missing or invalid OpenLayers.Feature.Vector array...";
			}
			return featureSet;
		},
		
		/**
	     * APIMethod: encodeAgsGeometrySpatialRelationship
	     *   encodes an OpenLayers geometry spatial relationship string to an esri geometry spatial relationship string
	     *
	     * Parameters:
	     *   olGeometrySpatialRelationship - {String}	     
		 *
	     * Returns: 
	     *   {String}
	     */
	    this.encodeAgsGeometrySpatialRelationship = function(olGeometrySpatialRelationship) {
			if(_isDefined(olGeometrySpatialRelationship)) {
				var agsGeometrySpatialRelationship = null;
				agsGeometrySpatialRelationship = _AGS_GEOMETRY_SPATIALRELATIONSHIP[olGeometrySpatialRelationship];
			} else {
				OpenLayers.Console.error("...AgsAdapter.encodeAgsGeometrySpatialRelationship...encode AgsGeometrySpatialRelationship...missing or invalid input OpenLayers GeometrySpatialRelationship...");
	    		throw "...AgsAdapter.encodeAgsGeometrySpatialRelationship...encode AgsGeometrySpatialRelationship...missing or invalid input OpenLayers GeometrySpatialRelationship...";
			}
			return agsGeometrySpatialRelationship;
		}
		
		
	    ///////////////////////////////////////////
        // CLASS INITIALIZATION
        ///////////////////////////////////////////
	    OpenLayers.Util.extend(this.config, config);
		
		// bind functions to the current scope		
		this.parseAgsGeometry.point = __bindFunction(this.parseAgsGeometry.point, this);
		this.parseAgsGeometry.path = __bindFunction(this.parseAgsGeometry.path, this);
		this.encodeAgsFeatureSet = __bindFunction(this.encodeAgsFeatureSet, this);
		this.encodeAgsFindParameters = __bindFunction(this.encodeAgsFindParameters, this);
	}
})();
