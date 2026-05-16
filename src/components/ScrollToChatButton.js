'use client';

import { useEffect, useState } from 'react';

export function ScrollToChatButton({ targetRef }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0.15, rootMargin: '0px 0px -48px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  if (!show) return null;

  const scrollToChat = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      type="button"
      onClick={scrollToChat}
      aria-label="Scroll down to chat"
      className="fixed z-50 bottom-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2
                 flex items-center gap-2 rounded-full px-4 py-3
                 bg-[#0a84ff] hover:bg-[#409cff] text-white text-sm font-semibold
                 shadow-lg shadow-blue-900/40 transition-colors
                 md:px-5 md:py-3.5"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
    >
      <span className="hidden md:inline">scroll down to chat</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 shrink-0"
        aria-hidden
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    </button>
  );
}
