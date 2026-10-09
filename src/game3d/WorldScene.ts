import * as THREE from 'three';
import { Marketplace, VehicleId, WildlifeEntity, TrafficBottleneck, WeatherCondition, WeatherType } from '../types/game';
import { WEATHER_PRESETS, WEATHER_CYCLE_ORDER } from '../data/weather';
import { soundManager } from '../audio/soundManager';

export interface WorldSceneCallbacks {
  onMarketProximity: (market: Marketplace | null) => void;
  onAnimalInView: (animal: WildlifeEntity | null, distance: number) => void;
  onSpeedUpdate: (speedKmH: number) => void;
  onTimeUpdate: (gameHour: number, timeString: string, progress: number) => void;
  onPositionUpdate: (pos: { x: number; z: number; heading: number }) => void;
  onNpcProximity: (npc: { name: string; role: string; dialogue: string } | null) => void;
  onBottlenecksUpdate?: (bottlenecks: TrafficBottleneck[]) => void;
  onPlayerInJam?: (inJam: boolean, bottleneck: TrafficBottleneck | null) => void;
  onWeatherChange?: (weather: WeatherCondition) => void;
}

export class WorldScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private callbacks: WorldSceneCallbacks;

  // Dynamic Weather System State
  private currentWeather: WeatherCondition = WEATHER_PRESETS.clear;
  private weatherTimerSec: number = 0;
  private weatherCycleIndex: number = 0;
  private thunderTimerSec: number = 0;
  private rainParticles: THREE.Points | null = null;
  private rainPositions: Float32Array | null = null;

  // Day / Night cycle (15 minutes total = 900 seconds)
  private readonly CYCLE_DURATION_SEC = 900;
  private cycleTimeSec: number = 260; // start around 08:30 AM (morning)
  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;
  private moonLight!: THREE.DirectionalLight;
  private skyDome!: THREE.Mesh;
  private starsParticles!: THREE.Points;
  private cityNightLights: THREE.Light[] = [];

  // Player & Vehicle State
  private currentVehicleType: VehicleId = 'matatu';
  private playerGroup: THREE.Group = new THREE.Group();
  private vehicleMeshGroup: THREE.Group = new THREE.Group();
  private playerVelocity: THREE.Vector3 = new THREE.Vector3();
  private playerSpeed: number = 0;
  private playerHeading: number = 0; // radians
  private targetHeading: number = 0;
  private vehicleHeadlights: THREE.SpotLight[] = [];

  // Vehicle Parameters
  private vehicleSpecs = {
    matatu: { maxSpeed: 1.15, accel: 0.022, brake: 0.045, turnSpeed: 0.038, friction: 0.985, isAerial: false },
    cruiser: { maxSpeed: 0.95, accel: 0.018, brake: 0.05, turnSpeed: 0.032, friction: 0.982, isAerial: false },
    bodaboda: { maxSpeed: 1.25, accel: 0.03, brake: 0.06, turnSpeed: 0.052, friction: 0.98, isAerial: false },
    foot: { maxSpeed: 0.38, accel: 0.04, brake: 0.1, turnSpeed: 0.065, friction: 0.9, isAerial: false },
    rangerover: { maxSpeed: 1.45, accel: 0.032, brake: 0.06, turnSpeed: 0.042, friction: 0.988, isAerial: false },
    helicopter: { maxSpeed: 1.55, accel: 0.025, brake: 0.04, turnSpeed: 0.045, friction: 0.985, isAerial: true },
    privatejet: { maxSpeed: 2.6, accel: 0.045, brake: 0.03, turnSpeed: 0.028, friction: 0.992, isAerial: true },
  };
  private helicopterRotorMesh: THREE.Group | null = null;
  private currentAltitude: number = 0;

  // Input states
  private inputKeys: Record<string, boolean> = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    horn: false,
  };

  // Camera tracking
  private cameraOffset = new THREE.Vector3(0, 5.5, 12.0);
  private cameraLookTarget = new THREE.Vector3();
  private isPhotoCameraMode: boolean = false;
  private photoFov: number = 55;

  // World entities
  private markets: Marketplace[];
  private marketMarkers: { market: Marketplace; mesh: THREE.Group }[] = [];
  private wildlifeList: WildlifeEntity[];
  private wildlifeMeshes: { entity: WildlifeEntity; group: THREE.Group }[] = [];
  private streetNpcs: { group: THREE.Group; name: string; role: string; dialogue: string; basePos: THREE.Vector3 }[] = [];

  // Dynamic Traffic Network & Localized Bottlenecks
  private trafficCorridors: THREE.CatmullRomCurve3[] = [];
  private networkVehicles: {
    group: THREE.Group;
    type: 'matatu' | 'sedan' | 'boda' | 'lorry';
    corridorId: number;
    progress: number;
    speed: number;
    baseSpeed: number;
    brakeLights: THREE.Mesh[];
    isBraking: boolean;
  }[] = [];
  private bottlenecks: TrafficBottleneck[] = [];
  private bottleneckMeshGroups: Map<string, THREE.Group> = new Map();
  private bottleneckCycleTimer: number = 0;
  private currentActiveJam: TrafficBottleneck | null = null;
  private playerInJam: boolean = false;
  private policeBeaconLight: THREE.PointLight | null = null;
  private hazardBeaconLight: THREE.PointLight | null = null;

  constructor(
    container: HTMLElement,
    markets: Marketplace[],
    wildlife: WildlifeEntity[],
    callbacks: WorldSceneCallbacks
  ) {
    this.container = container;
    this.markets = markets;
    this.wildlifeList = wildlife;
    this.callbacks = callbacks;

    // Scene & Camera setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0xc8d8e8, 0.0028);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.5, 1400);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.initSkyAndLighting();
    this.buildTerrain();
    this.buildNairobiMetropolis();
    this.buildSavannahLandscape();
    this.buildMarketStalls();
    this.buildWildlife();
    this.initRoadCorridors();
    this.initBottlenecks();
    this.buildTrafficAndPedestrians();
    this.buildPlayerVehicle();
    this.buildRainParticles();

    this.setupListeners();
    this.callbacks.onWeatherChange?.(this.currentWeather);
    this.animate(0);
  }

  /* -------------------------------------------------------------
     SKY, LIGHTING & 15-MINUTE DAY/NIGHT CYCLE
  ------------------------------------------------------------- */
  private initSkyAndLighting() {
    // Ambient and Hemisphere
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffeedd, 0x556644, 0.4);
    this.scene.add(this.hemiLight);

    // Directional Sun Light
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    this.sunLight.position.set(100, 150, 100);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;
    const d = 120;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Moonlight for night
    this.moonLight = new THREE.DirectionalLight(0x6688cc, 0.0);
    this.moonLight.position.set(-100, 120, -100);
    this.scene.add(this.moonLight);

    // Sky Dome
    const skyGeo = new THREE.SphereGeometry(750, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);

    // Stars particle field
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 700;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 50; // upper hemisphere
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.2,
      transparent: true,
      opacity: 0,
    });
    this.starsParticles = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starsParticles);
  }

  private updateDayNightCycle(deltaSec: number) {
    this.cycleTimeSec = (this.cycleTimeSec + deltaSec) % this.CYCLE_DURATION_SEC;
    const cycleProgress = this.cycleTimeSec / this.CYCLE_DURATION_SEC; // 0 to 1

    // Map 0 -> 1 to 24 game hours:
    // 0 = 06:00 (dawn), 0.25 = 12:00 (noon), 0.5 = 18:00 (sunset), 0.75 = 24:00 (night)
    const inGameHour = (cycleProgress * 24 + 6) % 24;
    const hoursInt = Math.floor(inGameHour);
    const minsInt = Math.floor((inGameHour - hoursInt) * 60);
    const timeString = `${hoursInt.toString().padStart(2, '0')}:${minsInt.toString().padStart(2, '0')} EAT`;

    // Sun angle calculation (revolving around Y & Z axes)
    const sunAngle = cycleProgress * Math.PI * 2;
    const sunY = Math.sin(sunAngle);
    const sunX = Math.cos(sunAngle);

    this.sunLight.position.set(sunX * 220, Math.max(sunY * 200, -20), 120);
    this.sunLight.target.position.set(this.playerGroup.position.x, 0, this.playerGroup.position.z);
    this.sunLight.target.updateMatrixWorld();

    // Night detection
    const isDay = sunY > 0;
    const isTwilight = Math.abs(sunY) < 0.25;

    let skyColor: THREE.Color;
    let fogColor: THREE.Color;
    let ambientIntensity: number;
    let sunIntensity: number;
    let starOpacity: number;

    if (sunY > 0.3) {
      // Full Day / African Noon
      skyColor = new THREE.Color(0x60a5fa); // vivid Nairobi blue
      fogColor = new THREE.Color(0xbfe0f7);
      ambientIntensity = 0.6;
      sunIntensity = 1.35;
      starOpacity = 0.0;
    } else if (sunY > -0.05) {
      // Golden Hour / Sunset over Great Rift
      const t = (sunY + 0.05) / 0.35;
      skyColor = new THREE.Color().lerpColors(new THREE.Color(0xd97706), new THREE.Color(0x60a5fa), t); // golden amber to blue
      fogColor = new THREE.Color().lerpColors(new THREE.Color(0xf59e0b), new THREE.Color(0xbfe0f7), t);
      ambientIntensity = 0.45;
      sunIntensity = 0.95;
      starOpacity = 0.05 * (1 - t);
    } else if (sunY > -0.25) {
      // African Twilight / Dusk
      const t = (sunY + 0.25) / 0.2;
      skyColor = new THREE.Color().lerpColors(new THREE.Color(0x1e1b4b), new THREE.Color(0xd97706), t); // deep indigo to amber
      fogColor = new THREE.Color().lerpColors(new THREE.Color(0x0f172a), new THREE.Color(0xf59e0b), t);
      ambientIntensity = 0.25;
      sunIntensity = 0.2;
      starOpacity = 0.5 * (1 - t);
    } else {
      // Nairobi Midnight & Starry Savannah
      skyColor = new THREE.Color(0x030712); // midnight
      fogColor = new THREE.Color(0x090d16);
      ambientIntensity = 0.18;
      sunIntensity = 0.0;
      starOpacity = 0.95;
    }

    (this.skyDome.material as THREE.MeshBasicMaterial).color.copy(skyColor);
    if (this.scene.fog) {
      if (this.currentWeather.id === 'foggy_morning') {
        this.scene.fog.color.setHex(0x94a3b8);
        (this.scene.fog as THREE.FogExp2).density = 0.0125;
      } else if (this.currentWeather.id === 'heavy_rain') {
        this.scene.fog.color.setHex(0x475569);
        (this.scene.fog as THREE.FogExp2).density = 0.0075;
      } else if (this.currentWeather.id === 'golden_heatwave') {
        this.scene.fog.color.setHex(0xfef08a);
        (this.scene.fog as THREE.FogExp2).density = 0.0032;
      } else {
        this.scene.fog.color.copy(fogColor);
        (this.scene.fog as THREE.FogExp2).density = this.currentWeather.fogDensity;
      }
    }
    const weatherAmbientFactor = this.currentWeather.id === 'heavy_rain' ? 0.65 : this.currentWeather.id === 'golden_heatwave' ? 1.25 : 1.0;
    this.ambientLight.intensity = ambientIntensity * weatherAmbientFactor;
    this.sunLight.intensity = sunIntensity * this.currentWeather.sunIntensity;
    (this.starsParticles.material as THREE.PointsMaterial).opacity = starOpacity;

    // Toggle headlights & street lamps at dusk/night
    const shouldLightsBeOn = sunY < 0.15;
    this.vehicleHeadlights.forEach(light => {
      light.intensity = shouldLightsBeOn ? 2.8 : 0.0;
    });
    this.cityNightLights.forEach(light => {
      light.intensity = shouldLightsBeOn ? 1.5 : 0.0;
    });

    this.callbacks.onTimeUpdate(inGameHour, timeString, cycleProgress);
  }

  /* -------------------------------------------------------------
     DYNAMIC WEATHER SYSTEM & RAIN PARTICLES
  ------------------------------------------------------------- */
  private buildRainParticles() {
    const count = 1800;
    const geo = new THREE.BufferGeometry();
    this.rainPositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 140;
      this.rainPositions[i * 3 + 1] = Math.random() * 65;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 1.6,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    this.rainParticles = new THREE.Points(geo, mat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  public setWeather(weatherId: WeatherType) {
    const next = WEATHER_PRESETS[weatherId];
    if (!next) return;
    this.currentWeather = next;
    this.weatherTimerSec = 0;

    // Audio triggers
    if (next.id === 'heavy_rain') {
      soundManager.startRain();
    } else {
      soundManager.stopRain();
    }

    this.callbacks.onWeatherChange?.(next);
  }

  public getWeather(): WeatherCondition {
    return this.currentWeather;
  }

  private updateWeather(dt: number) {
    // Natural cyclical weather changes every 180 seconds (3 minutes)
    this.weatherTimerSec += dt;
    if (this.weatherTimerSec > 180) {
      this.weatherTimerSec = 0;
      this.weatherCycleIndex = (this.weatherCycleIndex + 1) % WEATHER_CYCLE_ORDER.length;
      const nextWeatherId = WEATHER_CYCLE_ORDER[this.weatherCycleIndex];
      this.setWeather(nextWeatherId);
    }

    // Rain particle animation during heavy rain
    if (this.currentWeather.id === 'heavy_rain' && this.rainParticles && this.rainPositions) {
      this.rainParticles.visible = true;
      const pPos = this.playerGroup.position;
      this.rainParticles.position.x = pPos.x;
      this.rainParticles.position.z = pPos.z;

      const posAttr = this.rainParticles.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i) - 95 * dt;
        if (y < 0) {
          y = 55 + Math.random() * 12;
        }
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Thunder rumble intervals during torrential rain
      this.thunderTimerSec += dt;
      if (this.thunderTimerSec > 18) {
        this.thunderTimerSec = 0;
        soundManager.playThunder();
      }
    } else if (this.rainParticles) {
      this.rainParticles.visible = false;
    }
  }

  /* -------------------------------------------------------------
     TERRAIN & BIOMES
  ------------------------------------------------------------- */
  private buildTerrain() {
    // Vast ground terrain: East is Nairobi asphalt/urban pavers, West is golden Savannah!
    const groundGeo = new THREE.PlaneGeometry(800, 800, 64, 64);
    groundGeo.rotateX(-Math.PI / 2);

    // Apply gentle rolling hills on the savannah side (x < -20)
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      if (vx < -20) {
        // Savannah rolling terrain
        const hill = Math.sin(vx * 0.02) * Math.cos(vz * 0.02) * 4.5 +
                     Math.sin(vx * 0.05 + 1.2) * 2.2;
        pos.setY(i, Math.max(-0.5, hill));
      } else {
        // Flat city concrete plateau
        pos.setY(i, 0);
      }
    }
    groundGeo.computeVertexNormals();

    // Procedural canvas texture blending asphalt roads in city and golden red loam savannah
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Left half: Savannah golden grass & red clay dirt roads
    ctx.fillStyle = '#b5833e';
    ctx.fillRect(0, 0, 512, 1024);
    // Savannah red clay trails
    ctx.strokeStyle = '#8f4b26';
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.moveTo(0, 512);
    ctx.bezierCurveTo(200, 480, 350, 560, 512, 512);
    ctx.stroke();

    // Right half: Nairobi urban asphalt & pavement
    ctx.fillStyle = '#33373d';
    ctx.fillRect(512, 0, 512, 1024);
    // Nairobi Uhuru Highway & Ring Road (dark asphalt with white lines)
    ctx.strokeStyle = '#1e2124';
    ctx.lineWidth = 42;
    ctx.beginPath();
    ctx.moveTo(512, 512);
    ctx.lineTo(1024, 512);
    ctx.moveTo(768, 0);
    ctx.lineTo(768, 1024);
    ctx.stroke();

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = THREE.ClampToEdgeWrapping;
    groundTex.wrapT = THREE.ClampToEdgeWrapping;

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.88,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Waterhole basin in savannah (x: -120, z: -160)
    const waterGeo = new THREE.CircleGeometry(32, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1d6978,
      roughness: 0.15,
      metalness: 0.8,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(-130, 0.2, -160);
    this.scene.add(waterMesh);

    // Distant Mt. Kenya Silhouette Cone in Savannah Horizon
    const mtGeo = new THREE.ConeGeometry(90, 70, 16);
    const mtMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
    });
    const mtMesh = new THREE.Mesh(mtGeo, mtMat);
    mtMesh.position.set(-360, 32, -320);
    this.scene.add(mtMesh);

    // Snow cap on Mt. Kenya
    const snowGeo = new THREE.ConeGeometry(28, 22, 16);
    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
    });
    const snowMesh = new THREE.Mesh(snowGeo, snowMat);
    snowMesh.position.set(-360, 58, -320);
    this.scene.add(snowMesh);
  }

  /* -------------------------------------------------------------
     NAIROBI METROPOLIS ARCHITECTURE
  ------------------------------------------------------------- */
  private buildNairobiMetropolis() {
    const cityGroup = new THREE.Group();

    // 1. KICC (Kenyatta International Convention Centre) Landmark
    const kiccGroup = new THREE.Group();
    kiccGroup.position.set(40, 0, 0);

    // Conical plenary amphitheater base
    const coneBaseGeo = new THREE.ConeGeometry(18, 12, 24, 1, true);
    const coneBaseMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const coneBase = new THREE.Mesh(coneBaseGeo, coneBaseMat);
    coneBase.position.y = 6;
    coneBase.castShadow = true;
    kiccGroup.add(coneBase);

    // Main 28-story cylinder tower with ribbed terracotta columns
    const towerGeo = new THREE.CylinderGeometry(8.5, 9.5, 58, 28);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xc27838, roughness: 0.65 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 35;
    tower.castShadow = true;
    kiccGroup.add(tower);

    // Revolving restaurant tier
    const restGeo = new THREE.CylinderGeometry(11, 10.5, 5, 28);
    const restMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.2 });
    const restaurant = new THREE.Mesh(restGeo, restMat);
    restaurant.position.y = 60;
    kiccGroup.add(restaurant);

    // Helipad saucer & spire
    const helipadGeo = new THREE.CylinderGeometry(9, 9, 1.2, 24);
    const helipadMat = new THREE.MeshStandardMaterial({ color: 0x374151 });
    const helipad = new THREE.Mesh(helipadGeo, helipadMat);
    helipad.position.y = 63.5;
    kiccGroup.add(helipad);

    // Communication antenna spire
    const spireGeo = new THREE.CylinderGeometry(0.4, 0.8, 18, 8);
    const spireMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = 73;
    kiccGroup.add(spire);

    // KICC Beacon light
    const kiccLight = new THREE.PointLight(0xef4444, 2, 40);
    kiccLight.position.set(0, 82, 0);
    kiccGroup.add(kiccLight);

    cityGroup.add(kiccGroup);

    // 2. Nairobi CBD Skyscrapers & Commercial High-Rises
    const buildingColors = [0x334155, 0x1e293b, 0x475569, 0x64748b, 0x0f172a, 0x2563eb];
    const bldgPositions = [
      { x: 80, z: -40, w: 18, d: 18, h: 48 }, // Times Tower style
      { x: 100, z: 20, w: 22, d: 16, h: 42 },
      { x: 60, z: 60, w: 20, d: 20, h: 36 },
      { x: 110, z: -80, w: 16, d: 22, h: 52 },
      { x: 130, z: 45, w: 24, d: 24, h: 32 },
      { x: 75, z: -110, w: 18, d: 16, h: 40 },
      { x: 25, z: 85, w: 20, d: 18, h: 30 },
      { x: 95, z: 95, w: 16, d: 16, h: 34 },
    ];

    bldgPositions.forEach((b, idx) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mat = new THREE.MeshStandardMaterial({
        color: buildingColors[idx % buildingColors.length],
        roughness: 0.35,
        metalness: 0.65,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      cityGroup.add(mesh);

      // Rooftop water tank or telecom mast
      const tankGeo = new THREE.CylinderGeometry(2, 2, 3, 12);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(b.x + 3, b.h + 1.5, b.z - 2);
      cityGroup.add(tank);
    });

    // 3. Elevated Nairobi Expressway
    const expressPillarsGeo = new THREE.CylinderGeometry(1.5, 1.8, 10, 12);
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const deckGeo = new THREE.BoxGeometry(14, 1.5, 260);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    const expresswayDeck = new THREE.Mesh(deckGeo, deckMat);
    expresswayDeck.position.set(15, 10, 0);
    cityGroup.add(expresswayDeck);

    // Support pillars along Expressway
    for (let pz = -120; pz <= 120; pz += 30) {
      const pillar = new THREE.Mesh(expressPillarsGeo, concreteMat);
      pillar.position.set(15, 5, pz);
      pillar.castShadow = true;
      cityGroup.add(pillar);

      // Highway streetlamp
      const lampGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
      const lampPole = new THREE.Mesh(lampGeo, concreteMat);
      lampPole.position.set(21, 13, pz);
      cityGroup.add(lampPole);

      const nightLight = new THREE.PointLight(0xffedd5, 0, 25);
      nightLight.position.set(21, 15, pz);
      cityGroup.add(nightLight);
      this.cityNightLights.push(nightLight);
    }

    this.scene.add(cityGroup);
  }

  /* -------------------------------------------------------------
     SAVANNAH & WILDLIFE LANDSCAPE
  ------------------------------------------------------------- */
  private buildSavannahLandscape() {
    const savannahGroup = new THREE.Group();

    // Acacia umbrella trees (Acacia tortilis)
    const treePositions = [
      { x: -50, z: -40, scale: 1.1 },
      { x: -80, z: -90, scale: 1.4 },
      { x: -110, z: -30, scale: 1.0 },
      { x: -140, z: -80, scale: 1.3 },
      { x: -170, z: -120, scale: 1.5 },
      { x: -90, z: -150, scale: 1.2 },
      { x: -160, z: -40, scale: 1.4 },
      { x: -210, z: -90, scale: 1.6 },
      { x: -190, z: -180, scale: 1.3 },
      { x: -70, z: -210, scale: 1.2 },
      { x: -130, z: -230, scale: 1.5 },
    ];

    treePositions.forEach(t => {
      const tree = this.createAcaciaTree(t.scale);
      tree.position.set(t.x, 0, t.z);
      savannahGroup.add(tree);
    });

    // Rock Kopjes (granite boulder formations where lions bask)
    const kopjePositions = [
      { x: -135, z: -110 },
      { x: -190, z: -140 },
      { x: -75, z: -180 },
    ];

    kopjePositions.forEach(k => {
      const kopje = this.createRockKopje();
      kopje.position.set(k.x, 0, k.z);
      savannahGroup.add(kopje);
    });

    // Ranger Watchtower at Mara Outpost
    const towerGroup = this.createRangerWatchtower();
    towerGroup.position.set(-155, 0, -165);
    savannahGroup.add(towerGroup);

    this.scene.add(savannahGroup);
  }

  private createAcaciaTree(scale: number): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4d6b38, roughness: 0.8 });

    // Curved trunk
    const trunkGeo = new THREE.CylinderGeometry(0.4 * scale, 0.7 * scale, 9 * scale, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 4.5 * scale;
    trunk.rotation.z = (Math.random() - 0.5) * 0.2;
    trunk.castShadow = true;
    group.add(trunk);

    // Iconic flat-topped umbrella canopies
    const canopy1Geo = new THREE.CylinderGeometry(6 * scale, 4.5 * scale, 1.2 * scale, 12);
    const canopy1 = new THREE.Mesh(canopy1Geo, leafMat);
    canopy1.position.y = 9 * scale;
    canopy1.castShadow = true;
    group.add(canopy1);

    const canopy2Geo = new THREE.CylinderGeometry(4.2 * scale, 3 * scale, 0.9 * scale, 10);
    const canopy2 = new THREE.Mesh(canopy2Geo, leafMat);
    canopy2.position.set(1.5 * scale, 10 * scale, 0.8 * scale);
    canopy2.castShadow = true;
    group.add(canopy2);

    return group;
  }

  private createRockKopje(): THREE.Group {
    const group = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.95 });
    for (let i = 0; i < 5; i++) {
      const size = 3 + Math.random() * 4;
      const rockGeo = new THREE.DodecahedronGeometry(size, 0);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set((Math.random() - 0.5) * 8, size * 0.7, (Math.random() - 0.5) * 8);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      group.add(rock);
    }
    return group;
  }

  private createRangerWatchtower(): THREE.Group {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.85 });

    // 4 legs
    const legGeo = new THREE.CylinderGeometry(0.3, 0.4, 16, 6);
    const offsets = [
      [-3, -3],
      [3, -3],
      [-3, 3],
      [3, 3],
    ];
    offsets.forEach(([ox, oz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(ox, 8, oz);
      group.add(leg);
    });

    // Platform & hut
    const platGeo = new THREE.BoxGeometry(8, 0.6, 8);
    const plat = new THREE.Mesh(platGeo, woodMat);
    plat.position.y = 16;
    group.add(plat);

    // Thatched roof
    const roofGeo = new THREE.ConeGeometry(6, 4, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 20;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    return group;
  }

  /* -------------------------------------------------------------
     MARKETPLACES IN 3D WORLD
  ------------------------------------------------------------- */
  private buildMarketStalls() {
    this.markets.forEach(m => {
      const group = new THREE.Group();
      group.position.set(m.worldPos.x, 0, m.worldPos.z);

      // Colorful striped market awning
      const awningGeo = new THREE.ConeGeometry(5.5, 2.5, 4);
      const awningMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(m.color),
        roughness: 0.6,
      });
      const awning = new THREE.Mesh(awningGeo, awningMat);
      awning.position.y = 4.2;
      awning.rotation.y = Math.PI / 4;
      awning.castShadow = true;
      group.add(awning);

      // Wooden display tables and crates
      const tableGeo = new THREE.BoxGeometry(4.5, 1.2, 3);
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.y = 0.6;
      group.add(table);

      // Glowing Beacon Cylinder
      const beaconGeo = new THREE.CylinderGeometry(0.15, 0.15, 25, 8);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(m.color),
        transparent: true,
        opacity: 0.65,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 12.5;
      group.add(beacon);

      // NPC Merchant representation (animated torso & head)
      const npcGeo = new THREE.CylinderGeometry(0.6, 0.6, 2, 8);
      const npcMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const npc = new THREE.Mesh(npcGeo, npcMat);
      npc.position.set(0, 1.8, 0.5);
      group.add(npc);

      const headGeo = new THREE.SphereGeometry(0.5, 8, 8);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 3.1, 0.5);
      group.add(head);

      this.scene.add(group);
      this.marketMarkers.push({ market: m, mesh: group });
    });
  }

  /* -------------------------------------------------------------
     3D WILDLIFE ANIMALS
  ------------------------------------------------------------- */
  private buildWildlife() {
    this.wildlifeList.forEach(w => {
      const group = new THREE.Group();
      group.position.set(w.position.x, 0, w.position.z);
      group.rotation.y = w.heading;

      let animalMesh: THREE.Group;
      switch (w.species) {
        case 'lion':
          animalMesh = this.createLionModel(w.scale);
          break;
        case 'giraffe':
          animalMesh = this.createGiraffeModel(w.scale);
          break;
        case 'elephant':
          animalMesh = this.createElephantModel(w.scale);
          break;
        case 'zebra':
          animalMesh = this.createZebraModel(w.scale);
          break;
        case 'rhino':
        default:
          animalMesh = this.createRhinoModel(w.scale);
          break;
      }

      group.add(animalMesh);
      this.scene.add(group);
      this.wildlifeMeshes.push({ entity: w, group });
    });
  }

  private createLionModel(scale: number): THREE.Group {
    const group = new THREE.Group();
    const tawnyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }); // golden tawny
    const maneMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }); // dark mane

    // Body
    const bodyGeo = new THREE.BoxGeometry(1.6 * scale, 1.1 * scale, 3.2 * scale);
    const body = new THREE.Mesh(bodyGeo, tawnyMat);
    body.position.y = 1.3 * scale;
    body.castShadow = true;
    group.add(body);

    // Mane & Head
    const maneGeo = new THREE.SphereGeometry(1.0 * scale, 8, 8);
    const mane = new THREE.Mesh(maneGeo, maneMat);
    mane.position.set(0, 1.8 * scale, 1.6 * scale);
    group.add(mane);

    // Muzzle
    const muzzleGeo = new THREE.BoxGeometry(0.7 * scale, 0.6 * scale, 0.8 * scale);
    const muzzle = new THREE.Mesh(muzzleGeo, tawnyMat);
    muzzle.position.set(0, 1.6 * scale, 2.2 * scale);
    group.add(muzzle);

    // 4 legs
    const legGeo = new THREE.CylinderGeometry(0.25 * scale, 0.25 * scale, 1.2 * scale, 6);
    const legPositions = [
      [-0.6, 0.6, 1.2],
      [0.6, 0.6, 1.2],
      [-0.6, 0.6, -1.2],
      [0.6, 0.6, -1.2],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, tawnyMat);
      leg.position.set(lx * scale, ly * scale, lz * scale);
      leg.castShadow = true;
      group.add(leg);
    });

    return group;
  }

  private createGiraffeModel(scale: number): THREE.Group {
    const group = new THREE.Group();
    const coatMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.75 }); // giraffe ochre

    // High body
    const bodyGeo = new THREE.BoxGeometry(1.8 * scale, 1.8 * scale, 3.0 * scale);
    const body = new THREE.Mesh(bodyGeo, coatMat);
    body.position.y = 5.2 * scale;
    body.castShadow = true;
    group.add(body);

    // Very long legs
    const legGeo = new THREE.CylinderGeometry(0.28 * scale, 0.28 * scale, 4.8 * scale, 6);
    const legPositions = [
      [-0.7, 2.4, 1.1],
      [0.7, 2.4, 1.1],
      [-0.7, 2.4, -1.1],
      [0.7, 2.4, -1.1],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, coatMat);
      leg.position.set(lx * scale, ly * scale, lz * scale);
      leg.castShadow = true;
      group.add(leg);
    });

    // Towering long neck
    const neckGeo = new THREE.CylinderGeometry(0.4 * scale, 0.7 * scale, 5.5 * scale, 8);
    const neck = new THREE.Mesh(neckGeo, coatMat);
    neck.position.set(0, 8.2 * scale, 1.6 * scale);
    neck.rotation.x = 0.2;
    neck.castShadow = true;
    group.add(neck);

    // Head
    const headGeo = new THREE.BoxGeometry(0.8 * scale, 0.8 * scale, 1.4 * scale);
    const head = new THREE.Mesh(headGeo, coatMat);
    head.position.set(0, 10.8 * scale, 2.4 * scale);
    group.add(head);

    return group;
  }

  private createElephantModel(scale: number): THREE.Group {
    const group = new THREE.Group();
    const greyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const tuskMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });

    // Massive Body
    const bodyGeo = new THREE.BoxGeometry(3.2 * scale, 2.8 * scale, 4.8 * scale);
    const body = new THREE.Mesh(bodyGeo, greyMat);
    body.position.y = 3.2 * scale;
    body.castShadow = true;
    group.add(body);

    // Massive columnar legs
    const legGeo = new THREE.CylinderGeometry(0.65 * scale, 0.7 * scale, 2.6 * scale, 8);
    const legPositions = [
      [-1.2, 1.3, 1.6],
      [1.2, 1.3, 1.6],
      [-1.2, 1.3, -1.6],
      [1.2, 1.3, -1.6],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, greyMat);
      leg.position.set(lx * scale, ly * scale, lz * scale);
      leg.castShadow = true;
      group.add(leg);
    });

    // Head & Trunk
    const headGeo = new THREE.SphereGeometry(1.5 * scale, 8, 8);
    const head = new THREE.Mesh(headGeo, greyMat);
    head.position.set(0, 4.0 * scale, 2.8 * scale);
    group.add(head);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 3.2 * scale, 8);
    const trunk = new THREE.Mesh(trunkGeo, greyMat);
    trunk.position.set(0, 2.2 * scale, 3.8 * scale);
    trunk.rotation.x = -0.3;
    group.add(trunk);

    // Ivory Tusks
    [-0.6, 0.6].forEach(tx => {
      const tuskGeo = new THREE.ConeGeometry(0.18 * scale, 1.8 * scale, 6);
      const tusk = new THREE.Mesh(tuskGeo, tuskMat);
      tusk.position.set(tx * scale, 2.6 * scale, 3.6 * scale);
      tusk.rotation.x = -0.8;
      group.add(tusk);
    });

    return group;
  }

  private createZebraModel(scale: number): THREE.Group {
    const group = new THREE.Group();
    // Striped zebra black/white material
    const zebraMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });

    const bodyGeo = new THREE.BoxGeometry(1.2 * scale, 1.2 * scale, 2.4 * scale);
    const body = new THREE.Mesh(bodyGeo, zebraMat);
    body.position.y = 1.8 * scale;
    body.castShadow = true;
    group.add(body);

    const legGeo = new THREE.CylinderGeometry(0.18 * scale, 0.18 * scale, 1.6 * scale, 6);
    [
      [-0.45, 0.8, 0.9],
      [0.45, 0.8, 0.9],
      [-0.45, 0.8, -0.9],
      [0.45, 0.8, -0.9],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, zebraMat);
      leg.position.set(lx * scale, ly * scale, lz * scale);
      leg.castShadow = true;
      group.add(leg);
    });

    // Neck & Head
    const headGeo = new THREE.BoxGeometry(0.6 * scale, 0.7 * scale, 1.4 * scale);
    const head = new THREE.Mesh(headGeo, zebraMat);
    head.position.set(0, 2.6 * scale, 1.4 * scale);
    group.add(head);

    return group;
  }

  private createRhinoModel(scale: number): THREE.Group {
    const group = new THREE.Group();
    const rhinoMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.95 });

    const bodyGeo = new THREE.BoxGeometry(2.4 * scale, 1.8 * scale, 3.8 * scale);
    const body = new THREE.Mesh(bodyGeo, rhinoMat);
    body.position.y = 1.8 * scale;
    body.castShadow = true;
    group.add(body);

    const headGeo = new THREE.BoxGeometry(1.2 * scale, 1.2 * scale, 1.8 * scale);
    const head = new THREE.Mesh(headGeo, rhinoMat);
    head.position.set(0, 1.8 * scale, 2.4 * scale);
    group.add(head);

    // Front horn
    const hornGeo = new THREE.ConeGeometry(0.25 * scale, 1.2 * scale, 6);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.5 });
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(0, 2.4 * scale, 3.1 * scale);
    horn.rotation.x = -0.5;
    group.add(horn);

    return group;
  }

  /* -------------------------------------------------------------
     TRAFFIC CORRIDORS & ROAD NETWORK
  ------------------------------------------------------------- */
  private initRoadCorridors() {
    // Corridor 0: Uhuru Highway Southbound (Main Western Arterial)
    const uhuruSouthPoints = [
      new THREE.Vector3(20, 0, -140),
      new THREE.Vector3(20, 0, -70),
      new THREE.Vector3(20, 0, 0),
      new THREE.Vector3(20, 0, 70),
      new THREE.Vector3(20, 0, 140),
    ];
    this.trafficCorridors.push(new THREE.CatmullRomCurve3(uhuruSouthPoints, false));

    // Corridor 1: Uhuru Highway Northbound (Dual Carriageway Return)
    const uhuruNorthPoints = [
      new THREE.Vector3(25, 0, 140),
      new THREE.Vector3(25, 0, 70),
      new THREE.Vector3(25, 0, 0),
      new THREE.Vector3(25, 0, -70),
      new THREE.Vector3(25, 0, -140),
    ];
    this.trafficCorridors.push(new THREE.CatmullRomCurve3(uhuruNorthPoints, false));

    // Corridor 2: Kenyatta Ave & Times Tower / CBD Inner Loop (Circular)
    const cbdLoopPoints = [
      new THREE.Vector3(22, 0, -35),
      new THREE.Vector3(65, 0, -35),
      new THREE.Vector3(105, 0, -35),
      new THREE.Vector3(105, 0, 25),
      new THREE.Vector3(65, 0, 25),
      new THREE.Vector3(22, 0, 25),
    ];
    this.trafficCorridors.push(new THREE.CatmullRomCurve3(cbdLoopPoints, true));

    // Corridor 3: Gikomba Market & Kariokor Artisan Trade Loop
    const gikombaTradePoints = [
      new THREE.Vector3(22, 0, 45),
      new THREE.Vector3(55, 0, 45),
      new THREE.Vector3(75, 0, 45),
      new THREE.Vector3(75, 0, -15),
      new THREE.Vector3(55, 0, -85),
      new THREE.Vector3(22, 0, -85),
    ];
    this.trafficCorridors.push(new THREE.CatmullRomCurve3(gikombaTradePoints, true));

    // Corridor 4: Elevated Nairobi Expressway (Fast High-Speed Bypass Overpass!)
    const expresswayPoints = [
      new THREE.Vector3(15, 10, -130),
      new THREE.Vector3(15, 10, -50),
      new THREE.Vector3(15, 10, 0),
      new THREE.Vector3(15, 10, 50),
      new THREE.Vector3(15, 10, 130),
    ];
    this.trafficCorridors.push(new THREE.CatmullRomCurve3(expresswayPoints, false));
  }

  /* -------------------------------------------------------------
     LOCALIZED BOTTLENECKS & JAM HAZARDS
  ------------------------------------------------------------- */
  private initBottlenecks() {
    this.bottlenecks = [
      {
        id: 'uhuru_police_roadblock',
        name: 'Uhuru Highway Police Roadblock',
        swahiliTitle: 'Ukaguzi wa Polisi na Msafara wa VIP',
        roadName: 'Uhuru Highway (CBD Central)',
        cause: 'police_checkpoint',
        position: { x: 20, z: -10 },
        radius: 36,
        severity: 85,
        description: 'Traffic Police and VIP convoy barrier narrowing 3 lanes into a single creeping checkpoint.',
        detourAdvice: 'Bypass via the Elevated Nairobi Expressway flyover or Central Park service lane!',
        active: true,
        clearTimeRemainingSec: 75,
      },
      {
        id: 'gikomba_mkokoteni_spill',
        name: 'Gikomba Bridge Handcart Breakdown',
        swahiliTitle: 'Mkokoteni wa Matunda Umeanguka',
        roadName: 'Pumwani / Gikomba Market Access',
        cause: 'mkokoteni_spill',
        position: { x: 74, z: 28 },
        radius: 30,
        severity: 90,
        description: 'Overloaded handcart lost its wooden axle, spilling mango and avocado crates across the market road.',
        detourAdvice: 'Divert through Kariokor Guild Road or Ngara backstreets!',
        active: false,
        clearTimeRemainingSec: 65,
      },
      {
        id: 'haile_selassie_stage_rush',
        name: 'Haile Selassie Roundabout Stage Rush',
        swahiliTitle: 'Foleni Kubwa ya Nganya (Stage Rush)',
        roadName: 'Haile Selassie Ave & Times Tower',
        cause: 'matatu_stage_rush',
        position: { x: 65, z: -15 },
        radius: 32,
        severity: 80,
        description: 'Buruburu and Rongai matatus double-parked blocking the roundabout to board rushing commuters.',
        detourAdvice: 'Weave through with a Boda Boda or divert along City Market avenue!',
        active: false,
        clearTimeRemainingSec: 70,
      },
      {
        id: 'ngara_thika_roadworks',
        name: 'Ngara Junction Drainage & Pothole Repair',
        swahiliTitle: 'Ujenzi na Ukarabati wa Barabara',
        roadName: 'Ngara / Park Road Junction',
        cause: 'road_works',
        position: { x: 105, z: -35 },
        radius: 28,
        severity: 75,
        description: 'Excavators and construction drums blocking 2 lanes for tarmac resurfacing.',
        detourAdvice: 'Use the Ring Road bypass to avoid the tailback!',
        active: false,
        clearTimeRemainingSec: 60,
      },
    ];

    this.currentActiveJam = this.bottlenecks[0];
    this.buildBottleneckMeshes();
    this.callbacks.onBottlenecksUpdate?.(this.bottlenecks);
  }

  private buildBottleneckMeshes() {
    this.bottlenecks.forEach(b => {
      const group = new THREE.Group();
      group.position.set(b.position.x, 0, b.position.z);

      if (b.cause === 'police_checkpoint') {
        // Striped police barrier saw-horses
        for (let i = -1; i <= 1; i++) {
          const barrierGeo = new THREE.BoxGeometry(4.5, 1.2, 0.4);
          const barrierMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // red/white hazard
          const barrier = new THREE.Mesh(barrierGeo, barrierMat);
          barrier.position.set(i * 3.5, 0.6, 0);
          barrier.castShadow = true;
          group.add(barrier);
        }

        // Cones
        for (let c = -3; c <= 3; c += 2) {
          const cone = new THREE.Mesh(
            new THREE.ConeGeometry(0.35, 1.1, 8),
            new THREE.MeshStandardMaterial({ color: 0xf97316 })
          );
          cone.position.set(c * 2, 0.55, 3);
          group.add(cone);
        }

        // Flashing police beacon light (Red & Blue alternating)
        const policeLight = new THREE.PointLight(0x3b82f6, 3, 25);
        policeLight.position.set(0, 3.5, 0);
        group.add(policeLight);
        this.policeBeaconLight = policeLight;

        // Police inspector figure
        const officer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 1.8, 8),
          new THREE.MeshStandardMaterial({ color: 0x1e3a8a })
        );
        officer.position.set(2, 0.9, -1.5);
        group.add(officer);

        const vest = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.7, 0.5),
          new THREE.MeshStandardMaterial({ color: 0x84cc16 }) // high-vis neon yellow
        );
        vest.position.set(2, 1.2, -1.5);
        group.add(vest);
      } else if (b.cause === 'mkokoteni_spill') {
        // Tilted handcart
        const cartBed = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.3, 2.2),
          new THREE.MeshStandardMaterial({ color: 0x78350f })
        );
        cartBed.position.set(0, 0.7, 0);
        cartBed.rotation.z = 0.35; // tilted
        group.add(cartBed);

        // Broken wheel
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 0.2, 12),
          new THREE.MeshStandardMaterial({ color: 0x1c1917 })
        );
        wheel.position.set(-1.6, 0.4, 0);
        wheel.rotation.x = Math.PI / 2;
        group.add(wheel);

        // Spilled mango/produce crates
        const crateMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
        const fruitMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
        for (let i = 0; i < 4; i++) {
          const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.0), crateMat);
          crate.position.set(i * 1.2 - 1.8, 0.4, 1.5 + (i % 2) * 0.8);
          crate.rotation.y = i * 0.4;
          group.add(crate);

          const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), fruitMat);
          fruit.position.set(i * 1.2 - 1.4, 0.3, 2.2);
          group.add(fruit);
        }

        // Hazard warning triangle
        const triangle = new THREE.Mesh(
          new THREE.ConeGeometry(0.6, 1.0, 3),
          new THREE.MeshStandardMaterial({ color: 0xef4444 })
        );
        triangle.position.set(3, 0.5, 4);
        group.add(triangle);
      } else if (b.cause === 'matatu_stage_rush') {
        // Two double-parked minibuses at an angle blocking lanes
        const matatuA = this.createMatatuMesh(0.85);
        matatuA.position.set(-2, 0, 0);
        matatuA.rotation.y = 0.45;
        group.add(matatuA);

        const matatuB = this.createMatatuMesh(0.85);
        matatuB.position.set(3.5, 0, -2);
        matatuB.rotation.y = -0.35;
        group.add(matatuB);

        // Amber flashing hazard beacon
        const hazardLight = new THREE.PointLight(0xf59e0b, 2.5, 20);
        hazardLight.position.set(0, 3, 0);
        group.add(hazardLight);
        this.hazardBeaconLight = hazardLight;
      } else if (b.cause === 'road_works') {
        // Construction barrels and gravel mound
        const drumMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
        for (let d = -2; d <= 2; d++) {
          const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 10), drumMat);
          drum.position.set(d * 1.8, 0.7, 0);
          group.add(drum);
        }
        // Gravel mound
        const mound = new THREE.Mesh(
          new THREE.SphereGeometry(2.5, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.9 })
        );
        mound.position.set(0, 0.5, -2);
        mound.scale.set(1.5, 0.4, 1.2);
        group.add(mound);
      }

      // Visibility based on initial active status
      group.visible = b.active;
      this.scene.add(group);
      this.bottleneckMeshGroups.set(b.id, group);
    });
  }

  /* -------------------------------------------------------------
     TRAFFIC FLEET CREATION (MATATUS, SEDANS, BODAS & LORRIES)
  ------------------------------------------------------------- */
  private buildTrafficFleet() {
    const fleetConfig = [
      // Corridor 0: Uhuru Southbound (Affected heavily by roadblock)
      { corridor: 0, count: 6, types: ['matatu', 'sedan', 'lorry', 'boda', 'matatu', 'sedan'] as const },
      // Corridor 1: Uhuru Northbound
      { corridor: 1, count: 5, types: ['sedan', 'matatu', 'boda', 'lorry', 'matatu'] as const },
      // Corridor 2: CBD Loop
      { corridor: 2, count: 6, types: ['matatu', 'sedan', 'boda', 'matatu', 'sedan', 'boda'] as const },
      // Corridor 3: Gikomba Market Access
      { corridor: 3, count: 5, types: ['lorry', 'matatu', 'boda', 'sedan', 'matatu'] as const },
      // Corridor 4: Elevated Expressway (Smooth fast flow!)
      { corridor: 4, count: 4, types: ['sedan', 'matatu', 'sedan', 'matatu'] as const },
    ];

    fleetConfig.forEach(cfg => {
      const curve = this.trafficCorridors[cfg.corridor];
      if (!curve) return;

      for (let i = 0; i < cfg.count; i++) {
        const type = cfg.types[i % cfg.types.length];
        const progress = i / cfg.count + Math.random() * 0.05;

        let mesh: THREE.Group;
        const brakeLights: THREE.Mesh[] = [];

        // Build 3D vehicle model with brake lights
        if (type === 'matatu') {
          const colors = [0xfacc15, 0x10b981, 0xec4899, 0x06b6d4];
          mesh = this.createMatatuMesh(0.85);
          // Add rear brake lights
          [-0.8, 0.8].forEach(bx => {
            const bl = new THREE.Mesh(
              new THREE.BoxGeometry(0.25, 0.2, 0.1),
              new THREE.MeshBasicMaterial({ color: 0x440000 })
            );
            bl.position.set(bx * 0.85, 1.2, -2.55);
            mesh.add(bl);
            brakeLights.push(bl);
          });
        } else if (type === 'sedan') {
          mesh = this.createSedanMesh(0.85, i % 2 === 0 ? 0xfbbf24 : 0xf8fafc);
          [-0.6, 0.6].forEach(bx => {
            const bl = new THREE.Mesh(
              new THREE.BoxGeometry(0.2, 0.15, 0.1),
              new THREE.MeshBasicMaterial({ color: 0x440000 })
            );
            bl.position.set(bx * 0.85, 0.8, -2.1);
            mesh.add(bl);
            brakeLights.push(bl);
          });
        } else if (type === 'lorry') {
          mesh = this.createLorryMesh(0.85);
          [-0.8, 0.8].forEach(bx => {
            const bl = new THREE.Mesh(
              new THREE.BoxGeometry(0.25, 0.2, 0.1),
              new THREE.MeshBasicMaterial({ color: 0x440000 })
            );
            bl.position.set(bx * 0.85, 1.0, -3.2);
            mesh.add(bl);
            brakeLights.push(bl);
          });
        } else {
          mesh = this.createTrafficBodaMesh(0.85);
          const bl = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x440000 })
          );
          bl.position.set(0, 0.8, -1.0);
          mesh.add(bl);
          brakeLights.push(bl);
        }

        const initialPos = curve.getPointAt(progress % 1);
        mesh.position.copy(initialPos);
        this.scene.add(mesh);

        const baseSpeed = cfg.corridor === 4 ? 0.00045 : 0.00028 + Math.random() * 0.00008;

        this.networkVehicles.push({
          group: mesh,
          type,
          corridorId: cfg.corridor,
          progress: progress % 1,
          speed: baseSpeed,
          baseSpeed,
          brakeLights,
          isBraking: false,
        });
      }
    });
  }

  private createSedanMesh(scale: number, color: number): THREE.Group {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b });

    // Chassis
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8 * scale, 0.9 * scale, 4.4 * scale), bodyMat);
    body.position.y = 0.7 * scale;
    body.castShadow = true;
    group.add(body);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6 * scale, 0.7 * scale, 2.2 * scale), glassMat);
    cabin.position.set(0, 1.3 * scale, -0.2 * scale);
    group.add(cabin);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.38 * scale, 0.38 * scale, 0.25 * scale, 12);
    wGeo.rotateZ(Math.PI / 2);
    [
      [-0.95, 0.38, 1.3],
      [0.95, 0.38, 1.3],
      [-0.95, 0.38, -1.3],
      [0.95, 0.38, -1.3],
    ].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wGeo, wheelMat);
      w.position.set(wx * scale, wy * scale, wz * scale);
      group.add(w);
    });

    return group;
  }

  private createLorryMesh(scale: number): THREE.Group {
    const group = new THREE.Group();
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }); // Isuzu Blue
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // wood flatbed
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b });

    // Driver Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2 * scale, 2.2 * scale, 2.0 * scale), cabMat);
    cab.position.set(0, 1.5 * scale, 2.0 * scale);
    cab.castShadow = true;
    group.add(cab);

    // Cargo Bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4 * scale, 1.4 * scale, 4.8 * scale), bedMat);
    bed.position.set(0, 1.2 * scale, -1.4 * scale);
    bed.castShadow = true;
    group.add(bed);

    // Stacked crates
    const crateMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
    for (let i = 0; i < 3; i++) {
      const cr = new THREE.Mesh(new THREE.BoxGeometry(1.8 * scale, 1.0 * scale, 1.2 * scale), crateMat);
      cr.position.set(0, 2.2 * scale, -2.5 * scale + i * 1.4 * scale);
      group.add(cr);
    }

    // Heavy 6 Wheels
    const wGeo = new THREE.CylinderGeometry(0.55 * scale, 0.55 * scale, 0.35 * scale, 12);
    wGeo.rotateZ(Math.PI / 2);
    [
      [-1.2, 0.55, 2.0],
      [1.2, 0.55, 2.0],
      [-1.2, 0.55, -1.0],
      [1.2, 0.55, -1.0],
      [-1.2, 0.55, -2.8],
      [1.2, 0.55, -2.8],
    ].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wGeo, wheelMat);
      w.position.set(wx * scale, wy * scale, wz * scale);
      group.add(w);
    });

    return group;
  }

  private createTrafficBodaMesh(scale: number): THREE.Group {
    const group = new THREE.Group();
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x171717 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.5 * scale, 1.8 * scale), redMat);
    frame.position.y = 0.7 * scale;
    group.add(frame);

    const rider = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.9 * scale, 0.4 * scale), blackMat);
    rider.position.set(0, 1.3 * scale, -0.2 * scale);
    group.add(rider);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 6, 6), redMat);
    helmet.position.set(0, 1.9 * scale, -0.2 * scale);
    group.add(helmet);

    return group;
  }

  /* -------------------------------------------------------------
     TRAFFIC & STREET NPCS (CHATTABLE CHARACTERS)
  ------------------------------------------------------------- */
  private buildTrafficAndPedestrians() {
    this.buildTrafficFleet();

    // Street NPCs with authentic dialogue and Sheng banter
    const npcData = [
      {
        name: 'Otieno Boda Master',
        role: 'Boda Boda Rider',
        dialogue: 'Niaje msee! Ukipata jam ya Uhuru Highway, tumia njia ya Expressway au panda boda tupenye katikati!',
        pos: new THREE.Vector3(20, 0, 15),
      },
      {
        name: 'Mama Mboga Faith',
        role: 'Street Vendor',
        dialogue: 'Karibu! Mahindi choma moto moto hapa. Foleni ikishika Gikomba, wateja hula mahindi wakiwa kwa jam!',
        pos: new THREE.Vector3(-10, 0, -5),
      },
      {
        name: 'Ranger Mutua',
        role: 'KWS Wildlife Scout',
        dialogue: 'Porini hakuna jam ya magari—kuna foleni ya tembo wakivuka barabara ya vumbi pekee!',
        pos: new THREE.Vector3(-110, 0, -130),
      },
      {
        name: 'Brayo "DJ Beats"',
        role: 'Music Producer & Tout',
        dialogue: 'Uhuru Highway imekwama kwa police roadblock! Weka Radio Maisha tutulie kwa hii jam!',
        pos: new THREE.Vector3(65, 0, 25),
      },
    ];

    npcData.forEach(nd => {
      const npcGrp = new THREE.Group();
      npcGrp.position.copy(nd.pos);

      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x0284c7 })
      );
      body.position.y = 0.9;
      npcGrp.add(body);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x573010 })
      );
      head.position.y = 2.0;
      npcGrp.add(head);

      const badgeGeo = new THREE.RingGeometry(0.2, 0.35, 12);
      const badgeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.position.set(0, 2.7, 0);
      badge.rotation.x = Math.PI / 2;
      npcGrp.add(badge);

      this.scene.add(npcGrp);
      this.streetNpcs.push({
        group: npcGrp,
        name: nd.name,
        role: nd.role,
        dialogue: nd.dialogue,
        basePos: nd.pos,
      });
    });
  }

  /* -------------------------------------------------------------
     PLAYER VEHICLE CREATION
  ------------------------------------------------------------- */
  public setVehicle(type: VehicleId) {
    this.currentVehicleType = type;
    this.buildPlayerVehicle();
  }

  private buildPlayerVehicle() {
    // Clear old vehicle mesh
    while (this.vehicleMeshGroup.children.length > 0) {
      const child = this.vehicleMeshGroup.children[0];
      this.vehicleMeshGroup.remove(child);
    }
    this.vehicleHeadlights = [];

    let mesh: THREE.Group;
    this.helicopterRotorMesh = null;

    switch (this.currentVehicleType) {
      case 'matatu':
        mesh = this.createMatatuMesh(1.0);
        break;
      case 'cruiser':
        mesh = this.createSafariCruiserMesh(1.0);
        break;
      case 'bodaboda':
        mesh = this.createBodaBodaMesh(1.0);
        break;
      case 'rangerover':
        mesh = this.createRangeRoverMesh(1.0);
        break;
      case 'helicopter':
        mesh = this.createHelicopterMesh(1.0);
        break;
      case 'privatejet':
        mesh = this.createPrivateJetMesh(1.0);
        break;
      case 'foot':
      default:
        mesh = this.createFootCharacterMesh(1.0);
        break;
    }

    this.vehicleMeshGroup.add(mesh);
    if (!this.playerGroup.parent) {
      this.playerGroup.position.set(0, 0, 10);
      this.playerGroup.add(this.vehicleMeshGroup);
      this.scene.add(this.playerGroup);
    }
  }

  private createMatatuMesh(scale: number): THREE.Group {
    const group = new THREE.Group();
    // Vibrant Nganya paint: Electric yellow / neon cyan / fiery orange
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // electric yellow base
      metalness: 0.5,
      roughness: 0.3,
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // racing red graffiti stripe
      metalness: 0.4,
      roughness: 0.4,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.9,
      roughness: 0.1,
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x171717,
      roughness: 0.8,
    });

    // Minibus Body Box
    const bodyGeo = new THREE.BoxGeometry(2.3 * scale, 2.1 * scale, 6.0 * scale);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.45 * scale;
    body.castShadow = true;
    group.add(body);

    // Dynamic side graffiti stripes
    const stripeGeo = new THREE.BoxGeometry(2.34 * scale, 0.45 * scale, 5.8 * scale);
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 1.35 * scale;
    group.add(stripe);

    // Windshield & Windows
    const cabinGeo = new THREE.BoxGeometry(2.28 * scale, 0.8 * scale, 4.8 * scale);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.y = 1.95 * scale;
    group.add(cabin);

    // Roof rack & rear spoiler
    const rackGeo = new THREE.BoxGeometry(1.8 * scale, 0.2 * scale, 3.6 * scale);
    const rack = new THREE.Mesh(rackGeo, stripeMat);
    rack.position.y = 2.6 * scale;
    group.add(rack);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.52 * scale, 0.52 * scale, 0.35 * scale, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelOffsets = [
      [-1.2, 0.52, 1.8],
      [1.2, 0.52, 1.8],
      [-1.2, 0.52, -1.8],
      [1.2, 0.52, -1.8],
    ];
    wheelOffsets.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx * scale, wy * scale, wz * scale);
      wheel.castShadow = true;
      group.add(wheel);
    });

    // Twin Headlights with SpotLight cones
    [-0.8, 0.8].forEach(hx => {
      const headLightMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 * scale, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfffbeb })
      );
      headLightMesh.position.set(hx * scale, 1.1 * scale, 3.05 * scale);
      group.add(headLightMesh);

      const spot = new THREE.SpotLight(0xfffbeb, 0, 45, Math.PI / 5, 0.4);
      spot.position.set(hx * scale, 1.1 * scale, 3.1 * scale);
      spot.target.position.set(hx * scale, 0.2 * scale, 25 * scale);
      group.add(spot);
      group.add(spot.target);
      this.vehicleHeadlights.push(spot);
    });

    // Neon underglow
    const neon = new THREE.PointLight(0x06b6d4, 1.5, 6);
    neon.position.set(0, 0.3 * scale, 0);
    group.add(neon);

    return group;
  }

  private createSafariCruiserMesh(scale: number): THREE.Group {
    const group = new THREE.Group();
    const khakiMat = new THREE.MeshStandardMaterial({ color: 0x4f772d, roughness: 0.6 }); // olive green
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.8 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

    // 4x4 rugged body
    const bodyGeo = new THREE.BoxGeometry(2.2 * scale, 1.6 * scale, 5.2 * scale);
    const body = new THREE.Mesh(bodyGeo, khakiMat);
    body.position.y = 1.4 * scale;
    body.castShadow = true;
    group.add(body);

    // Pop-up open observation roof hatch
    const roofPolesGeo = new THREE.CylinderGeometry(0.06 * scale, 0.06 * scale, 1.0 * scale, 6);
    [-0.9, 0.9].forEach(rx => {
      [-1.2, 1.2].forEach(rz => {
        const pole = new THREE.Mesh(roofPolesGeo, metalMat);
        pole.position.set(rx * scale, 2.7 * scale, rz * scale);
        group.add(pole);
      });
    });

    const popRoofGeo = new THREE.BoxGeometry(2.0 * scale, 0.15 * scale, 2.6 * scale);
    const popRoof = new THREE.Mesh(popRoofGeo, khakiMat);
    popRoof.position.set(0, 3.2 * scale, 0);
    group.add(popRoof);

    // Big Off-Road High-Suspension Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.65 * scale, 0.65 * scale, 0.45 * scale, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    [
      [-1.2, 0.65, 1.6],
      [1.2, 0.65, 1.6],
      [-1.2, 0.65, -1.6],
      [1.2, 0.65, -1.6],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx * scale, wy * scale, wz * scale);
      wheel.castShadow = true;
      group.add(wheel);
    });

    // Spare tire mounted on back
    const spare = new THREE.Mesh(wheelGeo, wheelMat);
    spare.position.set(0, 1.5 * scale, -2.85 * scale);
    spare.rotation.x = Math.PI / 2;
    group.add(spare);

    // Headlights
    [-0.75, 0.75].forEach(hx => {
      const spot = new THREE.SpotLight(0xfffbeb, 0, 50, Math.PI / 4, 0.5);
      spot.position.set(hx * scale, 1.3 * scale, 2.7 * scale);
      spot.target.position.set(hx * scale, 0.2 * scale, 30 * scale);
      group.add(spot);
      group.add(spot.target);
      this.vehicleHeadlights.push(spot);
    });

    return group;
  }

  private createBodaBodaMesh(scale: number): THREE.Group {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7, roughness: 0.3 }); // red Boxer boda
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });

    // Chassis frame
    const frameGeo = new THREE.BoxGeometry(0.4 * scale, 0.6 * scale, 2.2 * scale);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 0.9 * scale;
    group.add(frame);

    // Seat
    const seatGeo = new THREE.BoxGeometry(0.55 * scale, 0.25 * scale, 1.2 * scale);
    const seat = new THREE.Mesh(seatGeo, blackMat);
    seat.position.set(0, 1.3 * scale, -0.3 * scale);
    group.add(seat);

    // Front & rear wheels
    const wheelGeo = new THREE.CylinderGeometry(0.48 * scale, 0.48 * scale, 0.18 * scale, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const fWheel = new THREE.Mesh(wheelGeo, blackMat);
    fWheel.position.set(0, 0.48 * scale, 1.1 * scale);
    group.add(fWheel);

    const rWheel = new THREE.Mesh(wheelGeo, blackMat);
    rWheel.position.set(0, 0.48 * scale, -1.1 * scale);
    group.add(rWheel);

    // Handlebars
    const barGeo = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 1.1 * scale, 8);
    barGeo.rotateZ(Math.PI / 2);
    const bars = new THREE.Mesh(barGeo, blackMat);
    bars.position.set(0, 1.6 * scale, 0.85 * scale);
    group.add(bars);

    // Single headlight
    const spot = new THREE.SpotLight(0xfffbeb, 0, 40, Math.PI / 4, 0.4);
    spot.position.set(0, 1.3 * scale, 1.2 * scale);
    spot.target.position.set(0, 0.2 * scale, 25 * scale);
    group.add(spot);
    group.add(spot.target);
    this.vehicleHeadlights.push(spot);

    return group;
  }

  private createFootCharacterMesh(scale: number): THREE.Group {
    const group = new THREE.Group();
    const safariShirtMat = new THREE.MeshStandardMaterial({ color: 0xd97706 }); // safari ranger orange/khaki
    const jeanMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a }); // blue trousers
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x573010 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7 * scale, 0.9 * scale, 0.4 * scale), safariShirtMat);
    torso.position.y = 1.3 * scale;
    torso.castShadow = true;
    group.add(torso);

    // Legs
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.65 * scale, 0.85 * scale, 0.38 * scale), jeanMat);
    legs.position.y = 0.45 * scale;
    group.add(legs);

    // Head with Ranger Hat
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3 * scale, 8, 8), skinMat);
    head.position.y = 1.95 * scale;
    group.add(head);

    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.55 * scale, 0.55 * scale, 0.08 * scale, 12), safariShirtMat);
    hat.position.y = 2.15 * scale;
    group.add(hat);

    return group;
  }

  private createRangeRoverMesh(scale: number): THREE.Group {
    const group = new THREE.Group();
    // Sovereign gold & obsidian two-tone luxury paint
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.1 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.05, metalness: 0.95 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7, roughness: 0.3 });

    // Chassis Box
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.3 * scale, 1.4 * scale, 5.2 * scale), bodyMat);
    body.position.y = 1.3 * scale;
    body.castShadow = true;
    group.add(body);

    // Floating Black Contrast Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.15 * scale, 0.7 * scale, 3.2 * scale), roofMat);
    roof.position.set(0, 2.1 * scale, -0.4 * scale);
    group.add(roof);

    // Windows
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2 * scale, 0.65 * scale, 3.1 * scale), glassMat);
    cabin.position.set(0, 1.9 * scale, -0.4 * scale);
    group.add(cabin);

    // 4 Luxury Alloy Wheels
    const wGeo = new THREE.CylinderGeometry(0.58 * scale, 0.58 * scale, 0.4 * scale, 16);
    wGeo.rotateZ(Math.PI / 2);
    [
      [-1.25, 0.58, 1.6],
      [1.25, 0.58, 1.6],
      [-1.25, 0.58, -1.6],
      [1.25, 0.58, -1.6],
    ].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wGeo, wheelMat);
      w.position.set(wx * scale, wy * scale, wz * scale);
      group.add(w);
    });

    // Twin LED Projector Headlights
    [-0.8, 0.8].forEach(hx => {
      const spot = new THREE.SpotLight(0xfffbeb, 0, 55, Math.PI / 4, 0.4);
      spot.position.set(hx * scale, 1.2 * scale, 2.7 * scale);
      spot.target.position.set(hx * scale, 0.2 * scale, 30 * scale);
      group.add(spot);
      group.add(spot.target);
      this.vehicleHeadlights.push(spot);
    });

    return group;
  }

  private createHelicopterMesh(scale: number): THREE.Group {
    const group = new THREE.Group();
    const heliMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 }); // VIP Navy Blue
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });

    // Fuselage Capsule / Pod
    const podGeo = new THREE.BoxGeometry(2.2 * scale, 2.2 * scale, 4.4 * scale);
    const pod = new THREE.Mesh(podGeo, heliMat);
    pod.position.y = 2.0 * scale;
    pod.castShadow = true;
    group.add(pod);

    // Bubble Cockpit Front
    const cockpitGeo = new THREE.SphereGeometry(1.3 * scale, 12, 12);
    const cockpit = new THREE.Mesh(cockpitGeo, glassMat);
    cockpit.position.set(0, 2.0 * scale, 1.8 * scale);
    cockpit.scale.set(0.9, 0.85, 1.1);
    group.add(cockpit);

    // Tail Boom
    const boomGeo = new THREE.CylinderGeometry(0.35 * scale, 0.6 * scale, 5.0 * scale, 8);
    boomGeo.rotateX(Math.PI / 2);
    const boom = new THREE.Mesh(boomGeo, heliMat);
    boom.position.set(0, 2.4 * scale, -4.2 * scale);
    group.add(boom);

    // Vertical Tail Fin
    const finGeo = new THREE.BoxGeometry(0.15 * scale, 1.8 * scale, 1.2 * scale);
    const fin = new THREE.Mesh(finGeo, heliMat);
    fin.position.set(0, 3.0 * scale, -6.4 * scale);
    group.add(fin);

    // Landing Skids
    const skidGeo = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 4.6 * scale, 6);
    skidGeo.rotateX(Math.PI / 2);
    [-1.0, 1.0].forEach(sx => {
      const skid = new THREE.Mesh(skidGeo, metalMat);
      skid.position.set(sx * scale, 0.3 * scale, 0);
      group.add(skid);
    });

    // Spinning Top Rotor Mast & Blades
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(0, 3.4 * scale, 0.2 * scale);

    const mastGeo = new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 0.8 * scale, 6);
    const mast = new THREE.Mesh(mastGeo, metalMat);
    mast.position.y = -0.3 * scale;
    rotorGroup.add(mast);

    // 4 Blades
    for (let i = 0; i < 4; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.3 * scale, 0.05 * scale, 5.2 * scale);
      const blade = new THREE.Mesh(bladeGeo, metalMat);
      blade.rotation.y = (i * Math.PI) / 2;
      rotorGroup.add(blade);
    }

    group.add(rotorGroup);
    this.helicopterRotorMesh = rotorGroup;

    return group;
  }

  private createPrivateJetMesh(scale: number): THREE.Group {
    const group = new THREE.Group();
    const jetWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, roughness: 0.25 }); // Pearl White
    const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 }); // VIP Gold
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 });

    // Streamlined Fuselage Cylinder
    const fuselageGeo = new THREE.CylinderGeometry(1.2 * scale, 1.2 * scale, 11.0 * scale, 16);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, jetWhiteMat);
    fuselage.position.y = 2.2 * scale;
    fuselage.castShadow = true;
    group.add(fuselage);

    // Pointed Cockpit Nose Cone
    const noseGeo = new THREE.ConeGeometry(1.2 * scale, 3.2 * scale, 16);
    noseGeo.rotateX(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, jetWhiteMat);
    nose.position.set(0, 2.2 * scale, 6.8 * scale);
    group.add(nose);

    // Cockpit Windows
    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.4 * scale, 0.5 * scale, 1.4 * scale), glassMat);
    cockpit.position.set(0, 2.7 * scale, 5.2 * scale);
    group.add(cockpit);

    // Swept-Back Main Wings
    const wingGeo = new THREE.BoxGeometry(14.0 * scale, 0.18 * scale, 2.8 * scale);
    const wing = new THREE.Mesh(wingGeo, jetWhiteMat);
    wing.position.set(0, 2.0 * scale, -0.5 * scale);
    wing.rotation.y = -0.1;
    group.add(wing);

    // Angled Winglets
    [-6.9, 6.9].forEach(wx => {
      const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 1.2 * scale, 0.8 * scale), goldTrimMat);
      winglet.position.set(wx * scale, 2.6 * scale, -0.6 * scale);
      group.add(winglet);
    });

    // Twin Rear-Mounted Jet Engines
    [-1.6, 1.6].forEach(ex => {
      const engGeo = new THREE.CylinderGeometry(0.55 * scale, 0.55 * scale, 3.0 * scale, 12);
      engGeo.rotateX(Math.PI / 2);
      const eng = new THREE.Mesh(engGeo, engineMat);
      eng.position.set(ex * scale, 2.8 * scale, -3.2 * scale);
      group.add(eng);

      // Jet exhaust glow
      const glow = new THREE.PointLight(0x38bdf8, 1.5, 8);
      glow.position.set(ex * scale, 2.8 * scale, -4.8 * scale);
      group.add(glow);
    });

    // T-Tail Stabilizer
    const vTailGeo = new THREE.BoxGeometry(0.2 * scale, 3.2 * scale, 2.0 * scale);
    const vTail = new THREE.Mesh(vTailGeo, goldTrimMat);
    vTail.position.set(0, 3.8 * scale, -5.2 * scale);
    group.add(vTail);

    const hTailGeo = new THREE.BoxGeometry(5.2 * scale, 0.15 * scale, 1.4 * scale);
    const hTail = new THREE.Mesh(hTailGeo, jetWhiteMat);
    hTail.position.set(0, 5.2 * scale, -5.4 * scale);
    group.add(hTail);

    return group;
  }

  /* -------------------------------------------------------------
     CONTROLS & INPUT
  ------------------------------------------------------------- */
  private onKeyDown = (e: KeyboardEvent) => {
    this.handleKeyDown(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.handleKeyUp(e.code);
  };

  private setupListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onWindowResize);
  }

  private handleKeyDown(code: string) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputKeys.forward = true;
        soundManager.startEngine();
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputKeys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputKeys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputKeys.right = true;
        break;
      case 'Space':
        this.inputKeys.brake = true;
        break;
      case 'KeyH':
        soundManager.playHorn();
        break;
    }
  }

  private handleKeyUp(code: string) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputKeys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputKeys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputKeys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputKeys.right = false;
        break;
      case 'Space':
        this.inputKeys.brake = false;
        break;
    }
  }

  public setTouchInput(forward: boolean, backward: boolean, left: boolean, right: boolean, brake: boolean) {
    this.inputKeys.forward = forward;
    this.inputKeys.backward = backward;
    this.inputKeys.left = left;
    this.inputKeys.right = right;
    this.inputKeys.brake = brake;
    if (forward) {
      soundManager.startEngine();
    }
  }

  public triggerHorn() {
    soundManager.playHorn();
  }

  public setPhotoCameraMode(enabled: boolean, fov: number = 55) {
    this.isPhotoCameraMode = enabled;
    this.photoFov = fov;
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  public setCameraZoom(zoom: number) {
    // zoom: 1 (normal) to 4 (high zoom)
    this.photoFov = 55 / zoom;
    this.camera.fov = this.photoFov;
    this.camera.updateProjectionMatrix();
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /* -------------------------------------------------------------
     PHYSICS & MAIN GAME LOOP
  ------------------------------------------------------------- */
  private updatePlayerPhysics(dt: number) {
    const spec = this.vehicleSpecs[this.currentVehicleType];

    // Acceleration & Reversing
    if (this.inputKeys.forward) {
      this.playerSpeed += spec.accel;
    } else if (this.inputKeys.backward) {
      this.playerSpeed -= spec.accel * 0.7;
    }

    // Handbrake
    if (this.inputKeys.brake) {
      this.playerSpeed *= 0.9;
    }

    // Natural drag / friction
    this.playerSpeed *= spec.friction;

    // Clamp speed
    this.playerSpeed = Math.max(-spec.maxSpeed * 0.45, Math.min(spec.maxSpeed, this.playerSpeed));

    // Steering
    if (Math.abs(this.playerSpeed) > 0.02) {
      const dirMultiplier = this.playerSpeed > 0 ? 1 : -1;
      if (this.inputKeys.left) {
        this.playerHeading += spec.turnSpeed * dirMultiplier;
      }
      if (this.inputKeys.right) {
        this.playerHeading -= spec.turnSpeed * dirMultiplier;
      }
    }

    // Update position
    this.playerGroup.position.x += Math.sin(this.playerHeading) * this.playerSpeed * 60 * dt;
    this.playerGroup.position.z += Math.cos(this.playerHeading) * this.playerSpeed * 60 * dt;
    this.playerGroup.rotation.y = this.playerHeading;

    // Traffic Jam Bottleneck Impact:
    // If inside a ground bottleneck and not on agile bodaboda, ground vehicle crawls in traffic
    if (this.playerInJam && this.currentVehicleType !== 'bodaboda' && !spec.isAerial) {
      if (Math.abs(this.playerSpeed) > 0.22) {
        this.playerSpeed = THREE.MathUtils.lerp(this.playerSpeed, 0.18, 0.08);
      }
    }

    // Flight Physics for Aircraft vs Ground Vehicles
    if (spec.isAerial) {
      if (this.helicopterRotorMesh) {
        this.helicopterRotorMesh.rotation.y += 0.5;
      }

      // Check proximity to KICC Helipad (x ~ 40, z ~ 0)
      const distToKiccHelipad = Math.hypot(this.playerGroup.position.x - 40, this.playerGroup.position.z - 0);
      const isAboveHelipad = distToKiccHelipad < 14;

      let targetAlt = 0;
      if (this.inputKeys.forward) {
        targetAlt = this.currentVehicleType === 'privatejet' ? 55 : 34;
      } else if (this.inputKeys.brake) {
        targetAlt = isAboveHelipad ? 63.5 : 0;
      } else {
        targetAlt = isAboveHelipad ? 63.5 : (Math.abs(this.playerSpeed) > 0.15 ? 28 : 0);
      }

      this.currentAltitude = THREE.MathUtils.lerp(this.currentAltitude, targetAlt, 0.035);
      this.playerGroup.position.y = this.currentAltitude;

      // Banking roll & pitch
      const bank = (this.inputKeys.left ? 0.38 : 0) - (this.inputKeys.right ? 0.38 : 0);
      this.vehicleMeshGroup.rotation.z = THREE.MathUtils.lerp(this.vehicleMeshGroup.rotation.z, bank, 0.1);
      const pitch = this.inputKeys.forward ? 0.1 : (this.inputKeys.backward ? -0.12 : 0);
      this.vehicleMeshGroup.rotation.x = THREE.MathUtils.lerp(this.vehicleMeshGroup.rotation.x, pitch, 0.1);
    } else {
      this.currentAltitude = THREE.MathUtils.lerp(this.currentAltitude, 0, 0.1);
      this.playerGroup.position.y = 0;
      this.vehicleMeshGroup.rotation.x = 0;

      if (this.currentVehicleType === 'bodaboda') {
        const tilt = (this.inputKeys.left ? 0.25 : 0) - (this.inputKeys.right ? 0.25 : 0);
        this.vehicleMeshGroup.rotation.z = THREE.MathUtils.lerp(this.vehicleMeshGroup.rotation.z, tilt, 0.15);
      } else {
        this.vehicleMeshGroup.rotation.z = 0;
      }
    }

    // Engine sound feedback
    const speedRatio = Math.abs(this.playerSpeed) / spec.maxSpeed;
    soundManager.updateEnginePitch(speedRatio);
    this.callbacks.onSpeedUpdate(Math.round(speedRatio * 110));

    // Position callback for HUD / Minimap
    this.callbacks.onPositionUpdate({
      x: this.playerGroup.position.x,
      z: this.playerGroup.position.z,
      heading: this.playerHeading,
    });
  }

  private updateCamera() {
    const pPos = this.playerGroup.position;

    if (this.isPhotoCameraMode) {
      // First-person viewfinder / safari roof camera
      const eyeHeight = this.currentVehicleType === 'cruiser' ? 3.3 : 1.9;
      this.camera.position.set(
        pPos.x + Math.sin(this.playerHeading) * 1.5,
        pPos.y + eyeHeight,
        pPos.z + Math.cos(this.playerHeading) * 1.5
      );
      this.cameraLookTarget.set(
        pPos.x + Math.sin(this.playerHeading) * 20,
        pPos.y + eyeHeight,
        pPos.z + Math.cos(this.playerHeading) * 20
      );
      this.camera.lookAt(this.cameraLookTarget);
    } else {
      // Third-person vehicle chase camera with smooth damping
      const targetCamX = pPos.x - Math.sin(this.playerHeading) * this.cameraOffset.z;
      const targetCamZ = pPos.z - Math.cos(this.playerHeading) * this.cameraOffset.z;
      const targetCamY = pPos.y + this.cameraOffset.y;

      this.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.1);
      this.cameraLookTarget.lerp(new THREE.Vector3(pPos.x, pPos.y + 1.6, pPos.z), 0.15);
      this.camera.lookAt(this.cameraLookTarget);
    }
  }

  private updateWildlife(dt: number) {
    let closestAnimal: WildlifeEntity | null = null;
    let minAnimalDist = Infinity;

    const isFoggy = this.currentWeather.id === 'foggy_morning';
    const isHeatwave = this.currentWeather.id === 'golden_heatwave';

    this.wildlifeMeshes.forEach(w => {
      // Dynamic weather behavioral influences:
      let moveSpeed = 0.12;
      let fleeThreshold = 12;

      // In foggy morning: predators (lions) stalk actively in the mist and are bolder!
      if (isFoggy && w.entity.species === 'lion') {
        moveSpeed = 0.28; // stalking fast through morning mist
        fleeThreshold = 6; // bolder, won't flee easily
      }

      // In heatwave: elephants move toward the savannah waterhole (-140, -170)
      if (isHeatwave && w.entity.species === 'elephant') {
        const waterX = -140;
        const waterZ = -170;
        const angleToWater = Math.atan2(waterX - w.group.position.x, waterZ - w.group.position.z);
        w.entity.heading = THREE.MathUtils.lerp(w.entity.heading, angleToWater, 0.04);
        w.group.rotation.y = w.entity.heading;
      }

      w.group.position.x += Math.sin(w.entity.heading) * moveSpeed * dt;
      w.group.position.z += Math.cos(w.entity.heading) * moveSpeed * dt;

      // Distance to player
      const dx = w.group.position.x - this.playerGroup.position.x;
      const dz = w.group.position.z - this.playerGroup.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Flee or alert if noisy vehicle approaches too close
      if (dist < fleeThreshold && Math.abs(this.playerSpeed) > 0.4) {
        w.entity.heading = Math.atan2(dx, dz); // flee away
        w.group.rotation.y = w.entity.heading;
      }

      if (dist < minAnimalDist) {
        minAnimalDist = dist;
        closestAnimal = w.entity;
      }
    });

    // Notify photo camera HUD if animal is in range
    // Foggy morning mist boosts detection threshold on telephoto viewfinder
    const maxDetectDist = isFoggy ? 55 : 45;
    if (minAnimalDist < maxDetectDist) {
      this.callbacks.onAnimalInView(closestAnimal, Math.round(minAnimalDist));
    } else {
      this.callbacks.onAnimalInView(null, 0);
    }
  }

  /* -------------------------------------------------------------
     TRAFFIC SIMULATION & BUMPER-TO-BUMPER QUEUES
  ------------------------------------------------------------- */
  private updateTrafficNetwork(dt: number) {
    const activeBottlenecks = this.bottlenecks.filter(b => b.active);
    const isHeavyRain = this.currentWeather.id === 'heavy_rain';

    for (let i = 0; i < this.networkVehicles.length; i++) {
      const v = this.networkVehicles[i];
      const curve = this.trafficCorridors[v.corridorId];
      if (!curve) continue;

      const currentPos = curve.getPointAt(v.progress % 1);

      // Check distance to car ahead on the same corridor
      let minDistToCarAhead = Infinity;
      for (let j = 0; j < this.networkVehicles.length; j++) {
        if (i === j) continue;
        const other = this.networkVehicles[j];
        if (other.corridorId !== v.corridorId) continue;

        // Progress distance ahead
        let progDiff = other.progress - v.progress;
        if (progDiff < 0 && curve.closed) progDiff += 1;

        if (progDiff > 0 && progDiff < 0.25) {
          const otherPos = curve.getPointAt(other.progress % 1);
          const dist = currentPos.distanceTo(otherPos);
          if (dist < minDistToCarAhead) {
            minDistToCarAhead = dist;
          }
        }
      }

      // Check distance to active bottlenecks
      let inBottleneckZone = false;
      let jamSlowdownFactor = 1.0;

      // Elevated Expressway (corridor 4) is clear of ground-level roadblocks!
      if (v.corridorId !== 4) {
        for (const b of activeBottlenecks) {
          // Weather influence: Heavy rain swells congestion radius by 1.45x!
          const effectiveRadius = b.radius * (isHeavyRain ? 1.45 : 1.0);
          const distToJam = Math.hypot(currentPos.x - b.position.x, currentPos.z - b.position.z);
          if (distToJam < effectiveRadius) {
            inBottleneckZone = true;
            jamSlowdownFactor = Math.min(jamSlowdownFactor, Math.max(0.04, (distToJam / effectiveRadius) * 0.25));
          }
        }
      }

      // Compute target speed
      let targetSpeed = v.baseSpeed;

      // Heavy downpour causes overall ground network traffic slowdown across Nairobi
      if (isHeavyRain && v.corridorId !== 4) {
        targetSpeed *= 0.62; // 38% slower general traffic flow in rain
      }

      if (inBottleneckZone) {
        targetSpeed = v.baseSpeed * jamSlowdownFactor;
      }

      // Car-following spacing (accordion bumper-to-bumper queue effect)
      // In rain, wet stopping distances cause larger queue pile-ups
      const stopDist = isHeavyRain ? 5.5 : 4.2;
      const slowDist = isHeavyRain ? 12.0 : 8.5;

      if (minDistToCarAhead < stopDist) {
        targetSpeed = 0; // complete halt in queue
      } else if (minDistToCarAhead < slowDist) {
        targetSpeed = Math.min(targetSpeed, v.baseSpeed * (minDistToCarAhead / slowDist) * 0.4);
      }

      // Smooth acceleration / braking
      const isBraking = targetSpeed < v.speed;
      v.speed = THREE.MathUtils.lerp(v.speed, targetSpeed, isBraking ? 0.2 : 0.05);

      // Advance progress
      v.progress = (v.progress + v.speed * 60 * dt) % 1;

      // Update 3D position & heading
      const newPos = curve.getPointAt(v.progress);
      const tangent = curve.getTangentAt(v.progress);

      v.group.position.copy(newPos);
      v.group.rotation.y = Math.atan2(tangent.x, tangent.z);

      // Brake lights activation
      const shouldBrakeLightsShine = v.speed < v.baseSpeed * 0.5 || isBraking;
      v.brakeLights.forEach(bl => {
        (bl.material as THREE.MeshBasicMaterial).color.setHex(shouldBrakeLightsShine ? 0xff1111 : 0x330000);
      });
    }
  }

  /* -------------------------------------------------------------
     DYNAMIC BOTTLENECK LIFECYCLE & ROTATION
  ------------------------------------------------------------- */
  private updateBottlenecks(dt: number) {
    // Pulse hazard beacon and police strobes
    const timeSec = performance.now() * 0.005;
    if (this.policeBeaconLight) {
      const isBlue = Math.sin(timeSec * 8) > 0;
      this.policeBeaconLight.color.setHex(isBlue ? 0x3b82f6 : 0xef4444);
      this.policeBeaconLight.intensity = Math.sin(timeSec * 16) > 0 ? 3.5 : 0.8;
    }

    if (this.hazardBeaconLight) {
      this.hazardBeaconLight.intensity = Math.sin(timeSec * 6) > 0 ? 2.8 : 0.4;
    }

    // Dynamic rotation countdown
    this.bottleneckCycleTimer += dt;
    if (this.bottleneckCycleTimer >= 1.0) {
      this.bottleneckCycleTimer = 0;

      let needUpdate = false;
      this.bottlenecks.forEach(b => {
        if (b.active) {
          b.clearTimeRemainingSec -= 1;
          if (b.clearTimeRemainingSec <= 0) {
            b.active = false;
            b.clearTimeRemainingSec = 75;
            const mesh = this.bottleneckMeshGroups.get(b.id);
            if (mesh) mesh.visible = false;
            needUpdate = true;
          }
        }
      });

      // Ensure at least 1 bottleneck is active
      const anyActive = this.bottlenecks.some(b => b.active);
      if (!anyActive) {
        const inactive = this.bottlenecks.filter(b => !b.active);
        const nextJam = inactive[Math.floor(Math.random() * inactive.length)] || this.bottlenecks[0];
        nextJam.active = true;
        nextJam.clearTimeRemainingSec = 70 + Math.floor(Math.random() * 25);
        this.currentActiveJam = nextJam;

        const mesh = this.bottleneckMeshGroups.get(nextJam.id);
        if (mesh) mesh.visible = true;
        needUpdate = true;
      }

      if (needUpdate) {
        this.callbacks.onBottlenecksUpdate?.([...this.bottlenecks]);
      }
    }

    this.checkPlayerInJam();
  }

  private checkPlayerInJam() {
    const px = this.playerGroup.position.x;
    const py = this.playerGroup.position.y;
    const pz = this.playerGroup.position.z;

    // Elevated Expressway (y > 6.5) bypasses ground jams!
    if (py > 6.5) {
      if (this.playerInJam) {
        this.playerInJam = false;
        this.callbacks.onPlayerInJam?.(false, null);
      }
      return;
    }

    let foundJam: TrafficBottleneck | null = null;
    const isHeavyRain = this.currentWeather.id === 'heavy_rain';
    for (const b of this.bottlenecks) {
      if (!b.active) continue;
      const effectiveRadius = b.radius * (isHeavyRain ? 1.45 : 1.0);
      const dist = Math.hypot(px - b.position.x, pz - b.position.z);
      if (dist < effectiveRadius) {
        foundJam = b;
        break;
      }
    }

    if (foundJam && !this.playerInJam) {
      this.playerInJam = true;
      this.callbacks.onPlayerInJam?.(true, foundJam);
    } else if (!foundJam && this.playerInJam) {
      this.playerInJam = false;
      this.callbacks.onPlayerInJam?.(false, null);
    }
  }

  private checkProximities() {
    const px = this.playerGroup.position.x;
    const pz = this.playerGroup.position.z;

    // 1. Marketplace proximity (within 18m)
    let activeMarket: Marketplace | null = null;
    for (const m of this.markets) {
      const d = Math.hypot(px - m.worldPos.x, pz - m.worldPos.z);
      if (d < 18) {
        activeMarket = m;
        break;
      }
    }
    this.callbacks.onMarketProximity(activeMarket);

    // 2. Street NPC Proximity (within 8m)
    let activeNpc: { name: string; role: string; dialogue: string } | null = null;
    for (const npc of this.streetNpcs) {
      const d = Math.hypot(px - npc.basePos.x, pz - npc.basePos.z);
      if (d < 9) {
        activeNpc = { name: npc.name, role: npc.role, dialogue: npc.dialogue };
        break;
      }
    }
    this.callbacks.onNpcProximity(activeNpc);
  }

  private animate = (timestamp: number) => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const dt = 0.016; // 60fps delta

    this.updateDayNightCycle(dt);
    this.updateWeather(dt);
    this.updatePlayerPhysics(dt);
    this.updateCamera();
    this.updateWildlife(dt);
    this.updateTrafficNetwork(dt);
    this.updateBottlenecks(dt);
    this.checkProximities();

    this.renderer.render(this.scene, this.camera);
  };

  public teleportTo(x: number, z: number) {
    this.playerGroup.position.set(x, 0, z);
    this.playerSpeed = 0;
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onWindowResize);
    soundManager.stopEngine();
    soundManager.stopRain();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
