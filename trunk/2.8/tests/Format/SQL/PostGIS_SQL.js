/**
 * 
 * @param t
 * @return
 */
function test_featureid_filter(t) {
	//
	t.plan(2);	
		
	/*
	 * Sample SQL:
	 * select ST_AsGeoJSON(the_geom) AS the_geom FROM historical_sites WHERE (id = 1) OR (id = 2)
	 */
	var format = new OpenLayers.Format.SQL.PostGIS_SQL({
		fidName: "fid"
	});		
	var expected = "WHERE (fid = fid_1) OR (fid = fid_2) OR (fid = fid_3) OR (fid = fid_4) OR (fid = fid_5)";
	var filter = new OpenLayers.Filter.FeatureId({
		fids: ["fid_1", "fid_2", "fid_3", "fid_4", "fid_5"]
	});
	var whereClause = format.write(filter);	
	t.eq(whereClause, expected, "...where clause for multiple feature id filter...");
	
	/*
	 * Sample SQL:
	 * select ST_AsGeoJSON(the_geom) AS the_geom FROM historical_sites WHERE (id = 1)
	 */	
	format.fidName = "id";
	expected = "WHERE (id = fid_1)";
	filter = new OpenLayers.Filter.FeatureId({
		fids: ["fid_1"]
	});
	whereClause = format.write(filter);
	t.eq(whereClause, expected, "...where clause for single feature id filter...");
};

/**
 * 
 * @param t
 * @return
 */
function test_bbox_filter(t) {
	//
	t.plan(2);	
		
	/*
	 * Sample SQL:
	 */
	var format = new OpenLayers.Format.SQL.PostGIS_SQL({
		fidName: "id",
		geometryName: "Shape",
		srid: "2163"
	});		
	
	var expected = "WHERE (Shape && ST_SetSRID(ST_MakeBox2D(ST_Point(-989502.1875, 528439.5625), ST_Point(-987121.375 ,529933.1875)),2163))";
	var filter = new OpenLayers.Filter.Spatial({
		type: "BBOX",
		value: new OpenLayers.Bounds(-989502.1875, 528439.5625, -987121.375 ,529933.1875)
	});
	var whereClause = format.write(filter);	
	t.eq(whereClause, expected, "...where clause for 2136 bbox filter...");
	
	/*
	 * Sample SQL:
	 * 
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 * 	   FROM historical_sites 
	 * 	   WHERE the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)
	 */
    format = new OpenLayers.Format.SQL.PostGIS_SQL({
		//fidName: "id",
		//geometryName: "the_geom",
		//srid: "4326"
	});		
	
	expected = "WHERE (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326))";
	filter = new OpenLayers.Filter.Spatial({
		type: "BBOX",
		value: new OpenLayers.Bounds(11.2433, 39.43565, 16.8683 ,42.24815)
	});
	whereClause = format.write(filter);	
	t.eq(whereClause, expected, "...where clause for 4326 bbox filter...");	
};

/**
 * 
 * @param t
 * @return
 */
function test_propertyIsEqualTo_filter(t) {
	//
	t.plan(2);	
	
	/*
	 * Sample SQL:
	 * 
	 *     select ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites 
	 *     WHERE (name = 'Syracuse')
	 */
    var format = new OpenLayers.Format.SQL.PostGIS_SQL({});		
	
	var expected = "WHERE (name = 'Cumae')";
	var filter = new OpenLayers.Filter.Comparison({
		type: "==",
		property: "name",
		value: "Cumae" 
	});
	var whereClause = format.write(filter);	
	t.eq(whereClause, expected, "...where clause for '==' filter...");
	
	/*
	 * 
	 */			
	expected = "WHERE (property = 'value')";
	filter = new OpenLayers.Filter.Comparison({
		type: "=="
	});
	whereClause = format.write(filter);	
	t.eq(whereClause, expected, "...where clause for '==' filter with default values...");
};

/**
 * 
 * @param t
 * @return
 */
