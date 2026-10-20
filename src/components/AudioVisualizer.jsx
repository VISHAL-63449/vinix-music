import React, { useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';

export const AudioVisualizer = ({ height = 160, barCount = 36 }) => {
  const canvasRef = useRef(null);
  const { analyser, isPlaying, ambientColor } = useMusic();
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / barCount) - 3;
        let x = 2;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
          const val = dataArray[dataIndex] || 0;
          const barHeight = Math.max(4, (val / 255) * (h - 10));

          // Gradient color for visualizer bars
          const gradient = ctx.createLinearGradient(0, h, 0, h - barHeight);
          gradient.addColorStop(0, '#1ed760');
          gradient.addColorStop(0.7, ambientColor || '#00E5FF');
          gradient.addColorStop(1, '#ffffff');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, h - barHeight, Math.max(barWidth, 3), barHeight, [3, 3, 0, 0]);
          ctx.fill();

          x += barWidth + 3;
        }
      } else {
        // Idle gentle wave animation
        const barWidth = (width / barCount) - 3;
        let x = 2;
        const time = Date.now() * 0.003;

        for (let i = 0; i < barCount; i++) {
          const sinHeight = (Math.sin(time + i * 0.3) * 0.5 + 0.5) * (isPlaying ? 35 : 12) + 4;
          ctx.fillStyle = isPlaying ? '#1ed760' : 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.roundRect(x, h - sinHeight, Math.max(barWidth, 3), sinHeight, [2, 2, 0, 0]);
          ctx.fill();
          x += barWidth + 3;
        }
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isPlaying, ambientColor, barCount]);

  return (
    <div className="visualizer-container" style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="visualizer-canvas"
      />
    </div>
  );
};
