'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Loading from './components/Loading/Loading';
import Search from './components/Search/Search';

interface MediaItem {
  type: 'image' | 'video' | 'gallery';
  link: string;
}

export default function Gallery() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [showControls, setShowControls] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState<string | ''>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    setLoading(true);

    async function fetchData() {
      const response = await fetch(
        `https://opensheet.elk.sh/1-0u9tgXpiRbZCivkedxKQ-DsRiQ6FM1YGjInU_S4nrE/${searchValue}`
      );

      const data: MediaItem[] = await response.json();
      setMedia((prevMedia) => (data.length ? data : prevMedia));
      setLoading(false);
    }

    if (searchValue) fetchData();
  }, [searchValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreen(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const splitArrayIntoColumns = (array: MediaItem[], numColumns: number) => {
    const columns: MediaItem[][] = Array.from({ length: numColumns }, () => []);

    array.forEach((item, index) => {
      columns[index % numColumns].push(item);
    });

    return columns;
  };

  const columns = isMobile
    ? splitArrayIntoColumns(media, 1)
    : splitArrayIntoColumns(media, 3);

  const handleImageClick = (item: MediaItem, e: React.MouseEvent) => {
    e.preventDefault();

    setFullscreen(fullscreen === item.link ? null : item.link);
  };

  const handleVideoDoubleClick = (item: MediaItem) => {
    setFullscreen(fullscreen === item.link ? null : item.link);
  };

  const handleVideoClick = (
    e: React.MouseEvent<HTMLVideoElement>,
    link: string
  ) => {
    const video = e.currentTarget;

    e.preventDefault();

    // Toggle controls
    setShowControls((prev) => {
      const newControls = new Set(prev);
      if (newControls.has(link)) {
        newControls.delete(link);
      } else {
        newControls.add(link);
      }
      return newControls;
    });
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleImageLoad = (link: string) => {
    setLoadedImages((prev) => new Set(prev).add(link));
  };

  const handleSearch = (query: string) => {
    setSearchValue(query);
  };

  if (!searchValue) return <Search onSubmit={handleSearch} />;

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className={styles.row}>
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className={styles.column}>
              {column.map((item) => (
                <div
                  key={item.link}
                  className={`${styles.mediaContainer} ${
                    fullscreen === item.link ? styles.fullscreen : ''
                  }`}
                  onClick={(e) =>
                    item.type === 'image' && handleImageClick(item, e)
                  }
                  onDoubleClick={() =>
                    item.type === 'video' && handleVideoDoubleClick(item)
                  }
                >
                  {item.type === 'image' ? (
                    <Image
                      src={item.link}
                      alt={'image'}
                      unoptimized
                      width={500}
                      height={500}
                      className={`${styles.media} fade-in ${
                        loadedImages.has(item.link) ? 'visible' : ''
                      }`}
                      onLoad={() => handleImageLoad(item.link)}
                    />
                  ) : (
                    <video
                      src={item.link}
                      loop
                      controls={showControls.has(item.link)}
                      onClick={(e) => handleVideoClick(e, item.link)}
                      className={`${styles.media} ${styles.video}`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
