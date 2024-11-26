import React, { useEffect, useRef, useState } from 'react';
import { 
  Ion, 
  Viewer,
  Cartesian3,
  Color,
  Entity,
  CustomDataSource,
  LabelStyle,
  ScreenSpaceEventType,
  ScreenSpaceEventHandler
} from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

interface SpaceObject {
  id: string;
  name: string;
  type: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  metadata?: {
    country: string;
    rcsSize: string;
    launchDate: string;
    decayDate: string | null;
  };
}

const DebrisTrackingModule: React.FC = () => {
  const viewerRef = useRef<Viewer | null>(null);
  const dataSourceRef = useRef<CustomDataSource | null>(null);
  const labelTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const [objectCounts, setObjectCounts] = useState({
    PAYLOAD: 0,
    DEBRIS: 0,
    ROCKET_BODY: 0,
  });

  const createEntity = (spaceObject: SpaceObject): Entity | null => {
    try {
      const { position } = spaceObject;
      const EARTH_RADIUS = 6371000;

      const height = Math.sqrt(
        position.x * position.x +
        position.y * position.y +
        position.z * position.z
      ) * 1000;

      const longitude = Math.atan2(position.y, position.x) * 180 / Math.PI;
      const latitude = Math.asin(position.z / Math.sqrt(
        position.x * position.x +
        position.y * position.y +
        position.z * position.z
      )) * 180 / Math.PI;

      if (!isFinite(longitude) || !isFinite(latitude) || !isFinite(height)) {
        console.warn('Invalid coordinates for object:', spaceObject.id);
        return null;
      }

      return new Entity({
        id: spaceObject.id,
        name: spaceObject.name,
        position: Cartesian3.fromDegrees(longitude, latitude, height),
        point: {
          pixelSize: 4,
          color:
            spaceObject.type === 'PAYLOAD'
              ? Color.fromCssColorString('#64B5F6') // Blue for PAYLOAD
              : spaceObject.type === 'DEBRIS'
              ? Color.fromCssColorString('#FF6B6B') // Red for DEBRIS
              : spaceObject.type === 'ROCKET BODY'
              ? Color.fromCssColorString('#A8E6CF') // Pale Green for ROCKET BODY
              : Color.GRAY, // Default fallback color
        },
        label: {
          text: spaceObject.name,
          font: '10px sans-serif',
          fillColor: Color.WHITE,
          style: LabelStyle.FILL,
          pixelOffset: new Cartesian3(8, -8, 0),
          show: false,
        },
        description: `
        <div style="font-size: 12px; color: #ffffff;">
          <p><strong>Type:</strong> ${spaceObject.type}</p>
          <p><strong>Country:</strong> ${spaceObject.metadata?.country || 'Unknown'}</p>
          <p><strong>RCS Size:</strong> ${spaceObject.metadata?.rcsSize || 'Unknown'}</p>
          <p><strong>Launch Date:</strong> ${spaceObject.metadata?.launchDate || 'Unknown'}</p>
          <p><strong>Decay Date:</strong> ${
            spaceObject.metadata?.decayDate || 'Still in orbit'
          }</p>
        </div>
      `,
      });
    } catch (error) {
      console.error('Error creating entity for object:', spaceObject.id, error);
      return null;
    }
  };

  const fetchAndUpdateObjects = async () => {
    if (hasLoadedRef.current) {
      console.log('Data already loaded');
      return;
    }

    try {
      hasLoadedRef.current = true;
      const response = await fetch('/api/debris?limit=25');
      const data = await response.json();

      if (!data.success || !viewerRef.current) {
        hasLoadedRef.current = false;
        return;
      }

      if (!dataSourceRef.current) {
        dataSourceRef.current = new CustomDataSource('debris');
        viewerRef.current.dataSources.add(dataSourceRef.current);
      }

      const processedIds = new Set<string>();
      const objectCounts = {
        PAYLOAD: 0,
        DEBRIS: 0,
        ROCKET_BODY: 0,
      };

      const validObjects = data.data.filter((obj: SpaceObject) => {
        if (!obj?.id) return false;
      
        if (obj.type === 'PAYLOAD') {
          objectCounts.PAYLOAD++;
        } else if (obj.type === 'DEBRIS') {
          objectCounts.DEBRIS++;
        } else if (obj.type === 'ROCKET BODY') {
          objectCounts.ROCKET_BODY++;
        }
      
        return true;
      });
      
      setObjectCounts(objectCounts);

      for (const obj of validObjects) {
        const entity = createEntity(obj);
        if (entity && !dataSourceRef.current.entities.getById(entity.id)) {
          dataSourceRef.current.entities.add(entity);
        }
      }

      if (viewerRef.current) {
        // Update camera to show all entities
        viewerRef.current.camera.flyTo({
          destination: Cartesian3.fromDegrees(0, 0, 20000000),
          orientation: {
            heading: 0.0,
            pitch: -Math.PI / 2,
            roll: 0.0,
          },
          duration: 2,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      hasLoadedRef.current = false;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).CESIUM_BASE_URL = '/cesium';
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNDNkYmE3My02NWQzLTRhMTMtODdkNC05ZmYzODllN2MyYjMiLCJpZCI6MjU0MTQ2LCJpYXQiOjE3MzEyMzc4OTN9.6ZDi-GclM4crJ8UguoUCo3YhTO4Wf_ZSzCMM3kFRKGw';

    const viewer = new Viewer('cesiumContainer', {
      shouldAnimate: false,
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      requestRenderMode: true,
      maximumRenderTimeChange: 1000,
    });

    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.debugShowFramesPerSecond = true;

    // Wait for globe to be ready
    viewer.scene.globe.tileLoadProgressEvent.addEventListener(() => {
      if (viewer.scene.globe.tilesLoaded) {
        fetchAndUpdateObjects();
      }
    });

    viewerRef.current = viewer;

    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <div 
      id="cesiumContainer" 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Tracker Key */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000,
        }}
      >
        <h4 style={{ margin: 0, marginBottom: '5px', fontSize: '14px' }}>
          Tracker Key
        </h4>
        <div>
          <span style={{ color: '#64B5F6', marginRight: '10px' }}>● PAYLOAD</span>
          {objectCounts.PAYLOAD}
        </div>
        <div>
          <span style={{ color: '#FF6B6B', marginRight: '10px' }}>● DEBRIS</span>
          {objectCounts.DEBRIS}
        </div>
        <div>
          <span style={{ color: '#A8E6CF', marginRight: '10px' }}>● ROCKET BODY</span>
          {objectCounts.ROCKET_BODY}
        </div>
      </div>
      <style>
      {`
        #cesiumContainer .cesium-performanceDisplay {
          position: absolute !important;
          bottom: auto;
          right: 10px;
          top: 1080px !important;
          left: auto !important;
          width: auto;
          height: auto;
          z-index: 100;
          flex-direction: column; /* Stack items vertically */
          justify-content: center; /* Center the items vertically */
          align-items: center; /* Center the items horizontally */
          display: flex;
          padding: 5px;
          background-color: rgba(0, 0, 0, 0.7);
          border-radius: 4px;
          box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
        }
      `}
    </style>

      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '1rem',
          borderRadius: '4px',
          zIndex: 1000,
        }}>
          Loading space objects...
        </div>
      )}
    </div>
  );
};

export default DebrisTrackingModule;
