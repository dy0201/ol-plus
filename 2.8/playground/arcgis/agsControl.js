var map;
var wfs_layer;
var bbox_strategy;
var ags_control;
        
function init() {    
	OpenLayers.ProxyHost= "/openlayers/ApacheProxyServlet?targetUrl=";
   
	var options = 	{
		//panMethod: null, // set 'panMethod' to null to disable animated panning
		controls: [
       		new OpenLayers.Control.LayerSwitcher2(),
       		new OpenLayers.Control.Navigation(),
       		new OpenLayers.Control.PanZoom2(),
       		new OpenLayers.Control.MousePosition()
       	],
        projection: "EPSG:4326",		        		        	
   		maxResolution: 0.3515625,		        	        
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
        
   	};

    map = new OpenLayers.Map('map', options);
	
    var base_layer = new OpenLayers.Layer.AgsTiled( 
		"esri_street_map", 
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/tile/", 
		{					
			tileSize: new OpenLayers.Size(512, 512),
			tileFormat:'jpg',
			tileOrigin: new OpenLayers.LonLat(-180, 90),
			tileFullExtent: new OpenLayers.Bounds(-180, -90, 180, 90), 	
			isBaseLayer: true,
			buffer: 0,
			singleTile: false					 					
		}
	); 
    
    /*
    // use this when there is no internet connection
    var base_layer = new OpenLayers.Layer.WMS(   
	 	"sf_blockgroups", 
		"http://sazabi:8079/geoserver-1.6.5/wms", 
		{ 											
			layers: 'esri:sf_blockgroups', // WMS layer name for 'counties' layer
			styles: '',																											
			srs: 'EPSG:4326',																																																									
			format: 'image/png',											
			transparent: true
		},
		{														
			isBaseLayer: true,
			singleTile: true,
			displayOutsideMaxExtent: true														
		}
	);
    */
    map.addLayer(base_layer);  
    
    // consume a WFS 1.1.0 service from ArcGIS Server
    var lon = -122.838493;
	var lat = 45.432976;
    var zoom = 12;
    
    bbox_strategy = new OpenLayers.Strategy.BBOX();
    
    wfs_layer = new OpenLayers.Layer.Vector(
    	"arcgis server wfs ", 
    	{
    		strategies: [
    		    bbox_strategy
    		],
    		protocol: new OpenLayers.Protocol.WFS2(    			    			    				
    			{
    				url: "http://sazabi/arcgis/services/sanfrancisco/GeoDataServer/WFSServer?",    				
    				format: new OpenLayers.Format.WFST2({
        				//version: "1.1.0",
    					srsName: "urn:x-ogc:def:crs:EPSG:6.9:4326",
    					schema: "http://sazabi/arcgis/services/sanfrancisco/GeoDataServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:pizzastores",
    					featureType: "pizzastores",
    					//schema: "http://sazabi/arcgis/services/sanfrancisco/GeoDataServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:highways",
    					//featureType: "highways",
    					//schema: "http://sazabi/arcgis/services/sanfrancisco/GeoDataServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:blockgroups",
    					//featureType: "blockgroups",
    					geometryName: "Shape",												
						geometryTypes: OpenLayers.Util.applyDefaults({ // overwrite this.geometryTypes to encode MultiLineString/MultiPolygon geometry in MultiCurve/MultiSurface
							'OpenLayers.Geometry.MultiLineString': "MultiCurve",
							'OpenLayers.Geometry.MultiPolygon': "MultiSurface"
						}, OpenLayers.Format.GML.Base.prototype.geometryTypes),						
    					featureNS: "http://www.esri.com",
    					featurePrefix: "esri",
    					//maxFeatures: 999,
    					extractAttributes: false,
    					//xy: false,
    					lockExpiry: "5",
        				releaseAction: "ALL",
    				})
    			})    			
    	}
    );
    //wfs_layer.setVisibility(false);
    //map.addLayer(wfs_layer);
    
	ags_control = new OpenLayers.Control.AgsGeoprocessor(
		"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Network/ESRI_DriveTime_US/GPServer/CreateDriveTimePolygons",
		null,		
		null,
		{
			mode: "draw",
			drawCtrlHandler: OpenLayers.Handler.Point,
			drawCtrlHandlerOptions: {
				handlerOptions: {
					keyMask: OpenLayers.Handler.MOD_CTRL
				}
			},
			taskParameters: {'Drive_Times':"1 2 4"},
		}
	);
	ags_control.geoprocessingParamsEnocoder = function(agsFeatureSet, tasksParameters){	
		OpenLayers.Console.log("...customized...encode geoprocessing parameters...");
		var params = {
			"Input_Location": agsFeatureSet,
			"Drive_Times": tasksParameters['Drive_Times']
		};
		return params;
	};
		
	ags_control.geoprocessingResultsParser = function(agsResults) {     	   
    	OpenLayers.Console.log("...customized...parse geoprocessing results...");
		var agsGraphics = agsResults[0].value.features;
		var olResults = this.adapter.parseAgsGraphics(agsGraphics);    	
    	return olResults;
    },
	
	map.addControl(ags_control);
	ags_control.activate();
	
    map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}

function toggleAgsControlMode() {
	if(ags_control.mode == "select") {
		ags_control.switchMode("draw");
	} else if(ags_control.mode == "draw") {
		ags_control.switchMode("select");
	}
}

function test() {
	
}

