'use client';

import { useRef } from 'react';
import { AnimatedTitle } from '../components/AnimatedTitle';
import { SmileyFace3D } from '../components/SmileyFace3D';
import { useAccentColor } from '../hooks/useAccentColor';
import { PartyForm } from '../components/PartyForm';
import { GroupChat } from '../components/GroupChat';
import { ScrollToChatButton } from '../components/ScrollToChatButton';

export default function HomePage() {
  const chatRef = useRef(null);
  const accentColor = useAccentColor();

  return (
    <div className="bg-wrapper">
      <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto space-y-6 sm:space-y-8 md:space-y-12">
          <SmileyFace3D color={accentColor} />
          <AnimatedTitle color={accentColor} />
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
