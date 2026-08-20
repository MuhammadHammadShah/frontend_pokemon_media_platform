import React, { useState } from 'react';
import { soundFX } from '../utils/audio';

export default function RealisticPokeball({
  size = 90,
  variant = 'pokeball',
  interactive = true,
  onClick
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const getTopGradient = () => {
    switch (variant) {
      case 'greatball':
        return 'radial-gradient(circle at 35% 25%, #60a5fa 0%, #2563eb 50%, #1e3a8a 90%)';
      case 'ultraball':
        return 'radial-gradient(circle at 35% 25%, #475569 0%, #1e293b 50%, #090d16 90%)';
      case 'masterball':
        return 'radial-gradient(circle at 35% 25%, #c084fc 0%, #9333ea 50%, #581c87 90%)';
      default: // Classic Pokéball
        return 'radial-gradient(circle at 35% 25%, #ff4b4b 0%, #ef4444 45%, #991b1b 90%)';
    }
  };

  const handleClick = (e) => {
    if (interactive) {
      soundFX.playCatch();
      setIsOpening(true);
      setTimeout(() => setIsOpening(false), 600);
    }
    if (onClick) onClick(e);
  };

  const centerSize = size * 0.28;
  const buttonCoreSize = size * 0.16;

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => { if (interactive) { setIsHovered(true); soundFX.playClick(); } }}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        perspective: '600px',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      className={`pokeball-3d ${isHovered ? 'pokeball-hovered' : ''} ${isOpening ? 'pokeball-opening' : ''}`}
    >
      {/* 3D Sphere Outer Body */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `
            inset -8px -8px 24px rgba(0, 0, 0, 0.85),
            inset 6px 6px 18px rgba(255, 255, 255, 0.45),
            0 12px 28px rgba(0, 0, 0, 0.7),
            0 0 ${isHovered ? '35px rgba(239, 68, 68, 0.7)' : '18px rgba(239, 68, 68, 0.35)'}
          `,
          transition: 'box-shadow 0.3s ease'
        }}
      >
        {/* Top Half Shell (Metallic Color) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: getTopGradient(),
            borderBottom: `${Math.max(2, size * 0.04)}px solid #0f172a`
          }}
        >
          {/* Glossy Specular Light Reflection (Top Left Highlight) */}
          <div
            style={{
              position: 'absolute',
              top: '8%',
              left: '14%',
              width: '45%',
              height: '35%',
              borderRadius: '50% 50% 40% 40%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.05) 100%)',
              filter: 'blur(1px)',
              transform: 'rotate(-25deg)',
              pointerEvents: 'none'
            }}
          />

          {/* Master Ball / Ultra Ball Accents if applicable */}
          {variant === 'ultraball' && (
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              width: '70%',
              height: '40%',
              border: '3px solid #eab308',
              borderRadius: '50%',
              borderBottom: 'none'
            }} />
          )}
        </div>

        {/* Bottom Half Shell (Pearl Ceramic White) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: 'radial-gradient(circle at 35% 75%, #ffffff 0%, #e2e8f0 45%, #94a3b8 90%)',
            borderTop: `${Math.max(2, size * 0.04)}px solid #0f172a`
          }}
        >
          {/* Subtle Bottom Ambient Bounce Reflection */}
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '25%',
              width: '50%',
              height: '25%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 80%)',
              filter: 'blur(2px)',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Recessed Titanium Groove / Center Divider Line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: `${Math.max(4, size * 0.09)}px`,
            backgroundColor: '#090d16',
            transform: 'translateY(-50%)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.9), 0 1px 2px rgba(255,255,255,0.1)'
          }}
        />
      </div>

      {/* Center 3D Metallic Release Button Assembly */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${centerSize}px`,
          height: `${centerSize}px`,
          borderRadius: '50%',
          background: 'conic-gradient(#94a3b8, #f8fafc, #475569, #f8fafc, #94a3b8)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3
        }}
      >
        {/* Recessed Inner Ring */}
        <div
          style={{
            width: `${centerSize * 0.8}px`,
            height: `${centerSize * 0.8}px`,
            borderRadius: '50%',
            backgroundColor: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.9)'
          }}
        >
          {/* Luminous Pushable Core Button */}
          <div
            style={{
              width: `${buttonCoreSize}px`,
              height: `${buttonCoreSize}px`,
              borderRadius: '50%',
              background: isHovered
                ? 'radial-gradient(circle at 35% 35%, #ffffff 0%, #38bdf8 60%, #0284c7 100%)'
                : 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e2e8f0 70%, #cbd5e1 100%)',
              boxShadow: isHovered
                ? '0 0 12px #38bdf8, inset 0 1px 2px rgba(255,255,255,0.9)'
                : '0 2px 5px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255,255,255,0.8)',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}
