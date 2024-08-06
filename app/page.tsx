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

  useEffect(() => {
    async function fetchData() {
      // Example fetch URL; replace with your actual endpoint
      const response = await fetch(
        'https://opensheet.elk.sh/1TX-yGqpd254kAR63bI7cKbskSmnuJVcbGuHK0rFp52Q/1' // Replace with your API endpoint
      );
      const data: MediaItem[] = await response.json();
      setMedia(data);
    }

    fetchData();
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

  return (
    <div className={styles.row}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className={styles.column}>
          {column.map((item) => (
            <div key={item.link} className={styles.mediaContainer}>
              {item.type === 'image' ? (
                <Image
                  src={item.link}
                  alt={item.description || item.title}
                  width={600} // Adjust width and height as needed
                  height={400} // Adjust width and height as needed
                  className={styles.media}
                />
              ) : (
                <video
                  src={item.link}
                  controls
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
  );
}
