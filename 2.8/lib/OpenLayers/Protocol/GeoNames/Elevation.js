/**
 * @requires OpenLayers/Protocol/GeoNames/Service.js
 */

/**
 * Class: OpenLayers.Protocol.GeoNames.Elevation
 * 
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */
OpenLayers.Protocol.GeoNames.Elevation = OpenLayers.Class(OpenLayers.Protocol.GeoNames.Service, {
	
	// see OpenLayers.Protocol.GeoNames.Service for details of each of following attributes
	
	/**
	 * 
	 */
	service: "Elevation",
	
	/**
	 * API Parameter: elevationDataSource
	 *     type of data where elevation value is retrieved
	 *     valid values are: "SRTM3"	 
	 * 
	 * "SRTM3": Shuttle Radar Topography Mission (SRTM) elevation data. SRTM consisted of a specially modified radar system that flew onboard the Space Shuttle Endeavour during an 11-day mission in February of 2000. The dataset covers land areas between 60 degrees north and 56 degrees south.
	 * 	   		This web service is using SRTM3 data with data points located every 3-arc-second (approximately 90 meters) on a latitude/longitude grid.
	 * 			sample area: ca 90m x 90m Result : a single number giving the elevation in meters according to srtm3, ocean areas have been masked as "no data" and have been assigned a value of -32768 
	 *    
	 * "ASTERGDEM": sample are: ca 30m x 30m, between 83N and 65S latitude. Result : a single number giving the elevation in meters according to aster gdem, ocean areas have been masked as "no data" and have been assigned a value of -9999
	 * 
	 * "GTOPO30": GTOPO30 is a global digital elevation model (DEM) with a horizontal grid spacing of 30 arc seconds (approximately 1 kilometer). GTOPO30 was derived from several raster and vector sources of topographic information.
	 * 			  sample area: ca 1km x 1km Result : a single number giving the elevation in meters according to gtopo30, ocean areas have been masked as "no data" and have been assigned a value of -9999   
	 */
	elevationDataSource: "SRTM3",	
	
	/**
	 * 
	 */
	isSpatialSearch: true,
		
	/**
	 * 
	 */
	spatialSearchType: "LonLat",
	
	/**
	 * 
	 */
	commonQueryParams: ['none'],
			
	/**
	 * 
	 */
	queryParams: {},
			
	/**
	 * 
	 */
	initialize: function(options) {		 
		OpenLayers.Protocol.GeoNames.Service.prototype.initialize.apply(this, [options]);
		// 
		if(this.elevationDataSource == "SRTM3") {
			this.urls['JSON'] = "http://ws.geonames.org/srtm3JSON?";
			this.urls['JSON_S'] = "http://ws.geonames.org/srtm3JSON?";
		} else if(this.elevationDataSource == "ASTERGDEM") {
			this.urls['JSON'] = "http://ws.geonames.org/astergdemJSON?";
			this.urls['JSON_S'] = "http://ws.geonames.org/astergdemJSON?";
		} else if(this.elevationDataSource == "GTOPO30") {
			this.urls['JSON'] = "http://ws.geonames.org/gtopo30JSON?";
			this.urls['JSON_S'] = "http://ws.geonames.org/gtopo30JSON?";
		}
	},
	
	CLASS_NAME: "OpenLayers.Protocol.GeoNames.Elevation" 
});