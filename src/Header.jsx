import { Link } from 'react-router-dom'
import LoginButton from './components/LoginButton'
import { useAuth } from './auth/useAuth'
import logoGreen from './assets/MemorixLogoGreen.png'

function Header() {
  const { isAuthenticated } = useAuth();
  
  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-16 py-4 md:py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logoGreen} alt="Memorix" className="h-7 sm:h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {isAuthenticated ? (
            <Link to="/dashboard" className="text-white text-xs sm:text-sm font-semibold hover:text-[#00ff94] transition-colors whitespace-nowrap">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/share" className="text-white text-xs sm:text-sm font-semibold hover:text-[#00ff94] transition-colors whitespace-nowrap">
                Community
              </Link>
            </>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  )
}

export default Header 