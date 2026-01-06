var kutch = ee.FeatureCollection("FAO/GAUL/2015/level2").filter(ee.Filter.eq('ADM2_NAME', 'Kachchh'));
Map.centerObject(kutch, 8);

// Data preprocessing for environmental variables
var solar = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR").filterDate('2020-01-01', '2024-01-01').select('surface_solar_radiation_downwards_sum').mean().divide(1e6).rename('GHI').clip(kutch);
var clouds = ee.ImageCollection("ECMWF/ERA5/HOURLY").filterDate('2020-01-01', '2024-01-01').select('total_cloud_cover').mean().multiply(100).rename('CloudCover').clip(kutch);
var temp = ee.ImageCollection("MODIS/061/MOD11A2").filterDate('2020-01-01', '2024-01-01').select('LST_Day_1km').mean().multiply(0.02).subtract(273.15).rename('LST').clip(kutch);
var terrain = ee.Terrain.slope(ee.Image("USGS/SRTMGL1_003")).rename('Slope').clip(kutch);
var landcover = ee.Image("ESA/WorldCover/v100/2020").select('Map').rename('LULC').clip(kutch);

// Stack bands for analysis
var stack = solar.addBands(clouds).addBands(temp).addBands(terrain).addBands(landcover);
print('Stack info:', stack);
Map.addLayer(stack.select('GHI'), {min: 15, max: 25, palette: ['blue', 'yellow', 'red']}, 'Solar Potential');