"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState("idle"); // idle | out | in
  const prevPathname = useRef(pathname);
  const timerRef = useRef(null);

  useEffect(() => {
    // 같은 경로면 무시
    if (pathname === prevPathname.current) {
      setDisplayChildren(children);
      return;
    }

    // 1) 나가는 애니메이션 시작
    setPhase("out");

    timerRef.current = setTimeout(() => {
      // 2) 새 페이지 콘텐츠로 교체 + 들어오는 애니메이션
      setDisplayChildren(children);
      prevPathname.current = pathname;
      setPhase("in");

      timerRef.current = setTimeout(() => {
        // 3) 완료
        setPhase("idle");
      }, 320);
    }, 200);

    return () => clearTimeout(timerRef.current);
  }, [pathname, children]);

  const style = {
    idle: { opacity: 1, transform: "none" },
    out:  { opacity: 0, transform: "translateY(12px)" },
    in:   { opacity: 0, transform: "translateY(-8px)" },
  }[phase];

  return (
    <div
      style={{
        ...style,
        transition: phase === "idle"
          ? "opacity 0.32s cubic-bezier(0.22,0.61,0.36,1), transform 0.32s cubic-bezier(0.22,0.61,0.36,1)"
          : "opacity 0.2s ease, transform 0.2s ease",
        willChange: "opacity, transform",
      }}
    >
      {displayChildren}
    </div>
  );
}