function test_propertyIsBetween_filter(t) {
	//
	t.plan(1);		
	/*
	 * Sample SQL:
	 * 
	 *     select ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites 
	 *     WHERE (id BETWEEN '1' AND '3')
	 */
    var format = new OpenLayers.Format.SQL.PostGIS_SQL({});		
	
	var expected = "WHERE (id BETWEEN '1' AND '3')";
	var filter = new OpenLayers.Filter.Comparison({
		type: "..",
		property: "id",
		lowerBoundary: 1,
		upperBoundary: 3
	});
	var whereClause = format.write(filter);	
	t.eq(whereClause, expected, "...where clause for between filter...");	
};

/**
 * 
 * @param t
 * @return
 */
function test_propertyIsLike_filter(t) {
	//
	t.plan(1);		
	/*
	 * Sample SQL:
	 * 
	 *     select ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites 
	 *     WHERE (name LIKE 'Cuma%')
	 */
    var format = new OpenLayers.Format.SQL.PostGIS_SQL({});		
	
	var expected = "WHERE (name LIKE 'Cuma%')";
	var filter = new OpenLayers.Filter.Comparison({
		type: "~",
		property: "name",
		value: "Cuma%"
	});
	var whereClause = format.write(filter);	
	t.eq(whereClause, expected, "...where clause for like filter...");	
};

/**
 * 
 */
function test_intersects_filter(t) {	
	t.plan(3);		
	var format = new OpenLayers.Format.SQL.PostGIS_SQL({});
	
	/*
	 * test 1: intersects with a point
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_Intersects(the_geom, ST_GeomFromText(POINT(0 0), 4326)) = true)
	 */
	var expected = "WHERE (ST_Intersects(the_geom, ST_GeomFromText('POINT(0 0)', 4326)) = true)";
	var intersects_filter1 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.INTERSECTS,
		//property: "the_geom",
		value: new OpenLayers.Geometry.Point(0,0)
	});	
	var whereClause = format.write(intersects_filter1);
	t.eq(whereClause, expected, "...where clause for a intersects filter against a point...");
	
	/*
	 * test 2: intersects with a linestring
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_Intersects(the_geom, ST_GeomFromText('LINESTRING(-2 -2,-1 -1,0 0,1 1,2 2)', 4326)) = true)
	 */
	var expected = "WHERE (ST_Intersects(the_geom, ST_GeomFromText('LINESTRING(-2 -2,-1 -1,0 0,1 1,2 2)', 4326)) = true)";
	var intersects_filter2 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.INTERSECTS,
		//property: "the_geom",
		value: new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(-2,-2),
            new OpenLayers.Geometry.Point(-1,-1),
            new OpenLayers.Geometry.Point(0,0),
            new OpenLayers.Geometry.Point(1,1),
            new OpenLayers.Geometry.Point(2,2)
		])
	});	
	var whereClause = format.write(intersects_filter2);
	t.eq(whereClause, expected, "...where clause for a intersects filter against a linestring...");
	
	/*
	 * test 2: intersects with a polygon
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     
	 */
	var expected = "WHERE (ST_Intersects(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true)";
	var intersects_filter3 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.INTERSECTS,
		//property: "the_geom",
		value: new OpenLayers.Geometry.Polygon([
		    new OpenLayers.Geometry.LinearRing([
		        new OpenLayers.Geometry.Point(-180,-90),
		        new OpenLayers.Geometry.Point(-180,90),
		        new OpenLayers.Geometry.Point(180, 90),
		        new OpenLayers.Geometry.Point(180, -90),
		        new OpenLayers.Geometry.Point(-180, -90)                                 
		    ])                                        
		]) 
	});	
	var whereClause = format.write(intersects_filter3);
	t.eq(whereClause, expected, "...where clause for a intersects filter against a polygon...");
}

/**
 * 
 */
