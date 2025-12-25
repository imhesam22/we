// src/components/Music/MusicGrid.jsx
import React from 'react';
import ResponsiveMusicCard from './ResponsiveMusicCard.jsx';

const MusicGrid = ({ musicList, onPlay, variant = "auto", playlist = null }) => {
  // تشخیص خودکار واریانت بر اساس سایز صفحه
  const getVariant = () => {
    if (variant !== "auto") return variant;
    
    const width = window.innerWidth;
    if (width < 640) return "mobile"; // موبایل
    if (width < 1024) return "grid";  // تبلت
    return "default"; // دسکتاپ
  };

  // گریدهای مختلف بر اساس سایز
  const gridConfigs = {
    mobile: "grid grid-cols-2 gap-3",
    grid: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
    compact: "grid grid-cols-1 gap-2",
    default: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  };

  const currentVariant = getVariant();
  const gridClass = gridConfigs[currentVariant] || gridConfigs.default;

  return (
    <div className={gridClass}>
      {musicList.map((music, index) => (
        <ResponsiveMusicCard
          key={music._id || index}
          music={music}
          variant={currentVariant}
          onPlay={onPlay}
          playlist={playlist || musicList} // ارسال playlist به کارت
        />
      ))}
    </div>
  );
};

export default MusicGrid;