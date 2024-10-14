'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Loading from './components/Loading/Loading';

// Define the interface for the media item
interface MediaItem {
  type: 'image' | 'video';
  link: string;
}

export default function Home() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      const response = await fetch(
        `https://opensheet.elk.sh/1TX-yGqpd254kAR63bI7cKbskSmnuJVcbGuHK0rFp52Q/${category}`
      );
      const data: MediaItem[] = await response.json();
      setMedia((prevMedia) => (data.length ? data : prevMedia));
      setLoading(false);
    }

    fetchData();
  }, [category]);

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

  const columns = splitArrayIntoColumns(media, 3);

  const handleImageClick = (item: MediaItem, e: React.MouseEvent) => {
    e.preventDefault(); // Prevents default behavior
    setFullscreen(fullscreen === item.link ? null : item.link);
  };

  const handleVideoDoubleClick = (item: MediaItem) => {
    setFullscreen(fullscreen === item.link ? null : item.link);
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleImageLoad = (link: string) => {
    setLoadedImages((prev) => new Set(prev).add(link));
  };

  return (
    <div>
      {category ? (
        <div></div>
      ) : (
        <div className={styles.form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCategory(selectedCategory);
            }}
          >
            <div className={styles.searchContainer}>
              <input
                className={styles.search}
                placeholder='Search'
                value={selectedCategory}
                autoFocus
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
              />
              {selectedCategory && (
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className={styles.clearSearch}
                  onClick={() => setSelectedCategory('')}
                >
                  <path
                    d='M14.4848 1.5154L1.51562 14.4837M14.4848 14.4846L1.51562 1.51632'
                    stroke='var(--icon-color)'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </div>
          </form>
        </div>
      )}
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
                  } // Pass event
                  onDoubleClick={() =>
                    item.type === 'video' && handleVideoDoubleClick(item)
                  }
                >
                  {item.type === 'image' ? (
                    <Image
                      src={item.link}
                      alt={'image'}
                      width={500} // Set a specific width
                      height={500} // Set a specific height
                      className={`${styles.media} fade-in ${
                        loadedImages.has(item.link) ? 'visible' : ''
                      }`}
                      onLoad={() => handleImageLoad(item.link)}
                    />
                  ) : (
                    <video
                      src={item.link}
                      loop
                      onClick={handleVideoClick}
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
