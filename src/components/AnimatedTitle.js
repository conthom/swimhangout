'use client';

import { useEffect, useState } from 'react';

export function AnimatedTitle() {
  const [usePrimaryBlue, setUsePrimaryBlue] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsePrimaryBlue((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const color = usePrimaryBlue ? '#1d4ed8' : '#7dd3fc';

  return (
    <div className="flex flex-col items-center space-y-6 sm:space-y-8 text-center">
      <h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider transition-colors duration-1000 px-4 w-full"
        style={{
          fontFamily: 'Akira Expanded, sans-serif',
          color: color,
        }}
      >
        lets hangout and swim
      </h1>
      <div
        className="text-base sm:text-lg md:text-xl tracking-wider transition-colors duration-1000 px-4 w-full"
        style={{
          fontFamily: 'Akira Expanded, sans-serif',
          color: color,
        }}
      >
        <p className="mb-4 font-semibold opacity-90">Hangout</p>
        <p className="mb-2">When: Friday May 22 @ 8 PM</p>
        <p className="mb-6">
          Where:{' '}
          <a
            href="https://www.google.com/maps/search/?api=1&query=5328+Bundle+Flower+Court"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            5328 Bundle Flower Court
          </a>
        </p>
        <p className="mb-4 font-semibold opacity-90">Swim</p>
        <p className="mb-2">When: Wednesday May 27, 7 PM – 10 PM</p>
        <p className="mb-2">Where: 4204 Clearwater Ln, Naperville</p>
        <p className="mb-2">Pizza will be provided.</p>
      </div>
    </div>
  );
}
