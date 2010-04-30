/* 
	global variables
*/
var map;

var select_controls;
var insert_controls;
var modify_controls;
var remove_controls;

var current_edit_operation;
var current_active_featuretype;
var current_selected_feature;
var current_selected_feature_fid;

var features_to_commit = new Array();
var layers_to_commit = new Array();
			
function init() {							
	
	//var lon = 0;
	//var lat = 0;						
			
	var lon = -122.391667;
	var lat = 37.760628;
							
	var center_mercator = OpenLayers.Layer.SphericalMercator.forwardMercator(lon, lat);
	center_mercator_x = center_mercator.lon;
	center_mercator_y = center_mercator.lat;
							
	var zoom = 12;
					
	//var wfs_server_url = "http://localhost:8080/geoserver/wfs?";
	var wfs_server_url = "http://sazabi:8080/openlayers-2.8/ApacheProxyServlet?targetUrl=http://4682_OGC_AGS_0/arcgis/services/sanfrancisco_wfs_mercator/mapserver/wfsserver";				
	//var wfs_server_url = "http://sazabi:8080/openlayers-2.8/openlayers/2.8+/lib/OpenLayers/Util/openlayers-proxy-apache.jsp?targetUrl=http://sazabi/arcgis/services/sanfrancisco_wfst/geodataserver/wfsserver";
	var options = {
		          		//projection: "EPSG:4326"				               		     
		          		projection: "EPSG:900913",
	                	units: "m",
	                	maxResolution: 156543.0339,
	                	maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)	
		          };
	
	map = new OpenLayers.Map('map', options);

	// terrain image layer from google
			
	var google = new OpenLayers.Layer.Google( 
													"Google Maps", 
													{
														type: G_PHYSICAL_MAP, 
														//type: G_SATELLITE_MAP,
														//type: G_HYBRID_MAP,
														'maxZoomLevel':18,																	
														'sphericalMercator': true
													}
											   );

	map.addLayer(google);	
	
	/**
	 * Add 'esri:sanfrancisco_blockgroups' feature type to OpenLayers map
	 * Sample ArcGIS Server WFS service 'sanfrancisco_transactional' is required 
	 */
	var sanfrancisco_blockgroups = new OpenLayers.Layer.WFS2(
										"Blocks of SanFrancisco",
										wfs_server_url,
										{   
											VERSION: '1.1.0', 
											typename: 'esri:blockgroups',
											srsName: 'EPSG:102113',											
											//maxfeatures: 49														                                       																									
										},													
										{																												
											httpMode: 'AUTO', 							// always use 'AUTO' or 'POST' with OpenLayers.Layer.WFS2
											featureNS: 'http://www.esri.com', 			// namespace uri of target WFS service
											featurePrefix: 'esri', 						// namespace prefix of target WFS service
											geometry_column: 'Shape', 					// geometry attribute name of a feature type, always use 'Shape' for ArcGIS Server WFS service 
											assumedGeometryType: 'Polygon',
											srsUrn: "urn:x-ogc:def:crs:EPSG:102113",	// geometry of features in WFS GetFeature response will be in this spatial coordinate system											
											swapAxis: false,							// set it to 'true' if you need latitude ahead of longitude
											lockExpiry: '5', 							// lock expiry time in minutes
											typeName: "blockgroups",		// WFS feature type name													
											extractAttributes: true,					// whether you need to extrasct non-spatial attributes of a feature
											multiPolygonGeometryType: "MultiSurface",	// GML ploygon geometry type of polygon feature type, could be 'MultiPolygon' in other cases 
											isBaseLayer: false,							// do not set it as BaseLayer
											singleTile: true,
											style: OpenLayers.Layer.WFS2.style['wfs-polygon']												
										}
									);
	sanfrancisco_blockgroups.setVisibility(false);										// turn off the layer initially when client application started
	map.addLayer(sanfrancisco_blockgroups);
	
	var sanfrancisco_highways = new OpenLayers.Layer.WFS2(
										"Highways of SanFrancisco",
										wfs_server_url,
										{   
											VERSION: '1.1.0',
											typename: 'esri:highways',
											srsName: 'EPSG:102113'  														                                       																									
										},													
										{																												
											httpMode: 'AUTO',
											featureNS: 'http://www.esri.com',
											featurePrefix: 'esri',
											geometry_column: 'Shape',
											assumedGeometryType: 'LineString',
											srsUrn: "urn:x-ogc:def:crs:EPSG:102113",											
											swapAxis: false,
											lockExpiry: '5',
											typeName: "highways",														
											extractAttributes: true,
											multiLineStringGeometryType: "MultiCurve",	// GML MultiLineString geometry type of polygon feature type, could be 'MultiLineString' in other cases
											isBaseLayer: false,
											singleTile: true,
											style: OpenLayers.Layer.WFS2.style['wfs-polyline']																									
										}
									);
	sanfrancisco_highways.setVisibility(false);
	map.addLayer(sanfrancisco_highways);
	
	var sanfrancisco_pizzastores = new OpenLayers.Layer.WFS2(
										"Pizzastores of SanFrancisco",
										wfs_server_url,
										{   
											VERSION: '1.1.0',
											typename: 'esri:pizzastores',
											srsName: 'EPSG:102113'  														                                       																									
										},													
										{																												
											httpMode: 'AUTO',
											featureNS: 'http://www.esri.com',
											featurePrefix: 'esri',
											geometry_column: 'Shape',
											assumedGeometryType: 'Point',
											srsUrn: "urn:x-ogc:def:crs:EPSG:102113",											
											swapAxis: false,
											lockExpiry: '5',
											typeName: "pizzastores",	
											extractAttributes: true,													
											isBaseLayer: false,
											singleTile: true,
											style: OpenLayers.Layer.WFS2.style['wfs-point']											
										}
									);
	sanfrancisco_pizzastores.setVisibility(false);
	map.addLayer(sanfrancisco_pizzastores);
	
	/* wfs transaction */		           
	
	modify_controls = new Array(); /* modify feature controls */
	select_controls = new Array(); /* select feature controls */
	remove_controls = new Array(); /* remove feature controls */
	insert_controls = new Array(); /* insert feature controls */
	
	var featureAddedCallback = function(feature) { 
							   		feature.state = OpenLayers.State.INSERT; 
									feature.style = OpenLayers.Feature.Vector.style['inserted'];											              									              	
									feature.layer.drawFeature(feature);
									if(!layers_to_commit[feature.layer.name]) {
										layers_to_commit[feature.layer.name] = feature.layer;
									}
									features_to_commit.push(feature);																	              
									return false;
							   };
	
	var modifyOptions = {
			                //onModificationStart: function(feature) {},
			                //onModificationEnd: function(feature) {},
			                onModification: function(feature) {
			                    feature.state = OpenLayers.State.UPDATE;
			                    if(!layers_to_commit[feature.layer.name]) {
									layers_to_commit[feature.layer.name] = feature.layer;
								}
				            	features_to_commit.push(feature);			                    
			                }			                
			            };
			            
	var selectOptions = {
							multiple: false,
							//hover: true,
							onSelect: function(feature) {							
								OpenLayers.Console.debug("feature selected...");															
								current_selected_feature = feature.clone();
								current_selected_feature_fid = feature.fid;
								OpenLayers.Console.debug("currently selected feature id: " + current_selected_feature_fid);
								if(feature.attributes) {
									var attributes_grid = Ext.getCmp('ext-grid-attributes');									
									if(attributes_grid) {										
										attributes_grid.setSource(feature.attributes);																		
									}
								}																													
							},
							onUnselect: function(feature) {
								OpenLayers.Console.debug("feature unselected...");
								OpenLayers.Console.debug("unselected feature id: " + feature.fid);
								current_selected_feature = null;
								current_selected_feature_fid = null;
								OpenLayers.Console.debug("currently selected feature id: " + current_selected_feature_fid);
								var attributes_grid = Ext.getCmp('ext-grid-attributes');
								var empty = {};
								attributes_grid.setSource(empty);
								//Ext.getCmp('ext-button-save-attribute').setDisabled(true);
								if(this.layer.getLockedFeatureByFeatureId(feature.fid)) {
									this.layer.eraseFeatures([feature]);
									this.layer.drawFeature(feature, OpenLayers.Feature.Vector.style['locked']);
								}
								if(feature.state == OpenLayers.State.DELETE) {
						        	this.layer.eraseFeatures([feature]);
						        }
							}
						};
			            
	var removeOptions = {
							multiple:false,
							hover: true,
							onUnselect: function(feature) {
						        if(feature.state == OpenLayers.State.DELETE) {
						        	this.layer.eraseFeatures([feature]);
						        }
						    },
						    removeFeature: function(feature) {
						    	if(this.layer.getLockedFeatureByFeatureId(feature.fid) == null) {
									alert("Feature is not locked...it can not be updated...");									
									this.unselect(feature);
									return false;
							 	} else {			                    
							    	feature.state = OpenLayers.State.DELETE; 						              	
									this.layer.eraseFeatures([feature]);
									if(!layers_to_commit[feature.layer.name]) {
										layers_to_commit[feature.layer.name] = feature.layer;
									}
									features_to_commit.push(feature);								              	
									return false;
								}
						    },						
						};
			            
	for(var i=0; i<map.getNumLayers(); i++) {
		if(map.layers[i].CLASS_NAME == "OpenLayers.Layer.WFS2") {
			
			var modifyFeatureControl = new OpenLayers.Control.UpdateWFS2Feature(map.layers[i], modifyOptions)				
			/* only works for OpenLayers 2.6 or beyond */
			//modifyFeatureControl.mode = OpenLayers.Control.ModifyFeature.ROTATE;
			//modifyFeatureControl.mode = OpenLayers.Control.ModifyFeature.RESIZE;
			//modifyFeatureControl.mode = OpenLayers.Control.ModifyFeature.DRAG;
			
			var selectFeatureControl = new OpenLayers.Control.SelectWFS2Feature(map.layers[i], selectOptions);
			var removeFeatureControl = new OpenLayers.Control.DeleteWFS2Feature(map.layers[i], removeOptions);
			
			var insertFeatureControl = null;
			if(map.layers[i].options['assumedGeometryType'] == "Point") {
				insertFeatureControl = new OpenLayers.Control.DrawFeature(map.layers[i], OpenLayers.Handler.Point, {handlerOptions: {'freehand': false}, displayClass: 'olControlDrawFeaturePoint'});
			} else if(map.layers[i].options['assumedGeometryType'] == "LineString") {
				insertFeatureControl = new OpenLayers.Control.DrawFeature(map.layers[i], OpenLayers.Handler.MultiPath, {handlerOptions: {'freehand': false}, displayClass: 'olControlDrawFeaturePath'});
			} else if(map.layers[i].options['assumedGeometryType'] == "Polygon") {
				insertFeatureControl = new OpenLayers.Control.DrawFeature(map.layers[i], OpenLayers.Handler.MultiPolygon, {handlerOptions: {'freehand': false}, displayClass: 'olControlDrawFeaturePolygon'});
			}
			
			insertFeatureControl.featureAdded = featureAddedCallback;
			
			map.addControl(modifyFeatureControl);
			map.addControl(selectFeatureControl);
			map.addControl(removeFeatureControl);
			map.addControl(insertFeatureControl);
			
			var featuretypename = map.layers[i].params.typename.split(":")[1];
			modify_controls[featuretypename] = modifyFeatureControl;
			select_controls[featuretypename] = selectFeatureControl;
			remove_controls[featuretypename] = removeFeatureControl;
			insert_controls[featuretypename] = insertFeatureControl;
		}
	}	
							
	//map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
	map.setCenter(new OpenLayers.LonLat(center_mercator_x, center_mercator_y), zoom);
	map.addControl(new OpenLayers.Control.MouseDefaults());
	map.addControl(new OpenLayers.Control.LayerSwitcher());
	map.addControl(new OpenLayers.Control.PanZoomBar());
	map.addControl(new OpenLayers.Control.NavToolbar());
	
	Ext.onReady(extOnReady);
	OpenLayers.Console.debug("application initialized...");
}

