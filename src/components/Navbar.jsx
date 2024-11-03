import React, { useState, useEffect } from 'react';
import { FaBars, FaMoon, FaSun, FaHome, FaExpand, FaCompress } from 'react-icons/fa';
import Sidebar from './Sidebar';
import useThemeStore from '.././store/useThemeStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useFullscreenStore from '../store/useFullscreenStore';

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
    const navigate = useNavigate();
    const isDarkMode = useThemeStore((state) => state.isDarkMode);
    const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();
    const { isFullscreen, setFullscreen } = useFullscreenStore();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/api/auth/verify`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setIsAuthenticated(response.data.valid);
                
                if (!response.data.valid) {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                setIsAuthenticated(false);
                localStorage.removeItem('token');
            }
        };

        verifyToken();
    }, [location]); // Re-verify when location changes

    const toggleSidebar = () => {
        setIsSidebarOpen((prevState) => !prevState);
    };

    const handleLogoClick = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            navigate('/');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/auth/user/default-codespace`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.defaultCodespace) {
                navigate(`/${response.data.defaultCodespace}`);
            } else if (response.data.username) {
                navigate(`/${response.data.username}`);
            }
        } catch (error) {
            console.error('Error fetching default codespace:', error);
            navigate('/');
        }
    };

    useEffect(() => {
        const syncScrolls = () => {
            const editors = document.querySelectorAll('.monaco-editor');
            if (editors.length === 2) {
                const [editor1, editor2] = editors;
                const syncScroll = (sourceEditor, targetEditor) => {
                    const sourceScrollTop = sourceEditor.scrollTop;
                    targetEditor.scrollTop = sourceScrollTop;
                };
                editor1.addEventListener('scroll', () => syncScroll(editor1, editor2));
                editor2.addEventListener('scroll', () => syncScroll(editor2, editor1));
            }
        };

        if (location.pathname === '/diff-checker') {
            // Wait for the editors to be fully rendered
            setTimeout(syncScrolls, 1000);
        }
    }, [location]);

    // Function to check if browser is in fullscreen mode
    const isBrowserFullscreen = () => !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    );

    // Handle fullscreen toggle
    const handleFullscreen = async () => {
        try {
            if (!isBrowserFullscreen()) {
                await document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                }
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    // Effect to maintain fullscreen state on refresh and handle F11
    useEffect(() => {
        const handleFullscreenChange = () => {
            const fullscreenState = isBrowserFullscreen();
            setFullscreen(fullscreenState);
        };

        // Handle F11 key
        const handleKeyDown = (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                handleFullscreenChange();
            }
        };

        // Add event listeners for all browser variants
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyDown);

        // Check initial state
        handleFullscreenChange();

        // Remove automatic fullscreen restoration
        // Only allow fullscreen through user interaction

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [setFullscreen]);

    return (
        <>
            <nav className={`${isDarkMode ? 'bg-gray-800 text-white border-b border-gray-700' : 'bg-gray-100 text-gray-800 shadow-lg shadow-gray-400/50 shadow-b-lg border-b border-gray-200'} transition-colors duration-300`}>
                <div className="container mx-auto">
                    <div className="h-16 flex items-center">
                        {/* Left section - Menu Button or Home Button */}   
                        <div className="w-16 sm:w-[180px] md:w-[240px] flex items-center pl-4 sm:pl-6">
                            {isAuthenticated ? (
                                <button
                                    className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} focus:outline-none transition-colors duration-200`}
                                    onClick={toggleSidebar}
                                >
                                    <FaBars className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                            ) : (
                                <button
                                    className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} focus:outline-none transition-colors duration-200`}
                                    onClick={() => navigate('/')}
                                >
                                    <FaHome className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                            )}
                        </div>

                        {/* Center section - Logo */}
                        <div className="flex-1 flex justify-center">
                            <a 
                                href="#" 
                                onClick={handleLogoClick}
                                className="text-xl sm:text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity duration-200"
                            >
                                CodeSpace
                            </a>
                        </div>

                        {/* Right section - Theme Toggle */}
                        <div className="w-16 sm:w-[180px] md:w-[240px] flex justify-end pr-4 sm:pr-6">
                            <div className="hidden sm:flex items-center space-x-3">
                                {/* Fullscreen Toggle */}
                                <button
                                    onClick={handleFullscreen}
                                    className={`focus:outline-none transition-colors duration-200 p-1 rounded-lg
                                        ${isDarkMode 
                                            ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                                            : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'}`}
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isBrowserFullscreen() ? (
                                        <FaCompress className="h-4 w-4 sm:h-5 sm:w-5" />
                                    ) : (
                                        <FaExpand className="h-4 w-4 sm:h-5 sm:w-5" />
                                    )}
                                </button>

                                {/* Existing Theme Toggle */}
                                <FaSun className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gray-500' : 'text-yellow-500'}`} />
                                <label className="switch relative inline-block w-12 sm:w-14 h-6 sm:h-7">
                                    <input
                                        type="checkbox"
                                        className="opacity-0 w-0 h-0"
                                        checked={isDarkMode}
                                        onChange={toggleDarkMode}
                                    />
                                    <span 
                                        className={`
                                            slider absolute cursor-pointer inset-0
                                            ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}
                                            transition-all duration-300 rounded-full
                                            before:absolute before:h-4 before:w-4 sm:before:h-5 sm:before:w-5
                                            before:left-1 before:bottom-1 before:bg-white
                                            before:transition-all before:duration-300 before:rounded-full
                                            before:transform
                                            ${isDarkMode ? 'before:translate-x-6 sm:before:translate-x-7' : 'before:translate-x-0'}
                                        `}
                                    ></span>
                                </label>
                                <FaMoon className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                            </div>

                            {/* Mobile Theme Toggle */}
                            <div className="sm:hidden flex items-center space-x-2">
                                <button
                                    onClick={handleFullscreen}
                                    className="focus:outline-none p-1"
                                    aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? (
                                        <FaCompress className="h-5 w-5" />
                                    ) : (
                                        <FaExpand className="h-5 w-5" />
                                    )}
                                </button>
                                <button
                                    className="focus:outline-none"
                                    onClick={toggleDarkMode}
                                    aria-label="Toggle theme"
                                >
                                    {isDarkMode ? (
                                        <FaSun className="h-5 w-5 text-yellow-500" />
                                    ) : (
                                        <FaMoon className="h-5 w-5 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            {isAuthenticated && (
                <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} isDarkMode={isDarkMode} />
            )}
        </>
    );
};

export default Navbar;