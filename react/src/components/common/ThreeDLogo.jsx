import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';

function LogoModel() {
  const { scene } = useGLTF('/images/textured.glb');
  return <primitive object={scene} scale={1.2} />;
}

export default function ThreeDLogo({ width = 80, height = 80 }) {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <hemisphereLight intensity={1} groundColor="white" />
        <Suspense fallback={null}>
          <LogoModel />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}

// Required for GLTF loading
useGLTF.preload('/images/textured.glb'); 