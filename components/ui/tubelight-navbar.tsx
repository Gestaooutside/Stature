import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const Tab = ({ text, active, onClick }: { text: string; active: boolean; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={`${
        active
          ? "text-neutral-950"
          : "text-neutral-500 hover:text-neutral-700"
      } relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-within:outline-none`}
    >
      <span className="relative z-10">{text}</span>
      {active && (
        <motion.div
          layoutId="tab-pill"
          className="absolute inset-0 bg-[#f0ede6] rounded-full"
          initial={false}
          transition={{
            type: "spring",
            bounce: 0.2,
            duration: 0.6,
          }}
        />
      )}
    </button>
  );
};

const TubeLightNavBar = () => {
  const [activeTab, setActiveTab] = useState("Leads Cupom 5%");
  const navRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  const tabs = ["Leads Cupom 5%", "Leads Checkout"];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (navRef.current) {
      const activeButton = navRef.current.querySelector(
        'button[style*="text-neutral-950"]'
      ) as HTMLButtonElement;
      if (activeButton && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        setHighlightStyle({
          left: `${buttonRect.left - navRect.left}px`,
          width: `${buttonRect.width}px`,
          top: `${buttonRect.top - navRect.top}px`,
          height: `${buttonRect.height}px`,
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative">
        <div
          ref={navRef}
          className="relative flex items-center justify-center rounded-full bg-[#fafafa] p-1 shadow-[inset_0_1px_3px_0_rgba(0,0,0,0.1)]"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab}
              text={tab}
              active={activeTab === tab}
              onClick={() => handleTabChange(tab)}
            />
          ))}
        </div>
        <motion.div
          className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#e3dfd6] via-[#f0ede6] to-[#e3dfd6]"
          style={highlightStyle}
          initial={false}
          animate={highlightStyle}
          transition={{
            type: "spring",
            bounce: 0.3,
            duration: 0.5,
          }}
        />
      </div>
    </div>
  );
};

export default TubeLightNavBar;