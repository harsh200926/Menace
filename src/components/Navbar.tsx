import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-[#0f172a] text-white p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            {/* Logo/brand */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold">GrowthWiz</Link>
            </div>
            
            {/* Primary navigation */}
            <div className="hidden md:flex space-x-4 items-center">
              <Link
                to="/"
                className={`hover:text-[#60a5fa] transition duration-300 ${
                  activeLink === '/' ? 'text-[#60a5fa] border-b-2 border-[#60a5fa]' : ''
                }`}
                onClick={() => setActiveLink('/')}
              >
                Dashboard
              </Link>
              <Link
                to="/journal"
                className={`hover:text-[#60a5fa] transition duration-300 ${
                  activeLink === '/journal' ? 'text-[#60a5fa] border-b-2 border-[#60a5fa]' : ''
                }`}
                onClick={() => setActiveLink('/journal')}
              >
                Journal
              </Link>
              <Link
                to="/todos"
                className={`hover:text-[#60a5fa] transition duration-300 ${
                  activeLink === '/todos' ? 'text-[#60a5fa] border-b-2 border-[#60a5fa]' : ''
                }`}
                onClick={() => setActiveLink('/todos')}
              >
                Tasks
              </Link>
              {/* Debug link */}
              <a
                href="/debug.html"
                className="hover:text-[#60a5fa] transition duration-300 text-yellow-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Debug Tasks
              </a>
            </div>
          </div>
          
          {/* Secondary navigation (Settings) */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/settings"
              className={`p-2 rounded-md hover:bg-gray-700 transition duration-300 ${
                activeLink === '/settings' ? 'bg-gray-700' : ''
              }`}
              onClick={() => setActiveLink('/settings')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="outline-none mobile-menu-button"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} mt-4`}>
          <div className="flex flex-col space-y-2 p-2 bg-gray-800 rounded-md">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md ${
                activeLink === '/' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => {
                setActiveLink('/');
                setIsMobileMenuOpen(false);
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/journal"
              className={`block px-3 py-2 rounded-md ${
                activeLink === '/journal' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => {
                setActiveLink('/journal');
                setIsMobileMenuOpen(false);
              }}
            >
              Journal
            </Link>
            <Link
              to="/todos"
              className={`block px-3 py-2 rounded-md ${
                activeLink === '/todos' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => {
                setActiveLink('/todos');
                setIsMobileMenuOpen(false);
              }}
            >
              Tasks
            </Link>
            <a
              href="/debug.html"
              className="block px-3 py-2 rounded-md text-yellow-300 hover:bg-gray-700 hover:text-yellow-200"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              Debug Tasks
            </a>
            <Link
              to="/settings"
              className={`block px-3 py-2 rounded-md ${
                activeLink === '/settings' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => {
                setActiveLink('/settings');
                setIsMobileMenuOpen(false);
              }}
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 