function test_within_filter(t) {	
	t.plan(3);		
	var format = new OpenLayers.Format.SQL.PostGIS_SQL({});
	
	/*
	 * test 1: within with a point
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_Within(the_geom, ST_GeomFromText(POINT(0 0), 4326)) = true)
	 */
	var expected = "WHERE (ST_Within(the_geom, ST_GeomFromText('POINT(0 0)', 4326)) = true)";
	var within_filter1 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.WITHIN,
		//property: "the_geom",
		value: new OpenLayers.Geometry.Point(0,0)
	});	
	var whereClause = format.write(within_filter1);
	t.eq(whereClause, expected, "...where clause for a within filter against a point...");
	
	/*
	 * test 2: within with a linestring
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_Within(the_geom, ST_GeomFromText('LINESTRING(-2 -2,-1 -1,0 0,1 1,2 2)', 4326)) = true)
	 */
	var expected = "WHERE (ST_Within(the_geom, ST_GeomFromText('LINESTRING(-2 -2,-1 -1,0 0,1 1,2 2)', 4326)) = true)";
	var within_filter2 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.WITHIN,
		//property: "the_geom",
		value: new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(-2,-2),
            new OpenLayers.Geometry.Point(-1,-1),
            new OpenLayers.Geometry.Point(0,0),
            new OpenLayers.Geometry.Point(1,1),
            new OpenLayers.Geometry.Point(2,2)
		])
	});	
	var whereClause = format.write(within_filter2);
	t.eq(whereClause, expected, "...where clause for a within filter against a linestring...");
	
	/*
	 * test 2: within with a polygon
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_Within(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true)";
	 */
	var expected = "WHERE (ST_Within(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true)";
	var within_filter3 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.WITHIN,
		//property: "the_geom",
		value: new OpenLayers.Geometry.Polygon([
		    new OpenLayers.Geometry.LinearRing([
		        new OpenLayers.Geometry.Point(-180,-90),
		        new OpenLayers.Geometry.Point(-180,90),
		        new OpenLayers.Geometry.Point(180, 90),
		        new OpenLayers.Geometry.Point(180, -90),
		        new OpenLayers.Geometry.Point(-180, -90)                                 
		    ])                                        
		]) 
	});	
	var whereClause = format.write(within_filter3);
	t.eq(whereClause, expected, "...where clause for a within filter against a polygon...");
};

/**
 * 
 */
function test_contains_filter(t) {	
	t.plan(3);		
	var format = new OpenLayers.Format.SQL.PostGIS_SQL({});
	
	/*
	 * test 1: contains with a point
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_Contains(the_geom, ST_GeomFromText(POINT(0 0), 4326)) = true)
	 */
	var expected = "WHERE (ST_Contains(the_geom, ST_GeomFromText('POINT(0 0)', 4326)) = true)";
	var contains_filter1 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.CONTAINS,
		//property: "the_geom",
		value: new OpenLayers.Geometry.Point(0,0)
	});	
	var whereClause = format.write(contains_filter1);
	t.eq(whereClause, expected, "...where clause for a contains filter against a point...");
	
	/*
	 * test 2: contains with a linestring
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_Contains(the_geom, ST_GeomFromText('LINESTRING(-2 -2,-1 -1,0 0,1 1,2 2)', 4326)) = true)
	 */
	var expected = "WHERE (ST_Contains(the_geom, ST_GeomFromText('LINESTRING(-2 -2,-1 -1,0 0,1 1,2 2)', 4326)) = true)";
	var contains_filter2 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.CONTAINS,
		//property: "the_geom",
		value: new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(-2,-2),
            new OpenLayers.Geometry.Point(-1,-1),
            new OpenLayers.Geometry.Point(0,0),
            new OpenLayers.Geometry.Point(1,1),
            new OpenLayers.Geometry.Point(2,2)
		])
	});	
	var whereClause = format.write(contains_filter2);
	t.eq(whereClause, expected, "...where clause for a contains filter against a linestring...");
	
	/*
	 * test 2: contains with a polygon
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_Contains(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true)";
	 */
	var expected = "WHERE (ST_Contains(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true)";
	var contains_filter3 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.CONTAINS,
		//property: "the_geom",
		value: new OpenLayers.Geometry.Polygon([
		    new OpenLayers.Geometry.LinearRing([
		        new OpenLayers.Geometry.Point(-180,-90),
		        new OpenLayers.Geometry.Point(-180,90),
		        new OpenLayers.Geometry.Point(180,90),
		        new OpenLayers.Geometry.Point(180,-90),
		        new OpenLayers.Geometry.Point(-180,-90)                                 
		    ])                                        
		]) 
	});	
	var whereClause = format.write(contains_filter3);
	t.eq(whereClause, expected, "...where clause for a contains filter against a polygon...");
};

/**
 * 
 */
