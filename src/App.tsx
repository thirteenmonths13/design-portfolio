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
        <a href="#home" className="font-bold text-lg tracking-wide uppercase hover:text-gray-400 transition-colors">TANG WENJIE</a>
        <div className="flex gap-6 md:gap-8 text-sm font-medium">
          <a href="#projects" className="transition-colors hover:text-gray-400">Projects</a>
          <a href="#about" className="transition-colors hover:text-gray-400">About</a>
          <a href="#contact" className="transition-colors hover:text-gray-400">Contact</a>
        </div>
      </nav>

      {/* 1. First Screen: Hero Section */}
      <section id="home" className="h-screen w-full bg-white flex flex-col justify-center items-center relative overflow-hidden">
        {/* Interactive ASCII Background Canvas */}
        <AsciiCanvas imageUrl="https://raw.githubusercontent.com/thirteenmonths13/Portfolio-assets/refs/heads/main/Create%20Adam.png" />
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center z-10 pointer-events-none"
        >
          <h1 className="text-3xl md:text-5xl font-light tracking-tight">
            Hello~ It’s 唐雯婕.
          </h1>
          <p className="mt-4 text-black text-sm tracking-widest uppercase font-medium">
            Interaction Designer · NUI Explorer · Creative Technologist
          </p>
          <p className="mt-6 text-gray-500 text-lg italic tracking-wide">
            “不止于界面，不止于体验”
          </p>
          <p className="mt-2 text-gray-400 text-xs tracking-widest uppercase flex items-center justify-center gap-2">
            <span>Beyond Interface</span>
            <span className="text-gray-300">|</span> 
            <span>Beyond Experience.</span>
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

      {/* 3. About Me */}
      <section id="about" className="w-full max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center flex flex-col items-center"
        >
          <h2 className="text-2xl font-light mb-8">About Me</h2>
          <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-6 text-justify md:text-center">
            我是唐雯婕，一位探索自然用户界面 (NUI) 与创意技术的交互设计师。
            我热衷于创造跨越屏幕体验边界的作品，将物理世界与数字领域融合，
            打造更加直观、富有诗意的人机交互体验。
          </p>
          <p className="text-gray-400 leading-relaxed text-xs md:text-sm text-center">
            I am an Interaction Designer exploring the boundaries of Natural User Interfaces (NUI) and creative technologies.
            Driven by a passion for creating experiences that go beyond the screen, blending physical and digital realms to 
            make intuitive and poetic human-computer experiences.
          </p>
        </motion.div>
      </section>

      {/* 4. Contact Module */}
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
