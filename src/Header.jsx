import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-6 flex items-center justify-between">
        <div className="text-2xl font-black tracking-widest text-white">
          M/
        </div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-white text-sm font-semibold hover:text-[#00ff94] transition-colors">
            Sign in
          </Link>
          <Link to="/signup" className="bg-white text-[#2a0845] text-sm px-4 py-1.5 rounded-lg font-bold hover:bg-[#00ff94] hover:text-[#2a0845] transition-colors shadow-sm border border-white/10">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header 