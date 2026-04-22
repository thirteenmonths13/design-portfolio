import React from 'react';
import { motion } from 'motion/react';
import AsciiCanvas from './components/AsciiCanvas';
import ProjectCard from './components/ProjectCard';

export default function App() {
  // 6 selected projects mapping directly to 6 asset URLs
  const projects = [
    { id: 1, title: 'Suitcase', category: 'Photography', imageUrl: 'https://cdn.jsdelivr.net/gh/thirteenmonths13/Portfolio-assets@main/suitcase2.png' },
    { id: 2, title: 'Bonsai Tree', category: 'Web Design', imageUrl: 'https://cdn.jsdelivr.net/gh/thirteenmonths13/Portfolio-assets@main/tree3.png' },
    { id: 3, title: 'Xbox Controller', category: 'Interactive', imageUrl: 'https://cdn.jsdelivr.net/gh/thirteenmonths13/Portfolio-assets@main/Xbox3.png' },
    { id: 4, title: 'Miao Embroidery', category: 'Brand Identity', imageUrl: 'https://cdn.jsdelivr.net/gh/thirteenmonths13/Portfolio-assets@main/embroidery5.png' },
    { id: 5, title: 'Dragonfly', category: 'Digital Art', imageUrl: 'https://cdn.jsdelivr.net/gh/thirteenmonths13/Portfolio-assets@main/dragonfly3.png' },
    { id: 6, title: 'Frida Kahlo', category: 'Illustration', imageUrl: 'https://cdn.jsdelivr.net/gh/thirteenmonths13/Portfolio-assets@main/frida1.png' },
  ];

  return (
    <div className="w-full bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-md bg-white/70">
        <div className="font-bold text-lg tracking-wide uppercase">TANG WENJIE</div>
        <div className="flex gap-6 md:gap-8 text-sm font-medium">
          <a href="#projects" className="transition-colors hover:text-gray-400">Projects</a>
          <a href="#about" className="transition-colors hover:text-gray-400">About</a>
          <a href="#contact" className="transition-colors hover:text-gray-400">Contact</a>
        </div>
      </nav>

      {/* 1. First Screen: 100vh Full Screen Container, Pure White Background */}
      <section className="h-screen w-full bg-white flex flex-col justify-center items-center relative overflow-hidden">
        {/* Interactive ASCII Background Canvas */}
        <AsciiCanvas imageUrl="https://raw.githubusercontent.com/thirteenmonths13/Portfolio-assets/refs/heads/main/Create%20Adam.png" />
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center z-10 pointer-events-none"
        >
          <h1 className="text-3xl md:text-5xl font-light tracking-tight">
            TANG
          </h1>
          <p className="mt-4 text-gray-400 text-sm tracking-widest uppercase">
            Selected Works
          </p>
        </motion.div>
        
        {/* Minimal Scroll Indicator */}
        <motion.div 
          className="absolute bottom-12 text-[10px] text-gray-400 tracking-widest uppercase flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <span>Scroll</span>
          <div className="w-[1px] h-8 bg-gray-200"></div>
        </motion.div>
      </section>

      {/* 2. Scroll Down: CSS Grid with 6 squares */}
      <section id="projects" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      {/* 3. Contact Module */}
      <section id="contact" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <motion.div 
          className="flex flex-col items-center justify-center text-center py-24 border-t border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-2xl font-light mb-6">Let's work together.</h2>
          <a href="mailto:hello@tangwenjie.com" className="text-xl md:text-3xl font-medium hover:text-gray-400 transition-colors">
            hello@tangwenjie.com
          </a>
          <div className="flex gap-6 mt-12 text-sm text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-black transition-colors">Twitter</a>
            <a href="#" className="hover:text-black transition-colors">Instagram</a>
            <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
