import React, { useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, value, onChange, onComplete, isDarkMode }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault(); // Prevent default backspace behavior
      if (value[index]) {
        // If current input has a value, clear it
        const newOTP = value.split('');
        newOTP[index] = '';
        onChange(newOTP.join(''));
      } else if (index > 0) {
        // If current input is empty, move to previous input and clear it
        const newOTP = value.split('');
        newOTP[index - 1] = '';
        onChange(newOTP.join(''));
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'Enter' && value.length === length) {
      onComplete?.(); // Trigger verification when Enter is pressed and OTP is complete
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleChange = (e, index) => {
    const newValue = e.target.value.slice(-1); // Take only the last character
    if (newValue.match(/^[0-9]$/) || newValue === '') {
      const newOTP = value.split('');
      newOTP[index] = newValue;
      onChange(newOTP.join(''));
      
      // Move to next input if a number was entered and there's a next input
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (pastedData.match(/^[0-9]+$/)) {
      onChange(pastedData.padEnd(length, ''));
      // Focus last input
      inputRefs.current[length - 1].focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {[...Array(length)].map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`
            w-12 h-12 text-center text-xl font-semibold rounded-lg
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${isDarkMode 
              ? 'bg-gray-900 text-white border-gray-700' 
              : 'bg-white text-gray-900 border-gray-300'
            }
            border-2 shadow-sm
            transition-all duration-200
            ${value[index] 
              ? isDarkMode 
                ? 'border-indigo-400' 
                : 'border-indigo-500' 
              : ''
            }
          `}
          autoComplete="off"
          inputMode="numeric"
        />
      ))}
    </div>
  );
};

export default OTPInput;