import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Users, BadgeCheck } from "lucide-react";

// Updated: Changed features to match educational theme
const features = [
  {
    title: "FORMATIONS PROFESSIONNELLES",
    icon: <BadgeCheck className="h-6 w-6" />,
    description: "Des programmes adaptés aux besoins du marché du travail",
  },
  {
    title: "INSTRUCTEURS QUALIFIÉS",
    icon: <Users className="h-6 w-6" />,
    description: "Des experts du secteur avec une expérience pratique",
  },
  {
    title: "RESSOURCES NUMÉRIQUES",
    icon: <BookOpen className="h-6 w-6" />,
    description: "Accès à des outils pédagogiques modernes et interactifs",
  },
];

export default function FeatureHighlights() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInView) {
      setVisible(true);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="absolute bottom-24 left-0 right-0 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
        transition={{ duration: 0.8, staggerChildren: 0.1 }}
        className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: visible ? 1 : 0,
              y: visible ? 0 : 20,
              scale: visible ? 1 : 0.9,
            }}
            transition={{
              duration: 0.5,
              delay: visible ? 0.2 + index * 0.2 : 0,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            className="flex flex-col items-center max-w-[200px] group"
          >
            <motion.div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#7D7DC0]/20 to-[#9797D5]/20 text-lg relative overflow-hidden"
              whileHover={{
                boxShadow: "0 0 20px rgba(125, 125, 192, 0.4)",
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#7D7DC0]/0 to-[#9797D5]/0"
                whileHover={{
                  from: "#7D7DC0",
                  to: "#9797D5",
                  opacity: 0.2,
                }}
              />
              <motion.div
                initial={{ color: "#7D7DC0" }}
                whileHover={{
                  scale: 1.2,
                  color: "#5D5DA0",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
            </motion.div>

            <motion.span
              className="text-sm font-medium tracking-wider text-[#7D7DC0] text-center mb-2"
              whileHover={{ color: "#5D5DA0" }}
            >
              {feature.title}
            </motion.span>

            <motion.p
              initial={{ opacity: 0, height: 0 }}
              whileHover={{
                opacity: 1,
                height: "auto",
                transition: { duration: 0.3 },
              }}
              className="text-xs text-[#888] dark:text-[#CCCCCC] text-center overflow-hidden"
            >
              {feature.description}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 