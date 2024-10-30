import React, { useState, useEffect } from 'react';
import { FaBars, FaMoon, FaSun } from 'react-icons/fa';
import Sidebar from './Sidebar';
import useThemeStore from '.././store/useThemeStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
    const navigate = useNavigate();
    const isDarkMode = useThemeStore((state) => state.isDarkMode);
    const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

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

    return (
        <>
            <nav className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'} shadow-md transition-colors duration-300`}>
                <div className="container mx-auto">
                    <div className="h-16 flex items-center">
                        {/* Left section - Menu Button */}
                        <div className="w-16 sm:w-[180px] md:w-[240px] flex items-center pl-4 sm:pl-6">
                            {isAuthenticated && (
                                <button
                                    className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} focus:outline-none transition-colors duration-200`}
                                    onClick={toggleSidebar}
                                >
                                    <FaBars className="h-5 w-5 sm:h-6 sm:w-6" />
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
                            <button
                                className="sm:hidden focus:outline-none"
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
            </nav>
            {isAuthenticated && (
                <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} isDarkMode={isDarkMode} />
            )}
        </>
    );
};

export default Navbar;