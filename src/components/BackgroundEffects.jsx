import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const BackgroundEffects = () => {
  const location = useLocation();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Partículas flotantes (reducidas para mejor performance)
    const particles = [];
    const particleCount = 30; // Reducido de 50 a 30

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(75, 180, 233, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Inicializar partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animación
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradiente de fondo
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(15, 15, 30, 0)');
      gradient.addColorStop(1, 'rgba(26, 26, 46, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Actualizar y dibujar partículas
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Líneas conectando partículas cercanas (optimizado)
      // Solo verificar conexiones cada 2 frames para mejor performance
      if (Math.random() > 0.5) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) { // Reducido de 150 a 120
              ctx.strokeStyle = `rgba(75, 180, 233, ${0.15 * (1 - distance / 120)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Redimensionar canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Determinar qué fondo mostrar según la ruta
  const getBackgroundImage = () => {
    if (location.pathname === '/login') {
      return 'url(./backgroundseleccioncuenta.png)';
    }
    // Para Home, Launcher, Config usar fondo2.png
    return 'url(./fondo2.png)';
  };

  return (
    <>
      {/* Imagen de fondo */}
      <div 
        className="fixed top-0 left-0 w-full h-full z-0 transition-all duration-700"
        style={{ 
          backgroundImage: getBackgroundImage(),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'auto',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          filter: 'none'
        }}
      />
      {/* Canvas de partículas encima */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      />
    </>
  );
};

export default BackgroundEffects;

