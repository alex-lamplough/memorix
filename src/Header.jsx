import { Link } from 'react-router-dom'
import LoginButton from './components/LoginButton'
import { useAuth } from './auth/useAuth'
import logoGreen from './assets/MemorixLogoGreen.png'

function Header() {
  const { isAuthenticated } = useAuth();
  
  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logoGreen} alt="Memorix" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <Link to="/dashboard" className="text-white text-sm font-semibold hover:text-[#00ff94] transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/share" className="text-white text-sm font-semibold hover:text-[#00ff94] transition-colors">
                Community Decks
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