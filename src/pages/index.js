'use client';

import { useRef } from 'react';
import { AnimatedTitle } from '../components/AnimatedTitle';
import { SmileyFace3D } from '../components/SmileyFace3D';
import { PartyForm } from '../components/PartyForm';
import { GroupChat } from '../components/GroupChat';
import { ScrollToChatButton } from '../components/ScrollToChatButton';
import {
  AccentColorProvider,
  useThemeAccent,
} from '../context/AccentColorContext';

function HomeContent() {
  const chatRef = useRef(null);
  const { color, hoverColor } = useThemeAccent();

  return (
    <div
      className="bg-wrapper"
      style={{
        '--accent': color,
        '--accent-hover': hoverColor,
      }}
    >
      <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto space-y-6 sm:space-y-8 md:space-y-12">
          <SmileyFace3D />
          <AnimatedTitle />
          <PartyForm />
          <div ref={chatRef} className="scroll-mt-6">
            <GroupChat />
          </div>
        </div>
      </main>
      <ScrollToChatButton targetRef={chatRef} />
    </div>
  );
}

export default function HomePage() {
  return (
    <AccentColorProvider>
      <HomeContent />
    </AccentColorProvider>
  );
}