function test_dwithin_filter(t) {	
	t.plan(3);		
	var format = new OpenLayers.Format.SQL.PostGIS_SQL({});
	
	/*
	 * test 1: dwithin with a point
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_DWithin(the_geom, ST_GeomFromText(POINT(0 0), 4326)) = true)
	 */
	var expected = "WHERE (ST_DWithin(the_geom, ST_GeomFromText('POINT(0 0)', 4326), 5) = true)";
	var dwithin_filter1 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.DWITHIN,
		//property: "the_geom",
		value: new OpenLayers.Geometry.Point(0,0),
		distance: 5
	});	
	var whereClause = format.write(dwithin_filter1);
	t.eq(whereClause, expected, "...where clause for a dwithin filter against a point...");
	
	/*
	 * test 2: dwithin with a linestring
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_DWithin(the_geom, ST_GeomFromText('LINESTRING(-2 -2,-1 -1,0 0,1 1,2 2)', 4326), 5) = true)
	 */
	var expected = "WHERE (ST_DWithin(the_geom, ST_GeomFromText('LINESTRING(-2 -2,-1 -1,0 0,1 1,2 2)', 4326), 5) = true)";
	var dwithin_filter2 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.DWITHIN,
		//property: "the_geom",
		value: new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(-2,-2),
            new OpenLayers.Geometry.Point(-1,-1),
            new OpenLayers.Geometry.Point(0,0),
            new OpenLayers.Geometry.Point(1,1),
            new OpenLayers.Geometry.Point(2,2)
		]),
		distance: 5
	});	
	var whereClause = format.write(dwithin_filter2);
	t.eq(whereClause, expected, "...where clause for a dwithin filter against a linestring...");
	
	/*
	 * test 2: dwithin with a polygon
	 * 
	 * Sample SQL:
	 * 	
	 *     SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (ST_DWithin(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326), 5) = true)";
	 */
	var expected = "WHERE (ST_DWithin(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326), 5) = true)";
	var dwithin_filter3 = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.DWITHIN,
		//property: "the_geom",
		value: new OpenLayers.Geometry.Polygon([
		    new OpenLayers.Geometry.LinearRing([
		        new OpenLayers.Geometry.Point(-180,-90),
		        new OpenLayers.Geometry.Point(-180,90),
		        new OpenLayers.Geometry.Point(180,90),
		        new OpenLayers.Geometry.Point(180,-90),
		        new OpenLayers.Geometry.Point(-180,-90)                                 
		    ])                                        
		]),
		distance: 5 
	});	
	var whereClause = format.write(dwithin_filter3);
	t.eq(whereClause, expected, "...where clause for a dwithin filter against a polygon...");
};

/**
 * 
 * @param t
 * @return
 */
