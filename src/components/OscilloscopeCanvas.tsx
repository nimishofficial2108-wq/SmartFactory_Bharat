import React, { useEffect, useRef, useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { Activity, Sliders, Zap, RefreshCw } from 'lucide-react';

interface OscilloscopeCanvasProps {
  currentRMS?: number;
  isAnomaly?: boolean;
}

export const OscilloscopeCanvas: React.FC<OscilloscopeCanvasProps> = ({
  currentRMS = 42.4,
  isAnomaly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scaleY, setScaleY] = useState<number>(1.2);
  const [distortion, setDistortion] = useState<boolean>(isAnomaly);
  const [channelColor, setChannelColor] = useState<'emerald' | 'amber' | 'cyan'>('emerald');

  const colorHex = {
    emerald: '#10b981',
    amber: '#f59e0b',
    cyan: '#06b6d4',
  }[channelColor];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      // Dark CRT phosphor background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // CRT Graticule Grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1;

      // Vertical grid lines
      const vSpacing = width / 10;
      for (let x = 0; x <= width; x += vSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      const hSpacing = height / 8;
      for (let y = 0; y <= height; y += hSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center crosshairs with tick marks
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Draw Main AC Current Waveform
      ctx.beginPath();
      const centerY = height / 2;
      const amplitude = Math.min(height * 0.38, currentRMS * 1.8 * scaleY);

      for (let x = 0; x < width; x++) {
        const tVal = (x / width) * Math.PI * 8 + time * 1.5;
        // Fundamental 50Hz sine
        let y = Math.sin(tVal) * amplitude;

        // If harmonic distortion or anomaly enabled
        if (distortion) {
          y += Math.sin(tVal * 3 + time) * (amplitude * 0.28); // 3rd harmonic
          y += Math.sin(tVal * 5) * (amplitude * 0.15); // 5th harmonic
          // high frequency noise jitter
          y += (Math.random() - 0.5) * 3;
        }

        const plotY = centerY - y;
        if (x === 0) {
          ctx.moveTo(x, plotY);
        } else {
          ctx.lineTo(x, plotY);
        }
      }

      // Outer glow
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = colorHex;
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Inner core beam
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const tVal = (x / width) * Math.PI * 8 + time * 1.5;
        let y = Math.sin(tVal) * amplitude;
        if (distortion) {
          y += Math.sin(tVal * 3 + time) * (amplitude * 0.28);
          y += Math.sin(tVal * 5) * (amplitude * 0.15);
        }
        const plotY = centerY - y;
        if (x === 0) ctx.moveTo(x, plotY);
        else ctx.lineTo(x, plotY);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Sweeping phosphor scan line
      const sweepX = (time * 120) % width;
      const sweepGrad = ctx.createLinearGradient(sweepX - 25, 0, sweepX, 0);
      sweepGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      sweepGrad.addColorStop(1, 'rgba(16, 185, 129, 0.25)');
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(sweepX - 25, 0, 25, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, height);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [currentRMS, scaleY, distortion, colorHex]);

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-2xl relative overflow-hidden">
      {/* Top Banner & Monospace Readouts */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            CH-1 CT Current Waveform (50 Hz AC)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            4.8 kSPS
          </span>
        </div>

        {/* Oscilloscope Monospace Numerals */}
        <div className="flex items-center gap-4 text-xs font-mono-num">
          <div>
            <span className="text-slate-500 text-[10px] block">RMS CURRENT</span>
            <span className="text-emerald-400 font-bold">{currentRMS.toFixed(1)} A</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">PEAK CURRENT</span>
            <span className="text-white font-bold">{(currentRMS * 1.414).toFixed(1)} A</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">FREQUENCY</span>
            <span className="text-amber-300 font-bold">50.02 Hz</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">THD (DISTORTION)</span>
            <span className={`font-bold ${distortion ? 'text-amber-400' : 'text-slate-300'}`}>
              {distortion ? '14.8%' : '2.1%'}
            </span>
          </div>
        </div>
      </div>

      {/* CRT Canvas Screen */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 oscilloscope-screen">
        <canvas
          ref={canvasRef}
          width={800}
          height={260}
          className="w-full h-56 block"
        />

        {/* Phosphor Corner Watermark */}
        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-emerald-500/60 pointer-events-none">
          DIV: 10A/div · 5ms/div · RETROFIT NON-INVASIVE CT
        </div>
      </div>

      {/* Control Strip */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDistortion(!distortion)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              distortion
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {distortion ? '⚠️ Harmonic Anomaly Active' : 'Pure Fundamental Sine'}
          </button>

          <button
            onClick={() => setScaleY((s) => (s >= 1.8 ? 0.8 : +(s + 0.4).toFixed(1)))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-mono-num"
          >
            Scale: {scaleY}x
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">Beam Phosphor:</span>
          <div className="flex items-center gap-1">
            {(['emerald', 'amber', 'cyan'] as const).map((col) => (
              <button
                key={col}
                onClick={() => setChannelColor(col)}
                className={`w-4 h-4 rounded-full border ${
                  channelColor === col ? 'ring-2 ring-white scale-110' : 'opacity-60'
                } ${
                  col === 'emerald'
                    ? 'bg-emerald-500 border-emerald-400'
                    : col === 'amber'
                    ? 'bg-amber-500 border-amber-400'
                    : 'bg-cyan-500 border-cyan-400'
                }`}
                title={`Select ${col} beam`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
