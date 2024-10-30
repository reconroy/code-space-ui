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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 items-center h-16">
                        <div className="flex justify-start">
                            {isAuthenticated && (
                                <button
                                    className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} focus:outline-none`}
                                    onClick={toggleSidebar}
                                >
                                    <FaBars className="h-6 w-6" />
                                </button>
                            )}
                        </div>

                        <div className="flex justify-center">
                            <a 
                                href="#" 
                                onClick={handleLogoClick}
                                className="text-2xl font-bold cursor-pointer"
                            >
                                CodeSpace
                            </a>
                        </div>

                        <div className="flex justify-end">
                            <div className="relative">
                                <div className="hidden sm:flex items-center">
                                    <FaSun className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-yellow-500'} mr-2`} />
                                    <label className="switch relative inline-block w-14 h-7">
                                        <input
                                            type="checkbox"
                                            className="opacity-0 w-0 h-0"
                                            checked={isDarkMode}
                                            onChange={toggleDarkMode}
                                        />
                                        <span className={`slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} transition-all duration-300 rounded-full before:absolute before:h-5 before:w-5 before:left-1 before:bottom-1 before:bg-white before:transition-all before:duration-300 before:rounded-full before:transform ${isDarkMode ? 'before:translate-x-7' : 'before:translate-x-0'}`}></span>
                                    </label>
                                    <FaMoon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} ml-2`} />
                                </div>
                                <button
                                    className="sm:hidden focus:outline-none"
                                    onClick={toggleDarkMode}
                                >
                                    {isDarkMode ? (
                                        <FaSun className="h-6 w-6 text-yellow-500" />
                                    ) : (
                                        <FaMoon className="h-6 w-6 text-gray-600" />
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