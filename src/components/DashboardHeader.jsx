import { useState } from 'react'

// Icons
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

function DashboardHeader({ title, actionButton, searchEnabled = false, filterEnabled = false }) {
  return (
    <div className="py-6 border-b border-gray-800/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          
          <div className="flex items-center gap-3">
            {searchEnabled && (
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${title.toLowerCase()}...`}
                  className="bg-[#18092a]/60 text-white rounded-lg pl-10 pr-3 py-2 border border-gray-800/30 text-sm focus:outline-none focus:border-[#00ff94]/50 w-56"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" fontSize="small" />
              </div>
            )}
            
            {filterEnabled && (
              <button className="bg-[#18092a]/60 text-white p-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors">
                <FilterListIcon fontSize="small" />
              </button>
            )}
            
            {actionButton && (
              <button className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center gap-2">
                <AddCircleOutlineIcon fontSize="small" />
                <span>{actionButton}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader 