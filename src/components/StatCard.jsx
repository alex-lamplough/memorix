import { useState } from 'react'

// Icons
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

function StatCard({ icon, title, value, trend, trendValue }) {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-5 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 rounded-lg bg-[#18092a]">
          {icon}
        </div>
        
        {trend && (
          <div className={`flex items-center text-xs ${trend === 'up' ? 'text-[#00ff94]' : 'text-[#ff7262]'}`}>
            {trend === 'up' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <h3 className="text-sm text-white/60">{title}</h3>
        <p className="text-xl font-bold mt-1">{value}</p>
      </div>
    </div>
  )
}

export default StatCard 