function test_and_filter(t) {
	//
	t.plan(6);	
	var format = new OpenLayers.Format.SQL.PostGIS_SQL({});
	
	var bbox_filter = new OpenLayers.Filter.Spatial({
		type: "BBOX",
		value: new OpenLayers.Bounds(11.2433, 39.43565, 16.8683 ,42.24815)
	});
	
	var comparison_filter1 = new OpenLayers.Filter.Comparison({
		type: "==",
		property: "name",
		value: "Cumae" 
	});
	
	var comparison_filter2 = new OpenLayers.Filter.Comparison({
		type: "==",
		property: "id",
		value: "1" 
	});	
	
	/*
	 * Test 1: where clause for a 'and' filter with one comparison filter and one bbox filter
	 * 
	 * Sample SQL:
	 * 
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)) 
	 *         AND (name = 'Cumae')
	 * 
	 */    			
	// ==============================================================================================================================================================
	var expected = "WHERE ((the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)) AND (name = 'Cumae'))";
	var and_filter = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [
		    bbox_filter,
		    comparison_filter1
		]
	});	
	var whereClause = format.write(and_filter);	
	t.eq(whereClause, expected, "...where clause for a 'and' filter with one comparison filter and one bbox filter...");
	// ==============================================================================================================================================================
		
	/*
	 * Test 2: where clause for a 'and' filter with two comparison child filters
	 * 
	 * Sample SQL:
	 * 
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (id = '1') AND (name = 'Cumae')
	 * 
	 */			
	var expected = "WHERE ((name = 'Cumae') AND (id = '1'))";		
	var and_filter = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [
		    comparison_filter1,
		    comparison_filter2
		]
	});	
	var whereClause = format.write(and_filter);	
	t.eq(whereClause, expected, "...where clause for a 'and' filter with two comparison child filters...");
	
	/*
	 * Test 3: where clause for a 'and' filter with a child 'and' filter and a spatial child filter
	 * 
	 * Sample SQL:
	 * 	   
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (((name = 'Cumae') AND (id = '1')) AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)))
	 *  
	 */
	// ==============================================================================================================================================================
	var expected = "WHERE (((name = 'Cumae') AND (id = '1')) AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)))";
	var and_filter = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [
		    comparison_filter1,
		    comparison_filter2
		]
	});	
	var compound_and_filter = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [
		    and_filter,
		    bbox_filter
		]
	});	
	var whereClause = format.write(compound_and_filter);	
	t.eq(whereClause, expected, "...where clause for a 'and' filter with a child 'and' filter and a spatial child filter...");
	// ==============================================================================================================================================================
	
	/*
	 * Test 4: where clause for a 'and' filter with a child 'or' filter and a spatial child filter
	 * 
	 * Sample SQL:
	 * 	   
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (((name = 'Cumae') OR (id = '1')) AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)))
	 *  
	 */
	// ==============================================================================================================================================================
	var expected = "WHERE (((name = 'Cumae') OR (id = '1')) AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)))";
	
	var or_filter = new OpenLayers.Filter.Logical({
		type: "||",
		filters: [
		    comparison_filter1,
		    comparison_filter2
		]
	});
	
	var compound_and_filter = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [
		    or_filter,
		    bbox_filter
		]
	});
	whereClause = format.write(compound_and_filter);	
	t.eq(whereClause, expected, "...where clause for a 'and' filter with a child 'or' filter and a spatial child filter...");
	// ==============================================================================================================================================================
	
	/*
	 * Test 5: where clause for a 'and' filter with a child 'or' filter and a child 'and' filter
	 * 
	 * Sample SQL:
	 * 	   
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (((name = 'Cumae') OR (id = '1')) AND (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)))
	 *  
	 */
	// ====================================================================================================
	var expected = "WHERE (((name = 'Cumae') OR (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326))) AND ((name = 'Cumae') AND (id = '1')))";	
	var or_filter = new OpenLayers.Filter.Logical({
		type: "||",
		filters: [
		    comparison_filter1,
		    bbox_filter
		]
	});
	
	var and_filter = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [
		    comparison_filter1,
		    comparison_filter2
		]
	});
	
	var compound_and_filter = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [
		    or_filter,
		    and_filter
		]
	});
	whereClause = format.write(compound_and_filter);	
	t.eq(whereClause, expected, "...where clause for a 'and' filter with a child 'or' filter and a child 'and' filter...");
	// ====================================================================================================
	
	/*
	 * Test 6: 
	 * 
	 * Sample SQL:
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE ((name = 'Cumae') AND (ST_Intersects(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true))	 
	 */
	// ====================================================================================================
	var expected = "WHERE ((name = 'Cumae') AND (ST_Intersects(the_geom, ST_GeomFromText('POLYGON((-180 -90,-180 90,180 90,180 -90,-180 -90))', 4326)) = true))";
	var intersects_filter = new OpenLayers.Filter.Spatial({
		type: OpenLayers.Filter.Spatial.INTERSECTS,
		//property: "the_geom",
		value: new OpenLayers.Geometry.Polygon([
		    new OpenLayers.Geometry.LinearRing([
		        new OpenLayers.Geometry.Point(-180,-90),
		        new OpenLayers.Geometry.Point(-180,90),
		        new OpenLayers.Geometry.Point(180, 90),
		        new OpenLayers.Geometry.Point(180, -90),
		        new OpenLayers.Geometry.Point(-180, -90)                                 
		    ])                                        
		]) 
	});		
	var comparison_filter = new OpenLayers.Filter.Comparison({
		type: "==",
		property: "name",
		value: "Cumae" 
	});	
	var and_filter = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [
		    comparison_filter,
		    intersects_filter
		]
	});		
	whereClause = format.write(and_filter);
	t.eq(whereClause, expected, "...where clause for a 'and' filter with a child comparison filter and a child spatial filter...");
	// ====================================================================================================
};

