var area = ee.FeatureCollection("FAO/GAUL/2015/level2").filter(ee.Filter.eq('ADM2_NAME', 'Kachchh'));
Map.centerObject(area, 8);

// Variable setup
var ghi = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR").filterDate('2020-01-01', '2024-01-01').select('surface_solar_radiation_downwards_sum').mean().divide(1e6).rename('GHI').clip(area);
var cloud = ee.ImageCollection("ECMWF/ERA5/HOURLY").filterDate('2020-01-01', '2024-01-01').select('total_cloud_cover').mean().multiply(100).rename('CloudCover').clip(area);
var lst = ee.ImageCollection("MODIS/061/MOD11A2").filterDate('2020-01-01', '2024-01-01').select('LST_Day_1km').mean().multiply(0.02).subtract(273.15).rename('LST').clip(area);
var slope = ee.Terrain.slope(ee.Image("USGS/SRTMGL1_003")).rename('Slope').clip(area);
var lulc = ee.Image("ESA/WorldCover/v100/2020").select('Map').rename('LULC').clip(area);
var dataStack = ghi.addBands(cloud).addBands(lst).addBands(slope).addBands(lulc);

// Training Data: WRI Solar Power Plants
var solar_pts = ee.FeatureCollection("WRI/GPPD/power_plants").filter(ee.Filter.and(ee.Filter.eq('fuel1', 'Solar'), ee.Filter.bounds(area)));
var pos_samples = solar_pts.map(function(f) { return f.set('target', 1); });

// Training Data: Non-suitable zones (Water, Urban, High Slope)
var neg_mask = lulc.eq(80).or(lulc.eq(50)).or(slope.gt(15));
var neg_samples = neg_mask.selfMask().stratifiedSample({numPoints: pos_samples.size(), region: area, scale: 100, geometries: true}).map(function(f) { return f.set('target', 0); });

// Classifier Training
var train_set = dataStack.sampleRegions({collection: pos_samples.merge(neg_samples), properties: ['target'], scale: 100, tileScale: 16});
var cart_model = ee.Classifier.smileCart().train({features: train_set, classProperty: 'target', inputProperties: dataStack.bandNames()});

// Final classification and output
var result = dataStack.classify(cart_model);
Map.addLayer(result, {min: 0, max: 1, palette: ['white', 'darkgreen']}, 'Suitability Map');
Map.addLayer(solar_pts, {color: 'orange'}, 'Reference Solar Farms');