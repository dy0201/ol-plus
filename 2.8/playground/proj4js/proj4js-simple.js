var map;
var popup;

var source_proj = new Proj4js.Proj("EPSG:4236");
var dest_proj = new Proj4js.Proj("EPSG:900913");

        
function init() {    
	OpenLayers.ProxyHost= "/openlayers-2.8/ApacheProxyServlet?resourceUrl=";
    
	var AutoSizeFramedCloud = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
        'autoSize': true
    });
	
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
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/tile/", 
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
    map.addLayer(base_layer);    
    
    // click control
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
    	
    	defaultHandlerOptions: {
            'single': true,
            'double': false,
            'pixelTolerance': 0,
            'stopSingle': false,
            'stopDouble': false
        },

        initialize: function(options) {
            
        	this.handlerOptions = OpenLayers.Util.extend(
                {}, this.defaultHandlerOptions
            );
        	
            OpenLayers.Control.prototype.initialize.apply(
                this, arguments
            );
            
            this.handler = new OpenLayers.Handler.Click(
                this, {
                    'click': this.trigger
                }, this.handlerOptions
            );
            
        }, 

        trigger: function(e) {
            var lonlat = map.getLonLatFromViewPortPx(e.xy);
            OpenLayers.Console.debug("EPSG:4326: " + lonlat.lon + "," + lonlat.lat);
            
            var proj4js_point = new Proj4js.Point(lonlat.lon, lonlat.lat);   //any object will do as long as it has 'x' and 'y' properties
            Proj4js.transform(source_proj, dest_proj, proj4js_point); 
            OpenLayers.Console.debug("EPSG:900913: " + proj4js_point.x + "," + proj4js_point.y);
            
            // create a customized projection (same as EPSG:900913 though)
            Proj4js.defs["EPSG:900914"]= "+title= Google Mercator EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
        
            var proj_900914 = new Proj4js.Proj("EPSG:900914");
            proj4js_point2 = new Proj4js.Point(lonlat.lon, lonlat.lat);
            Proj4js.transform(source_proj, proj_900914, proj4js_point2); 
            OpenLayers.Console.debug("EPSG:900914: " + proj4js_point2.x + "," + proj4js_point2.y);
        }

    });
    
    var lon = -122.40609; 
	var lat = 37.75560;
    var zoom = 10;
    	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);   
	
	var click = new OpenLayers.Control.Click();
    map.addControl(click);
    click.activate();
}

