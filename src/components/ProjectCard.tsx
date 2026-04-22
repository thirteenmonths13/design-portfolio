import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import AdvancedColoredArt from './AdvancedColoredArt';

interface Project {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
}

interface Props {
  project: Project;
  index: number;
  key?: React.Key;
}

export default function ProjectCard({ project, index }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // High performance motion values instead of React state for 60fps tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs to add organic "weight" to the 3D tilt
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  // Increased rotation bounds from 10 to 20 degrees for a more pronounced 3D effect
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize mouse position from -0.5 to +0.5 relative to center
    mouseX.set((x - rect.width / 2) / rect.width);
    mouseY.set((y - rect.height / 2) / rect.height);
  };

  const handleMouseLeave = () => {
    // Elegant snap back to resting position
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
      className="card group aspect-square flex flex-col justify-end p-8 cursor-pointer overflow-hidden relative rounded-xl bg-[#F5F5F5] transition-shadow duration-500 shadow-sm hover:shadow-2xl"
      style={{ perspective: '1000px' }}
    >
      {/* 
        Inner Object (Canvas Array Container): 
        Reacts to Framer Motion values for silky smooth 60fps 3D rotation, completely decoupled from DOM state updates
      */}
      <motion.div 
        className="particle-container absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ 
          rotateX, 
          rotateY, 
          scale: 1.08, // Slightly more zoomed to hide edges during deep rotation
          transformStyle: 'preserve-3d' 
        }}
      >
        {/* Pushed further back/forward in Z space for dramatic depth */}
        <div style={{ transform: 'translateZ(40px)' }} className="w-full h-full">
           <AdvancedColoredArt imageUrl={project.imageUrl} />
        </div>
      </motion.div>

      {/* Text overlays - Pushed significantly forward in 3D space to pop out */}
      <div className="z-10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none relative" style={{ transform: 'translateZ(80px)' }}>
        <div>
          <h2 className="text-lg font-medium tracking-wide text-black bg-white/70 backdrop-blur-sm inline-block px-2 py-1 rounded">{project.title}</h2>
        </div>
        <div className="mt-1">
          <p className="text-xs uppercase tracking-wider text-gray-800 bg-white/70 backdrop-blur-sm inline-block px-2 py-1 rounded">{project.category}</p>
        </div>
      </div>
    </motion.div>
  );
}
