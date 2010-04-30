Ext.BLANK_IMAGE_URL = "../../../../geoext/apps/styler2/playground/externals/core/theme/images/default/s.gif";

var map =null;
var styler = null;

function init() {
	
	OpenLayers.Console.log("...initialize map...");
	initializeMap();	
	OpenLayers.Console.log("...initialize sld styler...");

	styler = new Styler({
		map: map,
		layerTreeDiv: "layerTree",
		legendDiv: "legend",
		themeImgUrl: "../../../../geoext/apps/styler2/playground/theme/img/",				
		wmsUrl:"http://4682_OGC_AGS_0:8399/arcgis/services/sanfrancisco_sld/MapServer/WMSServer?",
		wfsUrl:"http://4682_OGC_AGS_0:8399/arcgis/services/sanfrancisco_sld/MapServer/WFSServer?",
		/* 
		 * to use ProxyUrl "http://sazabi:8082/openlayers/ApacheProxyServlet?resourceUrl="
		 *   all "?" and "&" after resourceUrl must be url encoded as "%3F" and "%26"
		 */
		proxyUrl: "http://sazabi:8080/openlayers-2.8/ApacheProxyServlet?resourceUrl="
	});	
}

function initializeMap() {
	
	var lon = -122.451667;
	var lat = 37.740628;							
	var zoom = 10;
	
	var options = 	{
		controls: [ // 
       		new OpenLayers.Control.PanZoom2(),
			new OpenLayers.Control.ArgParser(),
            //new OpenLayers.Control.Attribution(),
            //new OpenLayers.Control.KeyboardDefaults(),
            new OpenLayers.Control.LayerSwitcher2(),
            //new OpenLayers.Control.OverviewMap(),
            new OpenLayers.Control.Navigation()
       	],
		projection: "EPSG:4326",		        		        	
		maxResolution: 0.3515625,		        	        
		maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90)
	};
								
	map = new OpenLayers.Map('map', options);
							
	var agsTiledLayer = new OpenLayers.Layer.AgsTiled( 
		"AgsTiled Layer (EPSG:4326)", 
		"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/tile/", 
		{					
			tileSize: new OpenLayers.Size(512, 512),
			tileFormat:'jpg',
			tileOrigin: new OpenLayers.LonLat(-180, 90),
			tileFullExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
			isBaseLayer: true,
			singleTile: false					 					
		}
	);  
	map.addLayer(agsTiledLayer);										   																			 		
	
	map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
}

// Sample style you can configure through the styler UI
/*
<sld:Rule>
	<sld:Name>calles</sld:Name>
	<sld:Title>calles</sld:Title>
	<sld:LineSymbolizer>
		<sld:Stroke>
			<sld:CssParameter name="stroke">#ff0000</sld:CssParameter>
			<sld:CssParameter name="stroke-opacity">1</sld:CssParameter>
			<sld:CssParameter name="stroke-width">1</sld:CssParameter>
			<sld:CssParameter name="stroke-linejoin">round</sld:CssParameter>
            <sld:CssParameter name="stroke-linecap">round</sld:CssParameter>
		</sld:Stroke>
	</sld:LineSymbolizer>
</sld:Rule>
<sld:Rule>
	<sld:Name>autopista</sld:Name>
	<sld:Title>autopista</sld:Title>
	<ogc:Filter>
		<ogc:PropertyIsEqualTo>
			<ogc:PropertyName>ROAD_TYPE</ogc:PropertyName>
			<ogc:Literal>Major Roads/Highways</ogc:Literal>
		</ogc:PropertyIsEqualTo>
	</ogc:Filter>
	<sld:LineSymbolizer>
		<sld:Stroke>
			<sld:CssParameter name="stroke">#0000FF</sld:CssParameter>
			<sld:CssParameter name="stroke-opacity">1</sld:CssParameter>
			<sld:CssParameter name="stroke-width">2</sld:CssParameter>
			<sld:CssParameter name="stroke-linejoin">round</sld:CssParameter>
            <sld:CssParameter name="stroke-linecap">round</sld:CssParameter>
		</sld:Stroke>
	</sld:LineSymbolizer>
</sld:Rule>
<sld:Rule>
	<sld:Name>rampa</sld:Name>
	<sld:Title>rampa</sld:Title>
	<ogc:Filter>
		<ogc:PropertyIsEqualTo>
			<ogc:PropertyName>HWYNAME</ogc:PropertyName>
			<ogc:Literal>RAMP</ogc:Literal>
		</ogc:PropertyIsEqualTo>
	</ogc:Filter>
	<sld:LineSymbolizer>
		<sld:Stroke>
			<sld:CssParameter name="stroke">#00FF00</sld:CssParameter>
			<sld:CssParameter name="stroke-opacity">1</sld:CssParameter>
			<sld:CssParameter name="stroke-width">2</sld:CssParameter>
			<sld:CssParameter name="stroke-linejoin">round</sld:CssParameter>
            <sld:CssParameter name="stroke-linecap">round</sld:CssParameter>
		</sld:Stroke>
	</sld:LineSymbolizer>
</sld:Rule>
 */
