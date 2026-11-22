import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];
  const routeLinks = [
    { name: 'Master FAQ', to: '/faq/master' },
    { name: 'Client FAQ', to: '/faq/client' },
    { name: 'Troubleshooting', to: '/faq/troubleshooting' },
  ];

  const handleNavClick = (event, href) => {
    if (!href || href === '#') return;
    event.preventDefault();
    setIsMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'nav-glass' : 'bg-transparent'
      }`}
    >
      <nav className="container-apple py-5">
        <div className="flex items-center justify-between">
          <motion.a
            href="#"
            className="text-2xl font-bold tracking-tight flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="w-9 h-9 rounded-full bg-slotta-purple flex items-center justify-center">
              <span className="text-white text-lg font-bold leading-none">Ø</span>
            </span>
            <span className="text-slotta-ink">SLØTTA</span>
          </motion.a>

          <div className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slotta-ink-soft hover:text-slotta-purple transition-colors duration-200"
                onClick={(event) => handleNavClick(event, link.href)}
              >
                {link.name}
              </a>
            ))}
            {routeLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                className="text-sm font-medium text-slotta-ink-soft hover:text-slotta-purple transition-colors duration-200"
                onClick={() => navigate(link.to)}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button
              className="px-5 py-2.5 rounded-full font-medium text-sm text-slotta-purple slotta-button-outline"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
            <button
              className="px-5 py-2.5 rounded-full font-medium text-sm text-white slotta-button"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
            </button>
          </div>

          <button
            className="md:hidden text-slotta-ink"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-5 space-y-4"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-sm font-medium text-slotta-ink-soft hover:text-slotta-purple transition-colors py-2"
                  onClick={(event) => handleNavClick(event, link.href)}
                >
                  {link.name}
                </a>
              ))}
              {routeLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  className="block text-left text-sm font-medium text-slotta-ink-soft hover:text-slotta-purple transition-colors py-2"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(link.to);
                  }}
                >
                  {link.name}
                </button>
              ))}
              <div className="space-y-3 pt-4">
                <button
                  className="w-full px-5 py-2.5 rounded-full font-medium text-sm text-slotta-purple slotta-button-outline"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </button>
                <button
                  className="w-full px-5 py-2.5 rounded-full font-medium text-sm text-white slotta-button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Start Free Trial
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Navigation;
