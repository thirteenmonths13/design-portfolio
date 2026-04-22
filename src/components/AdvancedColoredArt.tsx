import React, { useRef, useEffect } from 'react';

interface Props {
  imageUrl: string;
}

export default function AdvancedColoredArt({ imageUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: ParticleLine[] = [];

    class ParticleLine {
      x: number;
      y: number;
      r: number;
      g: number;
      b: number;
      phaseScale: number;
      phaseY: number;
      speed: number;
      baseHeight: number;

      constructor(x: number, y: number, r: number, g: number, b: number) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
        
        // Phase for stretching/shrinking length
        this.phaseScale = Math.random() * Math.PI * 2;
        // Phase for vertical shifting (Tied partly to X coordinate so columns move harmoniously)
        this.phaseY = (x * 0.05) + Math.random() * 1.0; 
        // Slow and elegant animation speed
        this.speed = 0.0008 + Math.random() * 0.001; 
        
        this.baseHeight = 6;
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        // 1. Vertical shifting (moves up and down within +/- 3px)
        // Keeps the macro color regions and silhouettes visually intact
        const shiftY = Math.sin(time * this.speed * 1.5 + this.phaseY) * 3;
        
        // 2. Length variation (shrinks and grows organically replacing harsh flickers)
        const waveScale = Math.sin(time * this.speed + this.phaseScale);
        // Heights scale between 0.5x and 1.3x
        const scaleY = 0.9 + 0.4 * waveScale; 
        const currentHeight = this.baseHeight * scaleY;

        // 3. Smooth Opacity breathing
        const currentA = 0.4 + 0.6 * ((waveScale + 1) / 2);

        ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${currentA})`;
        // Apply vertical shift and scaling
        ctx.fillRect(this.x, this.y + shiftY - (currentHeight / 2), 1.5, currentHeight);
      }
    }

    const renderAdvancedColoredArt = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        const shrinkFactor = 0.6;
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        let drawW, drawH, offX, offY;

        if (imgAspect > canvasAspect) {
          drawW = canvas.width * shrinkFactor;
          drawH = drawW / imgAspect;
        } else {
          drawH = canvas.height * shrinkFactor;
          drawW = drawH * imgAspect;
        }
        // Offset perfectly centered
        offX = (canvas.width - drawW) / 2;
        offY = (canvas.height - drawH) / 2 - 20; 

        tempCtx.drawImage(img, offX, offY, drawW, drawH);
        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

        particles = [];
        const stepX = 4;
        const stepY = 8;

        for (let y = 0; y < tempCanvas.height; y += stepY) {
          for (let x = 0; x < tempCanvas.width; x += stepX) {
            const i = (y * tempCanvas.width + x) * 4;
            const a = imgData[i + 3];

            if (a < 50) continue;

            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];

            const lum = (0.299 * r + 0.587 * g + 0.114 * b);
            if (lum > 240) continue;

            particles.push(new ParticleLine(x, y, r, g, b));
          }
        }
      };
    };

    renderAdvancedColoredArt();

    let isVisible = true;
    const parent = canvas.parentElement;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0 });
    
    if (parent) {
      observer.observe(parent);
    }

    const animate = (time: number) => {
      if (isVisible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].draw(ctx, time);
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(renderAdvancedColoredArt, 300);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (parent) observer.unobserve(parent);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageUrl]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
