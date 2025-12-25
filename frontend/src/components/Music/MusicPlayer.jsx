// src/components/Music/MusicPlayer.jsx
import React from 'react';
import { useMusicStore } from '../../stores/musicStore';
import MusicPlayerUI from './MusicPlayerUI';

const MusicPlayer = () => {
  const currentMusic = useMusicStore((s) => s.currentMusic);

  if (!currentMusic) return null;

  return <MusicPlayerUI />;
};

export default MusicPlayer;