/*
function removeFeatures() {
	if($('remove_radio').checked == true) {
		var selected_index = $('layers_select').selectedIndex;
        var selected_layer_index = $('layers_select').options[selected_index].value;
        var features_to_remove = map.layers[selected_layer_index].selectedFeatures;
        for(var i=0; i<features_to_remove.length; i++) {
        	var feature = features_to_remove[i];
        	feature.state = OpenLayers.State.DELETE; 					              	
			map.layers[selected_layer_index].eraseFeatures([feature]);
			if(!layers_to_commit[feature.layer.name]) {
				layers_to_commit[feature.layer.name] = feature.layer;
			}
			features_to_commit.push(feature);
        }
        return false;
	}
}
*/

function clearSelectedFeatures() {
	if(current_edit_operation == 'select') {
        for(var i=0; i<map.layers.length; i++) {
	        if(map.layers[i].CLASS_NAME == "OpenLayers.Layer.WFS2") {
		        if(map.layers[i].params.typename.split(":")[1] == current_active_featuretype) {
			        var features_selected = map.layers[i].selectedFeatures;
			        var features_to_clear = new Array();
			        for(var j=0; j<features_selected.length; j++) {	
			        	if(features_selected[j].CLASS_NAME == "OpenLayers.Feature.Vector") {
			        		features_to_clear.push(features_selected[j]);
			        	}				              				
			        }
			        for(key in features_to_clear) {
			        	if(features_to_clear[key].CLASS_NAME == "OpenLayers.Feature.Vector") {
			        		select_controls[current_active_featuretype].unselect(features_to_clear[key]);
			        	}
			        } 
			    }
			}
	    }       
        return false;
	}	
}

