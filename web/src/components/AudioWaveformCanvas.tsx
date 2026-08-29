import React, { useEffect, useRef } from 'react';

interface Props {
  frequencyData: Uint8Array;
  isActive: boolean;
  state: 'ready' | 'listening' | 'processing' | 'translating' | 'speaking';
  height?: number;
}

export function AudioWaveformCanvas({
  frequencyData,
  isActive,
  state,
  height = 180,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{ x: number; y: number; size: number; speedY: number; opacity: number }> = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2.5 + 1,
        speedY: (Math.random() * 0.4 + 0.1) * 0.005,
        opacity: Math.random() * 0.7 + 0.2,
      });
    }

    const render = () => {
      // Resize canvas display width/height dynamically
      const width = canvas.offsetWidth;
      const canvasHeight = canvas.offsetHeight;
      if (canvas.width !== width || canvas.height !== canvasHeight) {
        canvas.width = width;
        canvas.height = canvasHeight;
      }

      ctx.clearRect(0, 0, width, canvasHeight);
      phaseRef.current += isActive ? 0.08 : 0.02;

      // Calculate average volume from mic frequency data
      let avgVolume = 0;
      if (frequencyData && frequencyData.length > 0) {
        let sum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          sum += frequencyData[i];
        }
        avgVolume = sum / frequencyData.length;
      }

      const centerY = canvasHeight / 2;
      const baseAmp = isActive ? Math.max(14, avgVolume * 0.85) : 8;

      // Layer 3: Floating frequency energy particles
      particles.forEach((p) => {
        p.y -= p.speedY * (isActive ? 2.5 : 1);
        if (p.y < 0) p.y = 1;

        const px = p.x * width;
        const py = p.y * canvasHeight;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        if (state === 'listening') {
          ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity * (isActive ? 0.9 : 0.4)})`;
        } else if (state === 'speaking') {
          ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity * 0.8})`;
        } else if (state === 'processing') {
          ctx.fillStyle = `rgba(124, 58, 237, ${p.opacity * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(12, 126, 255, ${p.opacity * 0.4})`;
        }
        ctx.fill();
      });

      // Layer 2: Ambient Soft Glow Wave
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      const points = 60;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const normX = (i / points) * Math.PI * 4;
        const envelope = Math.sin((i / points) * Math.PI); // Windowing curve: 0 at edges, 1 at center
        const sineWave = Math.sin(normX + phaseRef.current * 0.5) * Math.cos(normX * 0.5 - phaseRef.current * 0.3);
        const y = centerY + sineWave * (baseAmp * 0.55) * envelope;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = state === 'listening' ? 'rgba(245, 158, 11, 0.25)' : state === 'speaking' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(12, 126, 255, 0.2)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.filter = 'blur(6px)';
      ctx.stroke();
      ctx.restore();

      // Layer 1: Main High-Precision Reactive Waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const normX = (i / points) * Math.PI * 6;
        const envelope = Math.sin((i / points) * Math.PI); // Bell curve

        // Sample frequency data index
        const freqIndex = Math.floor((i / points) * (frequencyData.length || 64));
        const freqVal = frequencyData[freqIndex] ? (frequencyData[freqIndex] / 255) : 0.15;

        let dynamicWave = Math.sin(normX + phaseRef.current) * Math.sin(normX * 1.5 - phaseRef.current * 1.2);
        if (state === 'processing') {
          dynamicWave = Math.sin(normX * 2 + phaseRef.current * 2) * Math.cos(normX - phaseRef.current);
        }

        const y = centerY + dynamicWave * (baseAmp * (1 + freqVal * 1.5)) * envelope;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Dynamic Gradient based on Voice State
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      if (state === 'listening') {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.1)');
        grad.addColorStop(0.25, '#D97706');
        grad.addColorStop(0.5, '#F59E0B');
        grad.addColorStop(0.75, '#EA580C');
        grad.addColorStop(1, 'rgba(234, 88, 12, 0.1)');
      } else if (state === 'speaking') {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
        grad.addColorStop(0.3, '#059669');
        grad.addColorStop(0.5, '#10B981');
        grad.addColorStop(0.7, '#34D399');
        grad.addColorStop(1, 'rgba(52, 211, 153, 0.1)');
      } else if (state === 'processing' || state === 'translating') {
        grad.addColorStop(0, 'rgba(124, 58, 237, 0.1)');
        grad.addColorStop(0.3, '#6D28D9');
        grad.addColorStop(0.5, '#7C3AED');
        grad.addColorStop(0.7, '#A78BFA');
        grad.addColorStop(1, 'rgba(167, 139, 250, 0.1)');
      } else {
        grad.addColorStop(0, 'rgba(12, 126, 255, 0.1)');
        grad.addColorStop(0.3, '#005FD6');
        grad.addColorStop(0.5, '#0C7EFF');
        grad.addColorStop(0.7, '#38A0FF');
        grad.addColorStop(1, 'rgba(56, 160, 255, 0.1)');
      }

      ctx.strokeStyle = grad;
      ctx.lineWidth = isActive ? 3.5 : 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Mirror reflection bottom glow
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const normX = (i / points) * Math.PI * 6;
        const envelope = Math.sin((i / points) * Math.PI);
        const freqIndex = Math.floor((i / points) * (frequencyData.length || 64));
        const freqVal = frequencyData[freqIndex] ? (frequencyData[freqIndex] / 255) : 0.15;
        const dynamicWave = -Math.sin(normX + phaseRef.current) * Math.sin(normX * 1.5 - phaseRef.current * 1.2);
        const y = centerY + dynamicWave * (baseAmp * (1 + freqVal * 1.5)) * envelope;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [frequencyData, isActive, state]);

  return (
    <div className="w-full relative overflow-hidden flex items-center justify-center" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Center Voice Amplitude Ring Indicator */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className={`w-28 h-28 rounded-full border transition-all duration-300 ${
            state === 'listening'
              ? 'border-saffron-500/30 scale-110 animate-pulse-slow'
              : state === 'speaking'
              ? 'border-emerald-500/30 scale-110 animate-pulse-slow'
              : 'border-brand-500/10 scale-95'
          }`}
        />
      </div>
    </div>
  );
}
