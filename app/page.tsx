'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { useEffect, useState } from 'react';

// Define the interface for the media item
interface MediaItem {
  title: string;
  description: string;
  type: 'image' | 'video';
  link: string;
  source: string;
  tags: string;
}

export default function Home() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<String>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [fullscreen, setFullscreen] = useState<string | null>(null); // To track fullscreen state

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      const response = await fetch(
        'https://opensheet.elk.sh/1TX-yGqpd254kAR63bI7cKbskSmnuJVcbGuHK0rFp52Q/' +
          category
      );
      const data: MediaItem[] = await response.json();
      setMedia(data.length ? data : media);
      setLoading(false);
    }

    fetchData();
  }, [category]);

  // Listen for the Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreen(null); // Exit fullscreen on Escape key press
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Split the media array into three columns
  const splitArrayIntoColumns = (array: MediaItem[], numColumns: number) => {
    const columns: MediaItem[][] = Array.from({ length: numColumns }, () => []);
    array.forEach((item, index) => {
      columns[index % numColumns].push(item);
    });
    return columns;
  };

  const columns = splitArrayIntoColumns(media, 3);

  // Handle image click for fullscreen toggle
  const handleImageClick = (item: MediaItem) => {
    setFullscreen(fullscreen === item.link ? null : item.link);
  };

  // Handle video double click for fullscreen toggle
  const handleVideoDoubleClick = (item: MediaItem) => {
    setFullscreen(fullscreen === item.link ? null : item.link);
  };

  // Handle video play/pause
  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
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
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
              ></input>
              {selectedCategory ? (
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className={styles.clearSearch}
                  onClick={() => {
                    setSelectedCategory('');
                  }}
                >
                  <path
                    d='M14.4848 1.5154L1.51562 14.4837M14.4848 14.4846L1.51562 1.51632'
                    stroke='var(--icon-color)'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                  ></path>
                </svg>
              ) : (
                <div></div>
              )}
            </div>
          </form>
        </div>
      )}
      <div className={styles.row}>
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className={styles.column}>
            {column.map((item) => (
              <div
                key={item.link}
                className={`${styles.mediaContainer} ${
                  fullscreen === item.link ? styles.fullscreen : ''
                }`}
                onClick={() => item.type === 'image' && handleImageClick(item)}
                onDoubleClick={() =>
                  item.type === 'video' && handleVideoDoubleClick(item)
                }
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.link}
                    alt={item.description || item.title}
                    width={0}
                    height={0}
                    sizes='100vw'
                    className={styles.media}
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
    </div>
  );
}
