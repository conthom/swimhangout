'use client';

import { useState } from 'react';
import React from 'react';
import { getSupabase } from '../lib/supabase';
export function PartyForm() {
  const [formData, setFormData] = useState({
    name: '',
    guests: 1,
    message: '',
    attending_hangout: false,
    attending_swim: false,
  });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.attending_hangout && !formData.attending_swim) {
      setStatus('noop');
      return;
    }
    setStatus('loading');

    try {
      const { error } = await getSupabase()
        .from('party_invites')
        .insert([
          {
            name: formData.name,
            guests: formData.guests,
            message: formData.message,
            attending_hangout: formData.attending_hangout,
            attending_swim: formData.attending_swim,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;
      
      setStatus('success');
      setFormData({
        name: '',
        guests: 1,
        message: '',
        attending_hangout: false,
        attending_swim: false,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8 rounded-2xl backdrop-blur-sm bg-gray-900/50">
      {status === 'success' && (
        <div className="bg-green-500/10 text-green-500 p-3 sm:p-4 rounded-xl text-sm sm:text-base">
          Thank you for your RSVP!
        </div>
      )}
      {status === 'error' && (
        <div className="bg-sky-900/30 text-sky-300 p-3 sm:p-4 rounded-xl text-sm sm:text-base">
          There was an error submitting your RSVP. Please try again.
        </div>
      )}
      {status === 'noop' && (
        <div className="bg-amber-500/10 text-amber-400 p-3 sm:p-4 rounded-xl text-sm sm:text-base">
          Pick hangout and/or swim so we know what you&apos;re coming to.
        </div>
      )}

      <div className="space-y-1 sm:space-y-2">
        <label htmlFor="name" className="block text-base sm:text-lg font-medium text-white">Name</label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-gray-900 text-white border border-gray-700 
                   accent-focus focus:border-transparent 
                   placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2 sm:space-y-3">
        <span className="block text-base sm:text-lg font-medium text-white">I&apos;m in for</span>
        <div className="space-y-2">
          <label className="flex items-center gap-3 text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.attending_hangout}
              onChange={(e) => {
                setFormData({ ...formData, attending_hangout: e.target.checked });
                setStatus('idle');
              }}
              className="h-4 w-4 rounded border-gray-600 accent-check"
            />
            <span>Hangout (May 22 @ 8 PM)</span>
          </label>
          <label className="flex items-center gap-3 text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.attending_swim}
              onChange={(e) => {
                setFormData({ ...formData, attending_swim: e.target.checked });
                setStatus('idle');
              }}
              className="h-4 w-4 rounded border-gray-600 accent-check"
            />
            <span>Swim (May 27, 7–10 PM)</span>
          </label>
        </div>
      </div>

      <div className="space-y-1 sm:space-y-2">
        <label htmlFor="guests" className="block text-base sm:text-lg font-medium text-white">
          Number of Guests: {formData.guests}
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            id="guests"
            min="1"
            max="10"
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-range"
          />
          <span className="text-white font-medium min-w-[2rem] text-center text-base sm:text-lg">
            {formData.guests}
          </span>
        </div>
      </div>

      <div className="space-y-1 sm:space-y-2">
        <label htmlFor="message" className="block text-base sm:text-lg font-medium text-white">Message (Optional)</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-gray-900 text-white border border-gray-700 
                   accent-focus focus:border-transparent 
                   placeholder-gray-400 transition-all duration-200 h-32 resize-none text-sm sm:text-base"
          placeholder="Any additional information..."
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-2 sm:py-3 px-4 sm:px-6 rounded-xl accent-bg
                 text-white font-medium text-base sm:text-lg
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit RSVP'}
      </button>
    </form>
  );
}