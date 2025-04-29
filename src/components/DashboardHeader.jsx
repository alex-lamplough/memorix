import { useState } from 'react'
import { useMediaQuery } from '@mui/material'

// Icons
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

function DashboardHeader({ title, actionButton, searchEnabled = false, filterEnabled = false }) {
  const isMobile = useMediaQuery('(max-width:640px)');
  
  return (
    <div className="py-4 md:py-6 border-b border-gray-800/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
          
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            {searchEnabled && (
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder={isMobile ? `Search...` : `Search ${title.toLowerCase()}...`}
                  className="bg-[#18092a]/60 text-white rounded-lg pl-10 pr-3 py-2 border border-gray-800/30 text-sm focus:outline-none focus:border-[#00ff94]/50 w-full sm:w-56"
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
              <button className="bg-[#00ff94]/10 text-[#00ff94] px-3 md:px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center gap-1 md:gap-2 text-sm md:text-base whitespace-nowrap">
                <AddCircleOutlineIcon fontSize={isMobile ? "small" : "medium"} />
                <span>{isMobile && actionButton.length > 10 ? 'Create' : actionButton}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader 