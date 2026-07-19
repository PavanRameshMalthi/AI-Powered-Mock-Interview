import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

const getScoreColor = (score) => {
  if (score >= 90) return { stroke: "#22C55E", text: "#22C55E", label: "Excellent" };
  if (score >= 75) return { stroke: "#6366F1", text: "#6366F1", label: "Strong" };
  if (score >= 60) return { stroke: "#F59E0B", text: "#F59E0B", label: "Moderate" };
  return { stroke: "#EF4444", text: "#EF4444", label: "Needs Work" };
};

const CircularScoreGauge = ({ score = 0, size = 180, strokeWidth = 14 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const colors = getScoreColor(score);

  const motionScore = useMotionValue(0);
  const springScore = useSpring(motionScore, { stiffness: 60, damping: 15 });

  useEffect(() => {
    if (isInView) {
      motionScore.set(score);
    }
  }, [isInView, score, motionScore]);

  const offset = circumference - (score / 100) * circumference;

  return (
    <div ref={ref} className="circular-gauge-wrapper">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="circular-gauge-svg"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          filter={`drop-shadow(0 0 8px ${colors.stroke}60)`}
        />
        {/* Score text */}
        <text
          x="50%"
          y="44%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.text}
          fontSize={size * 0.22}
          fontWeight="800"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#a5b4c8"
          fontSize={size * 0.1}
          fontFamily="Inter, sans-serif"
        >
          / 100
        </text>
      </svg>

      <motion.div
        className="gauge-label"
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8, duration: 0.4 }}
        style={{ color: colors.text }}
      >
        {colors.label}
      </motion.div>
    </div>
  );
};

export default CircularScoreGauge;