function toggleSelectFeaturesControl(element) {
	deactivateAllControls();
	var controls = select_controls;	
	if(element.pressed == true) { 
	    current_edit_operation = 'select';
	    for(key in controls) {
	        var control = controls[key];        
	        if(current_active_featuretype == key) {
	            control.activate();
	        }
	    }
	} else {
		current_edit_operation = 'none';
		for(key in controls) {
	        var control = controls[key];        
	        if(current_active_featuretype == key) {
	            control.deactivate();
	        }
	    }
	}
}

function switchEditOperation(element) {
	deactivateAllControls();
    var controls;
    if(element.value == 'select') {
    	controls = select_controls;
    	current_edit_operation = 'select';
    } else if(element.value == 'modify') {
    	controls = modify_controls;
    	current_edit_operation = 'modify';
    } else if(element.value == 'remove') {
    	controls = remove_controls;
    	current_edit_operation = 'remove';
    } else if(element.value == 'insert') {
    	controls = insert_controls;
    	current_edit_operation = 'insert';
    }
    
    for(key in controls) {
        var control = controls[key];        
        if(current_active_featuretype == key) {
            control.activate();
        }
    }
}	

function switchFeatureType(featureTypeName) {
   	deactivateAllControls();
   	if(current_edit_operation == 'select') {
   		select_controls[featureTypeName].activate();
   	} else if(current_edit_operation == 'modify') {
   		modify_controls[featureTypeName].activate();
   	} else if(current_edit_operation == 'remove') {
   		remove_controls[featureTypeName].activate();
   	} else if(current_edit_operation == 'insert') {
   		insert_controls[featureTypeName].activate();
   	}
}
    
