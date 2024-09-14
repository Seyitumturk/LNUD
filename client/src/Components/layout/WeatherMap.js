import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const WeatherMap = () => {
    return (
        <div style={{ height: '400px', width: '100%' }}> {/* Set the height and width as needed */}
            <Canvas camera={{ position: [0, 0, 6] }}>
                {/* Add Stars for Background */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

                {/* Add a Sphere to represent Earth */}
                <Sphere visible args={[1, 100, 200]} scale={2}>
                    <MeshDistortMaterial
                        color="#00aaff"
                        attach="material"
                        distort={0.3}
                        speed={2}
                    />
                </Sphere>

                {/* Controls to rotate and zoom the globe */}
                <OrbitControls enableZoom={true} />
            </Canvas>
        </div>
    );
};

export default WeatherMap;
