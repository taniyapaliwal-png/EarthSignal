
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF, useTexture } from '@react-three/drei';

const R = 1.65;
const SUN = new THREE.Vector3(5, 2.5, 5).normalize();

// EARTH: NASA DAY MAP + NASA NIGHT LIGHTS
function Earth() {
  const [day, night, clouds] = useTexture([
    '/textures/earth-day.jpg',
    '/textures/earth-night.jpg',
    '/textures/clouds.png',
  ]);

  [day, night, clouds].forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  const planet = useRef<THREE.Group>(null!);
  const cloudLayer = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    planet.current.rotation.y += delta * 0.018;
    cloudLayer.current.rotation.y += delta * 0.003;
  });

  return (
    <group rotation={[0, 0, -0.25]}>
      <group ref={planet}>
        <mesh>
          <sphereGeometry args={[R, 192, 192]} />
          <shaderMaterial
            uniforms={{
              uDay: { value: day },
              uNight: { value: night },
              uSun: { value: SUN },
            }}
            vertexShader={`
              varying vec2 vUv;
              varying vec3 vNormalWorld;

              void main() {
                vUv = uv;
                vNormalWorld = normalize(
                  mat3(modelMatrix) * normal
                );

                gl_Position = projectionMatrix *
                  modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform vec3 uSun;

varying vec2 vUv;
varying vec3 vNormalWorld;

float nightBrightness(vec2 uv) {
  vec3 colour = texture2D(uNight, uv).rgb;
  return max(colour.r, max(colour.g, colour.b));
}

void main() {
  vec3 normal = normalize(vNormalWorld);
  float sunlight = dot(normal, normalize(uSun));

  // Natural transition between day and night
  float daylight = smoothstep(-0.10, 0.12, sunlight);

  vec3 surface = texture2D(uDay, vUv).rgb;

  // Sample the actual NASA night-light map
  float centre = nightBrightness(vUv);

  // Nearby samples create a subtle light-spread effect
  vec2 px = vec2(1.0 / 3600.0, 1.0 / 1800.0);

  float surrounding = (
    nightBrightness(vUv + px * vec2(3.0, 0.0)) +
    nightBrightness(vUv - px * vec2(3.0, 0.0)) +
    nightBrightness(vUv + px * vec2(0.0, 3.0)) +
    nightBrightness(vUv - px * vec2(0.0, 3.0)) +
    nightBrightness(vUv + px * vec2(3.0, 3.0)) +
    nightBrightness(vUv - px * vec2(3.0, 3.0)) +
    nightBrightness(vUv + px * vec2(3.0, -3.0)) +
    nightBrightness(vUv - px * vec2(3.0, -3.0))
  ) / 8.0;

  // Bright city centres and softer surrounding glow
  float cityCore = smoothstep(0.001, 0.025, centre);
  float cityHalo = smoothstep(0.001, 0.012, surrounding);

  float lightIntensity =
    pow(cityCore, 0.7) * 3.8 +
    pow(cityHalo, 0.8) * 1.8;

  vec3 warmLights =
    vec3(1.0, 0.62, 0.30) * lightIntensity;

  // Dark hemisphere with visible populated regions
  vec3 nightSide = surface * 0.035 + warmLights;

  // Slightly brighter natural daylight
  vec3 daySide = surface *
    (0.30 + 0.95 * max(sunlight, 0.0));

  vec3 finalColour = mix(
    nightSide,
    daySide,
    daylight
  );

  gl_FragColor = vec4(finalColour, 1.0);
}

            `}
          />
        </mesh>

        {/* Clouds move independently over the surface */}
        <mesh ref={cloudLayer} scale={1.008}>
          <sphereGeometry args={[R, 160, 160]} />
          <meshStandardMaterial
            map={clouds}
            transparent
            opacity={0.22}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// REAL SPACECRAFT MODEL
function Hubble() {
  const { scene } = useGLTF('/models/hubble.glb');

  const model = useMemo(() => {
    const copy = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(copy);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z);

    copy.scale.setScalar(0.36 / largest);
    copy.position.copy(center).multiplyScalar(-0.36 / largest);

    copy.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    return copy;
  }, [scene]);

  return <primitive object={model} />;
}

useGLTF.preload('/models/hubble.glb');

// ONE SPACECRAFT IN ORBIT
function SatelliteOrbit() {
  const orbit = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    orbit.current.rotation.y += delta * 0.045;
  });

  return (
    <group rotation={[0.48, 0, 0]} ref={orbit}>
      <group
        position={[2.02, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <Hubble />
      </group>
    </group>
  );
}

// COMPLETE SPACE ENVIRONMENT
function Scene() {
  return (
    <>
      <color attach="background" args={['#020509']} />

      <ambientLight intensity={0.12} />

      <directionalLight
        position={[5, 2.5, 5]}
        intensity={2.2}
        color="#fff2df"
      />

      <Stars
        radius={100}
        depth={60}
        count={2200}
        factor={1.8}
        saturation={0}
        fade
        speed={0.1}
      />

      <Suspense fallback={null}>
        <Earth />
        <SatelliteOrbit />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.35}
      />
    </>
  );
}

export default function EarthScene() {
  return (
    <div className="earth-scene">
      <Canvas
        camera={{
          position: [0, 0, 5.6],
          fov: 38,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