function deactivateAllControls() {
   	//deactivate all select feature controls
   	for(key in select_controls) {
    	if(select_controls[key].deactivate) {
    		select_controls[key].deactivate();
    	}
    }
    //deactivate all insert feature controls
   	for(key in insert_controls) {
    	if(insert_controls[key].deactivate) {
    		insert_controls[key].deactivate();
    	}
    }
    //deactivate all modify feature controls
    for(key in modify_controls) {
    	if(modify_controls[key].deactivate) {
    		modify_controls[key].deactivate();
    	}
    }
    
    //deactivate all remove feature controls
    for(key in remove_controls) {
    	if(remove_controls[key].deactivate) {
    		remove_controls[key].deactivate();
    	}
    }
}

function commitChanges() {
	for(key in layers_to_commit) {
		if(layers_to_commit[key] && layers_to_commit[key].commit) {
			layers_to_commit[key].commit();
			layers_to_commit[key] = null;
		}
	}
}

/*
function commitChangesWithLock() {
	for(key in layers_to_commit) {
		if(layers_to_commit[key] && layers_to_commit[key].commitWithLock) {
			layers_to_commit[key].commitWithLock();
			layers_to_commit[key] = null;
		}
	}
}
*/

/*
function undo() {
	var feature = features_to_commit.pop();
	if(feature && feature.state) {
		if(feature.state == OpenLayers.State.DELETE) {
			feature.state = null;
			feature.layer.drawFeature(feature);
		} else if(feature.state == OpenLayers.State.INSERT) {
			feature.state = null;
			feature.layer.eraseFeatures([feature]);
			feature.layer.removeFeatures([feature]);
		} else if(feature.state == OpenLayers.State.UPDATE) {
		
		}
	}
}
*/

function lockSelectedFeatures() {
	for(var i=0; i<map.layers.length; i++) {
        if(map.layers[i].CLASS_NAME == "OpenLayers.Layer.WFS2") {
	        if(map.layers[i].params.typename.split(":")[1] == current_active_featuretype) {
		         map.layers[i].lockSelectedFeatures();
		    }
		}
    } 
}

function lockFeaturesInCurrentExtext() {
	for(var i=0; i<map.layers.length; i++) {
        if(map.layers[i].CLASS_NAME == "OpenLayers.Layer.WFS2") {
	        if(map.layers[i].params.typename.split(":")[1] == current_active_featuretype) {
		         map.layers[i].lockFeaturesInCurrentExtent();
		    }
		}
    } 
}

function releaseLockedFeatures() {
	for(var i=0; i<map.layers.length; i++) {
        if(map.layers[i].CLASS_NAME == "OpenLayers.Layer.WFS2") {
	        if(map.layers[i].params.typename.split(":")[1] == current_active_featuretype) {
		         map.layers[i].releaseLockedFeatures();
		    }
		}
    } 
}

function saveFeatureAttribute() {
	for(var i=0; i<map.layers.length; i++) {
        if(map.layers[i].CLASS_NAME == "OpenLayers.Layer.WFS2") {
	        if(map.layers[i].params.typename.split(":")[1] == current_active_featuretype) {
		         map.layers[i].saveFeatureAttribute();
		    }
		}
    } 
}

	        