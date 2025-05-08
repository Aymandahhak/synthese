import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/common/Header"; // Import Header instead of NavBar

// Typewriter effect component
function TypewriterEffect({ text, delay = 0 }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 50); // Speed of typing

      return () => clearTimeout(timer);
    }
  }, [currentIndex, started, text]);

  return (
    <p className="mt-2 text-base text-white/80 h-6 drop-shadow-md">
      {displayText}
      {currentIndex < text.length && started && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-white ml-[2px]"
        />
      )}
    </p>
  );
}

export default function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // 3D tilt effect
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const yPos = (e.clientY - top) / height;

    setRotateX((yPos - 0.5) * 10); // -5 to 5 degrees
    setRotateY((x - 0.5) * -10); // -5 to 5 degrees
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center pt-32 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Add Header at the top */}
      <div className="absolute top-0 left-0 right-0 z-50 w-full">
        <Header />
      </div>
      
      {/* Background Image with Parallax Effect */}
      <motion.div className="absolute inset-0 w-full h-full z-0" style={{ y: backgroundY }}>
        {/* Light mode background */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode ? "opacity-0" : "opacity-100"}`}>
          <img
            src="/images/light.png"
            alt="Desert landscape light"
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Dark mode background */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode ? "opacity-100" : "opacity-0"}`}>
          <img
            src="/images/dark.png"
            alt="Desert landscape dark"
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent z-10"></div>
      </motion.div>

      <motion.div className="relative flex items-center justify-center z-20" style={{ y, opacity, scale }}>
        {/* Background text - OFPPT style with more prominent appearance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }} // Increased opacity for better visibility
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center">
            <motion.span
              className="text-white text-[100px] sm:text-[150px] md:text-[180px] font-bold leading-none tracking-wider drop-shadow-xl" // Increased font size and shadow
              animate={{ opacity: [0.6, 0.8, 0.6] }} // More visible animation
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              OFPPT
            </motion.span>
            <motion.span
              className="text-white text-[100px] sm:text-[150px] md:text-[180px] font-bold leading-none tracking-wider drop-shadow-xl -mt-8" // Increased font size and shadow, negative margin to bring closer
              animate={{ opacity: [0.6, 0.8, 0.6] }} // More visible animation
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              FORMATION
            </motion.span>
          </div>
        </motion.div>

        {/* Circular gradient behind icon - more subtle like OPPO */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute h-[400px] w-[400px] rounded-full opacity-60 blur-xl" // More subtle blur
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(207,207,234,0.3) 70%, rgba(240,241,247,0) 100%)",
          }}
        />

        {/* 3D Graduation Cap */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.5,
            type: "spring",
            stiffness: 100,
          }}
          className="relative z-30 h-[380px] w-auto flex items-center justify-center perspective-[1000px]" // Increased z-index to appear above the text
          style={{
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}
        >
          <motion.div
            animate={{
              y: [0, -10, 0], // More subtle movement like OPPO
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="relative drop-shadow-xl" // Less intense shadow
          >
            <img
              src="/images/hero.png"
              alt="Professional OFPPT Instructor"
              width={300}
              height={400}
              className="rounded-lg object-contain filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]" // Darker shadow for visibility
            />

            {/* Glowing effect - more subtle */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-white/10 blur-xl" // More subtle glow
              animate={{
                opacity: [0.3, 0.5, 0.3], // More subtle animation
                scale: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Tagline with typing effect - OPPO style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="mt-10 text-center relative z-20"
      >
        <h2 className="text-2xl font-medium text-white tracking-wide drop-shadow-md">
          <motion.span
            className="text-white inline-block"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
          >
            OFPPT Formation Concept
          </motion.span>
        </h2>

        {/* Animated typing effect for subtitle */}
        <TypewriterEffect text="Développez vos compétences avec nos experts professionnels." delay={2.5} />
      </motion.div>

      {/* Floating CTA button with hover effect */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="mt-12 relative z-20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button className="group relative overflow-hidden rounded-full bg-white/20 backdrop-blur-md px-8 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl border border-white/30">
          <span className="relative z-10">Rencontrer Nos Instructeurs</span>
          <motion.span
            className="absolute inset-0 -z-0 h-full w-full bg-white/30 opacity-0"
            initial={{ x: "-100%" }}
            whileHover={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Glow effect on hover */}
          <motion.span
            className="absolute -inset-1 rounded-full opacity-0 blur-md bg-white/20"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.5 }}
            transition={{ duration: 0.4 }}
          />
        </button>
      </motion.div>

      {/* Subtle scroll indicator (no text) - more minimal like OPPO */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }} // More visible against the background
        transition={{ delay: 3, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }} // More subtle movement
          transition={{ duration: 2.5, repeat: Infinity }}
          className="h-6 w-[1px] bg-white" // Changed to white for visibility
        />
      </motion.div>
    </section>
  );
}