import React, { useEffect, useState } from 'react';
import guessPeople from '../data/peopleDescriptions'; // ensure the path matches the actual file location

const Guess: React.FC = () => {
  const [currentPersonIdx, setCurrentPersonIdx] = useState<number>(0);
  const [lastPersonIdx, setLastPersonIdx] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextPersonIdx;

      do {
        nextPersonIdx = Math.floor(Math.random() * guessPeople.length);
      } while (nextPersonIdx === lastPersonIdx);

      setLastPersonIdx(currentPersonIdx);
      setCurrentPersonIdx(nextPersonIdx);
    }, 5000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [currentPersonIdx, lastPersonIdx]);

  return (
    <div>
      <p>{guessPeople[currentPersonIdx].description}</p>
    </div>
  )
}

export default Guess;
