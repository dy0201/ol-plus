/**
 * @requires OpenLayers/Format.js
 * @requires OpenLayers/Format/SQL.js
 */

/**
 * Class: OpenLayers.Format.SQL.PostGIS_SQL
 * 
 * Format class to convert an OpenLayers filter (FeatureId, Comparison, Logical, and Spatial) -
 * - into a PostGIS specific SQL statement 'WHERE' clause.
 * 
 * Inherits from:
 *  - <OpenLayers.Format>
 */
OpenLayers.Format.SQL.PostGIS_SQL = OpenLayers.Class(OpenLayers.Format, {
    
    /**
     * API Property: fidName
     * {String}
     * 
     * A name of one PostGIS feature class/table column which contains the id of the feature -
     * - it is used to query PostGIS feature class in FeatureId filter. it actually doesn't need to be -
     * - an id, instead it can be any column of the spatial table as long as you want to use it -
     * - in query through FeatureId filter. 
     *  
     */
	fidName: "id",
	
	/**
	 * API Property: geometryName
	 * {String}
	 * 
	 * The name of the geometry column in a PostGIS feature class/table, which will be used to create -
	 * - SQL spatial query from spatial filters like BBOX, WITHIN, or INTERSECTS etc.
	 */
	geometryName: "the_geom",
	
	/**
	 * API Property: srid
	 * {String}
	 * 
	 * The wkid/srid of the geometry in spatial filters like BBOX, WITHIN, or INTERSECTS etc, which will be -
	 * - used in PostGIS SQL statement. The reason to introduce this extra srid is because Openlayers Geoemtries -
	 * - does not have a native wkid/srid with them.
	 */
	srid: "4326",
	
	/**
	 * API Property: wktEncoder
	 * {<OpenLayers.Format.*>} by default: {<OpenLayers.Format.WKT>} 
	 * 
	 * An OpenLayers Format to encode OpenLayers geometries into well-known text -
	 * - which then can be input of PostGIS spatial functions in SQL statement.
	 */
	wktEncoder: null,
		
	/**
     * Constructor: OpenLayers.Format.Filter.PostGIS_SQL  
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
	initialize: function(options) {
	    OpenLayers.Format.prototype.initialize.apply(this, [options]);
	    // initialize a WKT format to parse/encode WKT
	    if(this.wktEncoder == null) {
	    	this.wktEncoder = new OpenLayers.Format.WKT({});
	    }
	},
    
    /**
     * API Method: write
     *
     * Parameters:
     * options - {object} A object, possible configure:
     * 
     * 	- 'sqlType': "Select", "Insert", "Update", "Delete", or "Where"
     *  - 'filter': <OpenLayers.Filter> to create where clause
     *  TODO:
     *  - 'dbName'
     *  - 'tableName'
     *  - 'responseType'
     *  - 'alias'
     *
     * Returns:
     * {String} An SQL statement where clause
     */
    write: function(options) {
        /*
         * sqlType could be one of the following: 
         * 		
         * 		'Select': to read features from database;
         * 		'Insert': to add features into database;
         * 		'Update': to modify features in database;
         * 		'Delete': to delete features from database;
         */		
		var sqlType = options.sqlType;
		// pick up the right encode function based on
		return this.writers[sqlType].apply(this, [options]);
    },
    
    /**
     * API Property: writers
     * A set of functions to encode different OpenLayers filters into SQL WHERE clause 
     */
    writers: {
        "Select": function(options) {    		    		    	
    		var pgOutputFunc = this.getPostGISGeometryOutputFuncType(options.responseType);     		
    		
    		var selectClause = "SELECT " + pgOutputFunc + "(" + this.geometryName + ")" + " AS " + this.geometryName + " FROM " + options.tableName;    		
    		var whereClause = this.writers["Where"].apply(this, [options.filter]);
    		
    		return selectClause + " " + whereClause;     	     	
    	},
    	/*
    	 * options for an 'Insert' SQL statement
    	 * 		options.features contains array of features to be inserted
    	 */
    	"Insert": function(options) {    		
    		//
    		var features = options.features;
    		
    		var sql =  
    			"INSERT INTO " 
    			+ options.tableName + " ("
    			+ this.geometryName + ")" + " VALUES "; 
    		
    		for(var i=0; i<features.length; i++) {
    			var feature = feature[i]; 
    			var geometry_wkt = this.wktEncoder.write(feature);
    			sql = sql + "(" + "ST_GeomFromText(" + "'" + geometry_wkt + "'" + ", " + this.srid + ")" + ")";
    		}
    			
    			"("
    			+ 
    			+ ")";
    		
    		return sql; 
    	},
    	"Update": function(options) {
    		return "";
    	},
    	"Delete": function(options) {
    		return "";
    	},
    	// root of an OpenLayers filter so begins the 'WHERE' clause
    	"Where": function(filter) {
            var sql = "WHERE ";
            // find out what type of filter it is
            var type = filter.CLASS_NAME.split(".").pop();
            if(type == "FeatureId") {
                for(var i=0; i<filter.fids.length; ++i) {                    
                	if(sql == "WHERE ") {
                		sql = sql + this.writeSql("FeatureId", filter.fids[i]);
                	} else {
                		sql = sql + " OR " + this.writeSql("FeatureId", filter.fids[i]);
                	}
                }
            } else {
            	sql = sql + this.writeSql([this.getFilterType(filter)], filter);
            }
            return sql;
        },
        // FeatureId filter
        "FeatureId": function(fid) {            
        	return "(" + this.fidName + " = " + fid + ")";
        },
        "And": function(filter) {
        	var childFilter;
            var sql = "";            
        	for(var i=0; i<filter.filters.length; ++i) {
                childFilter = filter.filters[i];                
                if(sql == "") {
                	sql = sql + this.writeSql(this.getFilterType(childFilter), childFilter);
                } else {
                	sql = sql + " AND " + this.writeSql(this.getFilterType(childFilter), childFilter);
                }                
            }
        	return "(" + sql + ")";
        },
        "Or": function(filter) {
        	var childFilter;
            var sql = "";            
        	for(var i=0; i<filter.filters.length; ++i) {
                childFilter = filter.filters[i];                
                if(sql == "") {
                	sql = sql + this.writeSql(this.getFilterType(childFilter), childFilter);
                } else {
                	sql = sql + " OR " + this.writeSql(this.getFilterType(childFilter), childFilter);
                }                
            }
        	return "(" + sql + ")";
        },
        "BBOX": function(filter) {
        	// if filter.value is an instance of <OpenLayers.Bounds>
        	//     then it's a BBOX spatial filter 
        	if(filter.value instanceof OpenLayers.Bounds) {
        		var minx = filter.value.left;
        		var miny = filter.value.bottom;
        		var maxx = filter.value.right;
        		var maxy = filter.value.top;        		
        	}        	        	
        	/*
        	 * An example from PostGIS doc:
        	 *     ST_MakeBox2D
        	 * 
        	 * --Return all features that fall reside or partly reside in a US national atlas coordinate bounding box
        	 * --It is assumed here that the geometries are stored with SRID = 2163 (US National atlas equal area)
        	 * 
        	 * 		SELECT feature_id, feature_name, the_geom
        	 * 		FROM features
        	 * 		WHERE the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(-989502.1875, 528439.5625), ST_Point(-987121.375 ,529933.1875)),2163)
        	 */
        	return "(" + this.geometryName + " && " 
        		+ "ST_SetSRID(ST_MakeBox2D(ST_Point(" + minx + ", " + miny + "), ST_Point(" + maxx + " ," + maxy + "))," + this.srid + ")" + ")";
        },
        "PropertyIsEqualTo": function(filter) {
        	var property = filter.property || "property";
        	var value = filter.value || "value";
        	/* 
        	 * TODO: for columns of String type it makes sense to add single quote around value -
        	 * - but for integer/float column, adding single quote make cause trouble in SQL execution - 
        	 * - it seems that PostGIS is tolerant on this. E.g. id is an integer column, but both (id = '1') -
        	 * - and (id = 1) will find record.
        	 */
        	return "(" + property + " = " + "'" + value + "'" + ")";
        },           
        "PropertyIsGreaterThan": function(filter) {
        	var property = filter.property || "property";
        	var value = filter.value || "value";
        	/* 
        	 * TODO: for columns of String type it makes sense to add single quote around value -
        	 * - but for integer/float column, adding single quote make cause trouble in SQL execution - 
        	 * - it seems that PostGIS is tolerant on this. E.g. id is an integer column, but both (id = '1') -
        	 * - and (id = 1) will find record.
        	 */
        	return "(" + property + " > " + "'" + value + "'" + ")";        	
        },
        "PropertyIsLessThan": function(filter) {
        	var property = filter.property || "property";
        	var value = filter.value || "value";
        	/* 
        	 * TODO: for columns of String type it makes sense to add single quote around value -
        	 * - but for integer/float column, adding single quote make cause trouble in SQL execution - 
        	 * - it seems that PostGIS is tolerant on this. E.g. id is an integer column, but both (id = '1') -
        	 * - and (id = 1) will find record.
        	 */
        	return "(" + property + " < " + "'" + value + "'" + ")";        	
        },
        "PropertyIsLessThanOrEqualTo": function(filter) {
        	var property = filter.property || "property";
        	var value = filter.value || "value";
        	/* 
        	 * TODO: for columns of String type it makes sense to add single quote around value -
        	 * - but for integer/float column, adding single quote make cause trouble in SQL execution - 
        	 * - it seems that PostGIS is tolerant on this. E.g. id is an integer column, but both (id = '1') -
        	 * - and (id = 1) will find record.
        	 */
        	return "(" + property + " <= " + "'" + value + "'" + ")";   
        },
        "PropertyIsGreaterThanOrEqualTo": function(filter) {
        	var property = filter.property || "property";
        	var value = filter.value || "value";
        	/* 
        	 * TODO: for columns of String type it makes sense to add single quote around value -
        	 * - but for integer/float column, adding single quote make cause trouble in SQL execution - 
        	 * - it seems that PostGIS is tolerant on this. E.g. id is an integer column, but both (id = '1') -
        	 * - and (id = 1) will find record.
        	 */
        	return "(" + property + " >= " + "'" + value + "'" + ")";
        },
        "PropertyIsBetween": function(filter) {
        	var property = filter.property || "property";
        	var lowerBoundary = filter.lowerBoundary;
        	var upperBoundary = filter.upperBoundary;
        	if(!lowerBoundary || !upperBoundary) {
        		throw "...invalid 'PropertyIsBetween' filter...upper or lower boundary missing...";
        		return "";
        	}
        	return "(" + property + " BETWEEN " + "'" + lowerBoundary + "'" + " AND " + "'" + upperBoundary + "'" + ")";        	
        },
        "PropertyIsLike": function(filter) {
        	var property = filter.property || "property";
        	var value = filter.value || "value";
        	/* 
        	 * TODO: for columns of String type it makes sense to add single quote around value -
        	 * - but for integer/float column, adding single quote make cause trouble in SQL execution - 
        	 * - it seems that PostGIS is tolerant on this. E.g. id is an integer column, but both (id = '1') -
        	 * - and (id = 1) will find record.
        	 */
        	return "(" + property + " LIKE " + "'" + value + "'" + ")";
        },
        "INTERSECTS": function(filter) {        	
        	var property = filter.property || "property";
        	var geometry = filter.value;        	
        	if(OpenLayers.Util.AgsUtil.isOLGeometry(geometry) == true) {
        		var geometry_wkt = this.wktEncoder.write(new OpenLayers.Feature.Vector(geometry));
        		/*
        		 * A sample PostGIS SQL for 'intersects' filter:
        		 * 
        		 * SELECT ST_AsGeoJSON(the_geom) AS the_geom 
        		 * FROM historical_sites
        		 * WHERE (ST_Intersects(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true)
        		 */
        		return "(" + "ST_Intersects(" + this.geometryName + ", " + "ST_GeomFromText(" + "'" + geometry_wkt + "'" + ", " + this.srid + ")) = true)";
        	} else {
        		throw "...invalid geometry in INTERSECTS filter...";
        		return "";
        	}        	        	
        },
        "WITHIN": function(filter) {
        	var property = filter.property || "property";
        	var geometry = filter.value;        	
        	if(OpenLayers.Util.AgsUtil.isOLGeometry(geometry) == true) {
        		var geometry_wkt = this.wktEncoder.write(new OpenLayers.Feature.Vector(geometry));
        		/*
        		 * A sample PostGIS SQL for 'intersects' filter:
        		 * 
        		 * SELECT ST_AsGeoJSON(the_geom) AS the_geom 
        		 * FROM historical_sites
        		 * WHERE (ST_Within(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true)
        		 */
        		return "(" + "ST_Within(" + this.geometryName + ", " + "ST_GeomFromText(" + "'" + geometry_wkt + "'" + ", " + this.srid + ")) = true)";
        	} else {
        		throw "...invalid geometry in WITHIN filter...";
        		return "";
        	}
        },
        "CONTAINS": function(filter) {
        	var property = filter.property || "property";
        	var geometry = filter.value;        	
        	if(OpenLayers.Util.AgsUtil.isOLGeometry(geometry) == true) {
        		var geometry_wkt = this.wktEncoder.write(new OpenLayers.Feature.Vector(geometry));
        		/*
        		 * A sample PostGIS SQL for 'intersects' filter:
        		 * 
        		 * SELECT ST_AsGeoJSON(the_geom) AS the_geom 
        		 * FROM historical_sites
        		 * WHERE (ST_Contains(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true)
        		 */
        		return "(" + "ST_Contains(" + this.geometryName + ", " + "ST_GeomFromText(" + "'" + geometry_wkt + "'" + ", " + this.srid + ")) = true)";
        	} else {
        		throw "...invalid geometry in CONTAINS filter...";
        		return "";
        	}
        },
        "DWITHIN": function(filter) {
        	var property = filter.property || "property";
        	var geometry = filter.value;     
        	/*
        	 * The distance is specified in units defined by the spatial reference system of the geometries.
        	 */
        	var distance =  filter.distance;  
        	if(OpenLayers.Util.AgsUtil.isOLGeometry(geometry) == true) {
        		var geometry_wkt = this.wktEncoder.write(new OpenLayers.Feature.Vector(geometry));
        		/*
        		 * A sample PostGIS SQL for 'intersects' filter:
        		 * 
        		 * SELECT ST_AsGeoJSON(the_geom) AS the_geom 
        		 * FROM historical_sites
        		 * WHERE (ST_Contains(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326), 5) = true)
        		 */
        		return "(" + "ST_DWithin(" + this.geometryName + ", " + "ST_GeomFromText(" + "'" + geometry_wkt + "'" + ", " + this.srid + "), " + distance + ") = true)";
        	} else {
        		throw "...invalid geometry in DWITHIN filter...";
        		return "";
        	}
        }        
    },
    
    /**
     * private method: writeSql
     * 
     * recursive method to loop through an OpenLayers filter and output a SQL WHERE clause
     */
    writeSql: function(name, obj) {        
        var child = this.writers[name].apply(this, [obj]);        
        return child;
    },

    /**
     * Method: getFilterType
     */
    getFilterType: function(filter) {
        var filterType = this.filterMap[filter.type];
        if(!filterType) {
            throw "Filter writing not supported for rule type: " + filter.type;
        }
        return filterType;
    },
    
    /**
     * 
     */
    getPostGISGeometryOutputFuncType: function(responseType) {
    	var funcType = this.postgisGeometryOutputMap[responseType];
    	if(!funcType) {
    		throw "...unsupported response type";
    	}
    	return funcType;
    },
    
    /**
     * Property: filterMap
     * {Object} Contains a member for each filter type.  Values are node names
     *     for corresponding OGC Filter child elements.
     */
    filterMap: {
        "&&": "And",
        "||": "Or",
        "!": "Not",
        "==": "PropertyIsEqualTo",
        "!=": "PropertyIsNotEqualTo",
        "<": "PropertyIsLessThan",
        ">": "PropertyIsGreaterThan",
        "<=": "PropertyIsLessThanOrEqualTo",
        ">=": "PropertyIsGreaterThanOrEqualTo",
        "..": "PropertyIsBetween",
        "~": "PropertyIsLike",
        "BBOX": "BBOX",
        "DWITHIN": "DWITHIN",
        "WITHIN": "WITHIN",
        "CONTAINS": "CONTAINS",
        "INTERSECTS": "INTERSECTS"
    },
    
    postgisGeometryOutputMap: {
    	'geojson': 	"ST_AsGeoJSON",
    	'gml':		"",
    	'kml':		""
    },

    CLASS_NAME: "OpenLayers.Format.SQL.PostGIS_SQL" 
});