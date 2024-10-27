import { useState, useEffect } from 'react';

const useTypingEffect = (phrases, typingSpeed = 150, deletingSpeed = 100, pauseDuration = 2000) => {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;

    const type = () => {
      const currentFullPhrase = phrases[currentIndex];
      
      if (!isDeleting && currentPhrase === currentFullPhrase) {
        timer = setTimeout(() => setIsDeleting(true), pauseDuration);
        return;
      }

      if (isDeleting && currentPhrase === '') {
        setIsDeleting(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        return;
      }

      const nextChar = isDeleting
        ? currentPhrase.slice(0, -1)
        : currentFullPhrase.slice(0, currentPhrase.length + 1);

      setCurrentPhrase(nextChar);

      timer = setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    };

    timer = setTimeout(type, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentPhrase, isDeleting, currentIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return currentPhrase;
};

export default useTypingEffect;