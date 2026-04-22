import React, { useRef, useEffect } from 'react';

interface AsciiCanvasProps {
  imageUrl: string;
}

export default function AsciiCanvas({ imageUrl }: AsciiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    let particleGrid: (Particle | null)[] = [];
    let cols = 0;
    let rows = 0;
    
    let mouseX = -1000;
    let mouseY = -1000;
    // Trail of mouse events to create shrinking radius circles
    let mouseTrail: { x: number, y: number, time: number }[] = [];
    
    let animationFrameId: number;
    const gridSize = 6;
    const maxRadius = 60; // Max radius of interaction
    const trailLifespan = 1000; // Exact 1 second lifetime for radius collapse

    // ASCII characters sorted by density (dark to light)
    const asciiChars = ['@', '#', 'B', '%', '8', '&', 'W', 'M', '*', 'o', 'a', 'h', 'k', 'b', 'd', 'p', 'q', 'w', 'm', 'Z', 'O', '0', 'Q', 'L', 'C', 'J', 'U', 'Y', 'X', 'z', 'c', 'v', 'u', 'n', 'x', 'r', 'j', 'f', 't', '/', '\\', '|', '(', ')', '1', '{', '}', '[', ']', '?', '-', '_', '+', '~', '<', '>', 'i', '!', 'l', 'I', ';', ':', ',', '"', '^', '`', '\'', '.'];

    class Particle {
      x: number;
      y: number;
      color = { r: 210, g: 210, b: 210, a: 1 };
      targetColor = { r: 210, g: 210, b: 210 };
      baseCharIndex: number;
      char: string;
      phase: number;
      speed: number;
      isHovered: boolean = false;

      constructor(x: number, y: number, brightness: number) {
        this.x = x;
        this.y = y;
        
        // Map brightness (0 to 1) to ASCII character
        this.baseCharIndex = Math.floor(brightness * (asciiChars.length - 1));
        this.char = asciiChars[this.baseCharIndex] || '.';
        
        // Randomizations for breathing / flickering dynamic effect
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.001 + Math.random() * 0.0015;
      }

      update(currentTime: number) {
        // Color state strictly based on hovering radius (creates sharp shrinking edge)
        if (this.isHovered) {
          // Instantly set to #3C8AFF inside interaction radius
          this.color.r = 60;
          this.color.g = 138;
          this.color.b = 255;
        } else {
          // Instantly revert to base gray when outside the shrinking boundary (no color fade)
          this.color.r = this.targetColor.r;
          this.color.g = this.targetColor.g;
          this.color.b = this.targetColor.b;
        }

        // 1. Dynamic Breathing Effect (Opacity pulsing seamlessly)
        const breathe = Math.sin(currentTime * this.speed + this.phase);
        // Map sine -1..1 to alpha 0.25..1.0
        this.color.a = 0.25 + 0.75 * ((breathe + 1) / 2);

        // 2. Dynamic Flickering Effect (Morph characters randomly by density)
        // Adds a slight glitchy twinkle shifting between similar characters
        const charOffset = Math.round(breathe * 2); // fluctuates -2, -1, 0, 1, 2
        let currentIndex = this.baseCharIndex + charOffset;
        
        // Clamp array bounds safely
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex >= asciiChars.length) currentIndex = asciiChars.length - 1;
        this.char = asciiChars[currentIndex];

        // Reset hovered flag for next frame's spatial mapping
        this.isHovered = false;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(${Math.floor(this.color.r)}, ${Math.floor(this.color.g)}, ${Math.floor(this.color.b)}, ${this.color.a})`;
        ctx.fillText(this.char, this.x, this.y);
      }
    }

    const init = () => {
      particles = [];
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        cols = Math.ceil(canvas.width / gridSize);
        rows = Math.ceil(canvas.height / gridSize);
        particleGrid = new Array(cols * rows).fill(null);

        tempCanvas.width = cols;
        tempCanvas.height = rows;

        const imgAspect = img.width / img.height;
        const canvasAspect = tempCanvas.width / tempCanvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        // "Contain" scaling algorithm to keep image visible
        if (imgAspect > canvasAspect) {
          drawWidth = tempCanvas.width;
          drawHeight = tempCanvas.width / imgAspect;
        } else {
          drawHeight = tempCanvas.height;
          drawWidth = tempCanvas.height * imgAspect;
        }

        // Apply a 20% scale increment as requested
        drawWidth *= 1.2;
        drawHeight *= 1.2;
        
        offsetX = (tempCanvas.width - drawWidth) / 2;
        offsetY = (tempCanvas.height - drawHeight) / 2;

        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

        for (let y = 0; y < tempCanvas.height; y++) {
          for (let x = 0; x < tempCanvas.width; x++) {
            const i = (y * tempCanvas.width + x) * 4;
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            
            // Perceived luminance formula
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            // Create particle if the pixel is dark enough (ignore pure white)
            if (brightness < 0.95) {
              const p = new Particle(x * gridSize, y * gridSize, brightness);
              particles.push(p);
              
              // Place into 1D spatial grid for fast collision queries later
              if (x >= 0 && x < cols && y >= 0 && y < rows) {
                particleGrid[y * cols + x] = p;
              }
            }
          }
        }
      };
    };

    // Initial setup
    init();

    // Resize handling with debounce
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 200);
    };
    window.addEventListener('resize', handleResize);
    
    // Track mouse reliably via window globally
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      // Mouse trails collapse on their own, we just let them die gracefully
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const animate = (currentTime: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      // 1. Maintain mouse interaction trail
      if (mouseX !== -1000 && mouseY !== -1000) {
         mouseTrail.push({ x: mouseX, y: mouseY, time: currentTime });
      }

      // Cleanup expired circles that have shrank to 0
      mouseTrail = mouseTrail.filter(t => currentTime - t.time < trailLifespan);

      // 2. Optimized Spatial Particle Tracking (O(Circles * Area) instead of O(Circles * All_Particles))
      for (const t of mouseTrail) {
        // Calculate shrinking radius explicitly dying over exactly 2 seconds
        const ageRatio = (currentTime - t.time) / trailLifespan;
        const radius = maxRadius * (1 - ageRatio);
        
        if (radius <= 0) continue;

        // Grid boundaries for tight loop
        const minX = Math.max(0, Math.floor((t.x - radius) / gridSize));
        const maxX = Math.min(cols - 1, Math.ceil((t.x + radius) / gridSize));
        const minY = Math.max(0, Math.floor((t.y - radius) / gridSize));
        const maxY = Math.min(rows - 1, Math.ceil((t.y + radius) / gridSize));

        // Mark only particles within the current footprint as hovered
        for (let gy = minY; gy <= maxY; gy++) {
          for (let gx = minX; gx <= maxX; gx++) {
            const p = particleGrid[gy * cols + gx];
            if (p) {
              const dx = p.x - t.x;
              const dy = p.y - t.y;
              if (dx * dx + dy * dy < radius * radius) {
                p.isHovered = true;
              }
            }
          }
        }
      }

      // 3. Global update & emit draw events
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(currentTime);
        p.draw();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 block pointer-events-none"
    />
  );
}
