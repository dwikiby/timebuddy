// src/components/water-background.tsx
"use client";

import { useEffect, useState } from "react";

interface WaterBackgroundProps {
  isRunning: boolean;
  progress: number; // 0 to 100
}

export function WaterBackground({ isRunning, progress }: WaterBackgroundProps) {
  // Array of wave configurations
  const waves = [
    { duration: "3s", opacity: 0.5, delay: "0s" },
    { duration: "4s", opacity: 0.3, delay: "0.5s" },
    { duration: "5s", opacity: 0.4, delay: "1s" },
    { duration: "3.5s", opacity: 0.6, delay: "0.2s" },
    { duration: "4.5s", opacity: 0.2, delay: "0.7s" },
    { duration: "6s", opacity: 0.3, delay: "1.5s" },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute bottom-0 left-0 right-0 bg-blue-500/30 transition-all duration-1000 ease-linear backdrop-blur-sm"
        style={{
          height: `${progress}%`,
          transform: isRunning ? "scale(1.02)" : "scale(1)",
          transition: "height 1s linear, transform 2s ease-in-out",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-8">
          {" "}
          {/* Increased height for waves */}
          <div className="relative w-full h-full">
            {/* Forward waves */}
            {waves.map((wave, index) => (
              <div
                key={`wave-${index}`}
                className="absolute w-full h-full animate-wave"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.2) 100%)",
                  animation: `wave ${wave.duration} ease-in-out infinite`,
                  opacity: wave.opacity,
                  animationDelay: wave.delay,
                }}
              />
            ))}

            {/* Reverse waves */}
            {waves.map((wave, index) => (
              <div
                key={`wave-reverse-${index}`}
                className="absolute w-full h-full animate-wave-reverse"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.2) 100%)",
                  animation: `wave-reverse ${wave.duration} ease-in-out infinite`,
                  opacity: wave.opacity * 0.8, // Slightly less opacity for reverse waves
                  animationDelay: wave.delay,
                }}
              />
            ))}
          </div>
        </div>

        {/* Additional subtle waves in the middle of the water */}
        {progress > 20 && (
          <div className="absolute top-1/2 left-0 right-0 h-8 transform -translate-y-1/2">
            <div className="relative w-full h-full">
              {waves.slice(0, 3).map((wave, index) => (
                <div
                  key={`middle-wave-${index}`}
                  className="absolute w-full h-full animate-wave"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 100%)",
                    animation: `wave ${wave.duration} ease-in-out infinite`,
                    opacity: wave.opacity * 0.5,
                    animationDelay: wave.delay,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
