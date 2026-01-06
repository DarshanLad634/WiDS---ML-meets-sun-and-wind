# WiDS---ML-meets-sun-and-wind

This repository contains the source code for a midterm project identifying solar energy potential using Google Earth Engine.

## Repository Files

### 1) data_prep.js
**Purpose:** Data preparation and preprocessing.
**Function:** Script to import, clean, and stack environmental layers including Solar Radiation (GHI), Cloud Cover, Surface Temperature (LST), Terrain Slope, and Land Use (LULC).

### 2) model_training.js
**Purpose:** Machine Learning implementation.
**Function:** Integrates actual solar farm locations from the WRI Database as training data. It uses a Random Forest classifier to analyze the feature stack and generate a final suitability map for the district.



## Methodology Overview
The project follows a standard remote sensing workflow. First, multi-source satellite data (MODIS, ERA5, SRTM) is ingested and clipped to the study area. Next, automated labeling is performed using existing solar parks as "Good" examples and restricted areas like water or urban zones as "Bad" examples. Finally, a Random Forest classification is trained using 50 decision trees to identify land pixels that match the profile of existing solar infrastructure, resulting in a suitability map where green indicates high-potential zones.
