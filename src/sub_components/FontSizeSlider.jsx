import { useState, useEffect, useRef } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import useFontSizeStore from "../store/useFontSizeStore";
import useThemeStore from "../store/useThemeStore";

const FontSizeSlider = () => {
  const { fontSize, setFontSize, toggleFontSizeSlider, showFontSizeSlider } = useFontSizeStore();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const sliderRef = useRef(null);
  const componentRef = useRef(null);

  const MIN_FONT_SIZE = 12;
  const MAX_FONT_SIZE = 24;

  const handleSliderChange = (e) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const percentage = Math.min(Math.max(x / rect.width, 0), 1);
    const newSize = Math.round(
      MIN_FONT_SIZE + percentage * (MAX_FONT_SIZE - MIN_FONT_SIZE)
    );

    if (newSize < MIN_FONT_SIZE) {
      setError(`Minimum font size is ${MIN_FONT_SIZE}px`);
    } else if (newSize > MAX_FONT_SIZE) {
      setError(`Maximum font size is ${MAX_FONT_SIZE}px`);
    } else {
      setError("");
      setFontSize(newSize);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleSliderChange(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleSliderChange(e);
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    handleSliderChange(e);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      handleSliderChange(e);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      setFontSize(Math.max(fontSize - 1, MIN_FONT_SIZE));
    } else if (e.key === "ArrowRight") {
      setFontSize(Math.min(fontSize + 1, MAX_FONT_SIZE));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        toggleFontSizeSlider();
      }
    };

    const handleTouchOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        toggleFontSizeSlider();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchstart", handleTouchOutside);

    // Close the component on page refresh
    const handleBeforeUnload = () => {
      if (showFontSizeSlider) {
        toggleFontSizeSlider();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchstart", handleTouchOutside);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDragging, toggleFontSizeSlider, showFontSizeSlider]);

  const percentage = ((fontSize - MIN_FONT_SIZE) / (MAX_FONT_SIZE - MIN_FONT_SIZE)) * 100;

  const themeClasses = isDarkMode
    ? "bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white"
    : "bg-gradient-to-br from-gray-100 to-white border-gray-300 text-black";

  const buttonClasses = isDarkMode
    ? "bg-gray-800 hover:bg-gray-700 text-cyan-400"
    : "bg-gray-200 hover:bg-gray-300 text-blue-600";

  const sliderClasses = isDarkMode
    ? "bg-gray-700"
    : "bg-gray-400";

  const sliderFillClasses = isDarkMode
    ? "from-cyan-400 to-blue-500"
    : "from-blue-600 to-cyan-700";

  const getSliderContainerBg = () => {
    return isDarkMode
      ? "bg-gradient-to-br from-gray-800 to-gray-700"
      : "bg-gradient-to-br from-gray-200 to-gray-300";
  };

  return (
    <div ref={componentRef} className={`max-w-lg w-full mx-auto p-3 sm:p-4 md:p-6 rounded-2xl shadow-2xl border ${themeClasses}`}>
      <div className={`relative mb- sm:mb- p-4 rounded-xl ${getSliderContainerBg()}`}>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setFontSize(Math.max(fontSize - 1, MIN_FONT_SIZE))}
            className={`p-2 rounded-full ${buttonClasses} transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 flex items-center justify-center`}
            aria-label="Decrease font size"
          >
            <FiMinus className="text-sm sm:text-base" />
          </button>
          <span className={`text-lg sm:text-xl font-semibold mx-4 ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500' : 'text-blue-600'}`}>
            {fontSize}px
          </span>
          <button
            onClick={() => setFontSize(Math.min(fontSize + 1, MAX_FONT_SIZE))}
            className={`p-2 rounded-full ${buttonClasses} transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 flex items-center justify-center`}
            aria-label="Increase font size"
          >
            <FiPlus className="text-sm sm:text-base" />
          </button>
        </div>

        <div
          ref={sliderRef}
          className={`h-2 sm:h-3 ${sliderClasses} rounded-full cursor-pointer relative overflow-hidden`}
          onClick={handleSliderChange}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          role="slider"
          aria-valuemin={MIN_FONT_SIZE}
          aria-valuemax={MAX_FONT_SIZE}
          aria-valuenow={fontSize}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div
            className={`absolute h-full bg-gradient-to-r ${sliderFillClasses} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${percentage}%` }}
          ></div>
          <div
            className={`absolute w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full -mt-1 transform -translate-x-1/2 transition-all duration-300 ${
              isDragging ? "scale-125 shadow-lg shadow-cyan-400/50" : ""
            } border-2 ${isDarkMode ? 'border-cyan-400' : 'border-blue-500'}`}
            style={{ left: `${percentage}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          ></div>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-xs sm:text-sm mt-2 transition-all duration-300 ease-in-out">
          {error}
        </div>
      )}
    </div>
  );
};

export default FontSizeSlider;
