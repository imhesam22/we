// src/components/Music/MusicList.jsx
import React from 'react';
import ResponsiveMusicCard from './ResponsiveMusicCard.jsx'

const MusicList = ({ musicList, onPlay, variant = "compact" }) => {
  return (
    <div className="space-y-2">
      {musicList.map(music => (
        <ResponsiveMusicCard
          key={music._id}
          music={music}
          variant={variant}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
};

export default MusicList;