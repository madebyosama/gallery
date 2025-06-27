import { ChangeEvent, FormEvent, useState } from 'react';
import styles from './Search.module.css';

interface SearchProps {
  onSubmit: (query: string) => void;
}

export default function Search({ onSubmit }: SearchProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(searchValue);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.search}
        placeholder='Search'
        value={searchValue}
        onChange={handleChange}
      />
    </form>
  );
}
