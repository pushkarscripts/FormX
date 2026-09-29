import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

export default function Navbar() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  const linkStyle = (path) =>
    `px-3 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all select-none border-2 ${
      isActive(path)
        ? 'border-black bg-[#00f0ff] text-black shadow-[2px_2px_0_#121212]'
        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[2px_2px_0_#121212]'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-[#f8f8f5]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 border-2 border-black bg-[#00f0ff] flex items-center justify-center font-mono font-black text-xl text-black shadow-brutal-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal transition-all">
            δ
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-2xl tracking-tighter text-black uppercase leading-none">
              FormX
            </span>
            <span className="font-mono text-[9px] font-bold text-neutral-500 tracking-widest uppercase">
              FLAT Automata Engine
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className={linkStyle('/')}>
            Home
          </Link>
          <Link to="/docs" className={linkStyle('/docs')}>
            Docs
          </Link>

          {admin ? (
            <>
              <Link to="/dashboard" className={linkStyle('/dashboard')}>
                Dashboard
              </Link>
              <Button to="/forms/new" variant="primary" size="sm" className="ml-2">
                + Create Form
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                className="ml-1 text-neutral-700"
              >
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkStyle('/login')}>
                Log In
              </Link>
              <Button to="/register" variant="primary" size="sm" className="ml-2">
                Get Started ➔
              </Button>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 border-2 border-black bg-white flex flex-col items-center justify-center gap-1 shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Toggle menu"
          >
            <span className={`w-5 h-0.5 bg-black transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-5 h-0.5 bg-black ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-black transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-white p-4 space-y-3 shadow-brutal-lg">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={linkStyle('/')}
            >
              Home
            </Link>
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className={linkStyle('/docs')}
            >
              Documentation & Syntax
            </Link>

            {admin ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={linkStyle('/dashboard')}
                >
                  Dashboard
                </Link>
                <Link
                  to="/forms/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-bold uppercase tracking-wider bg-[#00f0ff] border-2 border-black shadow-brutal-sm"
                >
                  + Create Form
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2 font-bold uppercase tracking-wider bg-white border-2 border-black shadow-brutal-sm text-red-600"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={linkStyle('/login')}
                >
                  Admin Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-bold uppercase tracking-wider bg-[#00f0ff] border-2 border-black shadow-brutal-sm text-black"
                >
                  Get Started ➔
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
