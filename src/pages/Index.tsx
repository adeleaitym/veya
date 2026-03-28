import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import heroIllustration from "@/assets/hero-illustration.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen paper-texture flex flex-col"
    >
      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full max-w-md mx-auto px-6 pt-6 pb-0 flex items-center justify-between"
      >
        <h1 className="text-4xl font-display font-bold text-secondary leading-none">
          Veya
        </h1>
        <span className="text-ink/25 font-body text-xs tracking-widest uppercase">
          Stockholm
        </span>
      </motion.header>

      {/* Hero — full-width immersive */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-auto px-4 mt-4"
      >
        <div className="relative rounded-3xl overflow-hidden shadow-xl group">
          <motion.img
            src={heroIllustration}
            alt="Illustrated character dancing in Stockholm tunnelbana"
            width={768}
            height={960}
            className="w-full h-[520px] object-cover object-center"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.6 }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Floating sparkle */}
          <motion.div
            className="absolute top-6 right-6 text-2xl"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            ✦
          </motion.div>
          {/* Overlay text */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-3xl font-display font-bold text-white leading-tight drop-shadow-lg"
            >
              Curated evenings<br />that just work ✦
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="font-body text-white/70 text-sm mt-1.5"
            >
              Swipe a vibe. Get a plan. Live it tonight.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="w-full max-w-md mx-auto px-5 pb-8 pt-4"
      >
        <motion.button
          onClick={() => navigate("/vibes")}
          className="zine-btn"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          Plan my night →
        </motion.button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center font-body text-ink/25 mt-3 text-xs"
        >
          Evenings designed around your mood ✦
        </motion.p>
      </motion.section>
    </motion.div>
  );
};

export default Index;