/**
 * 
 * @param t
 * @return
 */
function test_or_filter(t) {
	
	t.plan(4);
	
	var format = new OpenLayers.Format.SQL.PostGIS_SQL({});			
	
	var bbox_filter = new OpenLayers.Filter.Spatial({
		type: "BBOX",
		value: new OpenLayers.Bounds(11.2433, 39.43565, 16.8683 ,42.24815)
	});
	
	var comparison_filter1 = new OpenLayers.Filter.Comparison({
		type: "==",
		property: "name",
		value: "Cumae" 
	});
	
	var comparison_filter2 = new OpenLayers.Filter.Comparison({
		type: "==",
		property: "id",
		value: "2" 
	});
	
	var and_filter1 = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [		    
		    comparison_filter1,
		    comparison_filter2
		]
	});
	
	var and_filter2 = new OpenLayers.Filter.Logical({
		type: "&&",
		filters: [		    
		    comparison_filter1,
		    bbox_filter
		]
	});
	
	var or_filter1 = new OpenLayers.Filter.Logical({
		type: "||",
		filters: [		    
		    comparison_filter1,
		    comparison_filter2
		]
	});
	
	var or_filter2 = new OpenLayers.Filter.Logical({
		type: "||",
		filters: [		    
		    comparison_filter1,
		    bbox_filter
		]
	});
	
	/*
	 * Test 1: where clause for a 'or' filter with two comparison filters
	 * 
	 * Sample SQL:
	 * 	   
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE ((name = 'Cumae') OR (id = '2'))
	 *  
	 */
	var expected = "WHERE ((name = 'Cumae') OR (id = '2'))";
	whereClause = format.write(or_filter1);
	t.eq(whereClause, expected, "...where clause for a 'or' filter with two comparison filters...");
	
	/*
	 * Test 2: where clause for a 'or' filter with one comparison filter and a bbox filter
	 * 
	 * Sample SQL:
	 * 	   
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE ((name = 'Cumae') OR (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)))
	 *  
	 */
	var expected = "WHERE ((name = 'Cumae') OR (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326)))";
	whereClause = format.write(or_filter2);
	t.eq(whereClause, expected, "...where clause for a 'or' filter with one comparison filter and a bbox filter...");
	
	/*
	 * Test 3: where clause for a 'or' filter with one comparison filter and a child 'or' filter
	 * 
	 * Sample SQL:
	 * 	   
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE ((name = 'Cumae') OR ((name = 'Cumae') OR (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326))))
	 *  
	 */
	var expected = "WHERE ((name = 'Cumae') OR ((name = 'Cumae') OR (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326))))";
	var compound_or_filter1 = new OpenLayers.Filter.Logical({
		type: "||",
		filters: [		
		    comparison_filter1,   
		    or_filter2,		    
		]
	});
	
	whereClause = format.write(compound_or_filter1);
	t.eq(whereClause, expected, "...where clause for a 'or' filter with one comparison filter and a child 'or' filter...");
	
	/*
	 * Test 4: where clause for a 'or' filter with a child 'and' filter and a child 'or' filter
	 * 
	 * Sample SQL:
	 * 	   
	 * 	   SELECT ST_AsGeoJSON(the_geom) AS the_geom 
	 *     FROM historical_sites
	 *     WHERE (((name = 'Cumae') AND (id = '2')) OR ((name = 'Cumae') OR (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326))))
	 *  
	 */
	var expected = "WHERE (((name = 'Cumae') AND (id = '2')) OR ((name = 'Cumae') OR (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(11.2433, 39.43565), ST_Point(16.8683 ,42.24815)),4326))))";
	var compound_or_filter2 = new OpenLayers.Filter.Logical({
		type: "||",
		filters: [		
		    and_filter1,   
		    or_filter2,		    
		]
	});
	
	whereClause = format.write(compound_or_filter2);
	t.eq(whereClause, expected, "...where clause for a 'or' filter with a child 'and' filter and a child 'or' filter...");
	
};


