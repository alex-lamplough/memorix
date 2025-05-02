import React, { useState, useEffect } from 'react'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import Layout from '../components/Layout'

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

// Stats card component for the dashboard
function StatCard({ icon, title, value, trend, trendValue }) {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-5 border border-gray-800/30 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-[#00ff94]/10">
          {icon}
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend === 'up' ? '+' : '-'}{trendValue}%
        </div>
      </div>
      
      <div>
        <h3 className="text-white/60 text-sm mb-1">{title}</h3>
        <p className="text-white text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}

// Study chart component
function StudyChart() {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 h-full">
      <h3 className="text-lg font-bold mb-6">Study Time by Day</h3>
      
      <div className="relative pt-2">
        <div className="flex justify-between mb-1 text-xs text-white/50">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
        
        <div className="flex items-end h-32 gap-2">
          <div className="flex-1 bg-[#00ff94]/10 rounded-md" style={{ height: '40%' }}></div>
          <div className="flex-1 bg-[#00ff94]/10 rounded-md" style={{ height: '65%' }}></div>
          <div className="flex-1 bg-[#00ff94]/10 rounded-md" style={{ height: '80%' }}></div>
          <div className="flex-1 bg-[#00ff94]/10 rounded-md" style={{ height: '50%' }}></div>
          <div className="flex-1 bg-[#00ff94]/10 rounded-md" style={{ height: '30%' }}></div>
          <div className="flex-1 bg-[#00ff94]/30 rounded-md" style={{ height: '90%' }}></div>
          <div className="flex-1 bg-[#00ff94]/10 rounded-md" style={{ height: '20%' }}></div>
        </div>
        
        <div className="absolute left-0 top-0 right-0 bottom-0 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-gray-800/30 h-1/4"></div>
          <div className="border-b border-gray-800/30 h-1/4"></div>
          <div className="border-b border-gray-800/30 h-1/4"></div>
          <div className="border-b border-gray-800/30 h-1/4"></div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between">
        <div>
          <p className="text-white/50 text-xs">Total This Week</p>
          <p className="text-lg font-bold">6h 06m</p>
        </div>
        <div>
          <p className="text-white/50 text-xs">Daily Average</p>
          <p className="text-lg font-bold">52m</p>
        </div>
      </div>
    </div>
  )
}

// Study streak calendar component
function StreakCalendar() {
  const daysInMonth = 30;
  const currentStreakDays = 18;
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 h-full">
      <h3 className="text-lg font-bold mb-6">Study Streak</h3>
      
      <div className="grid grid-cols-7 gap-2">
        {[...Array(daysInMonth)].map((_, i) => {
          // Define which days have been studied (for demo purposes)
          const isStudied = i < currentStreakDays;
          const isToday = i === currentStreakDays - 1;
          
          return (
            <div 
              key={i} 
              className={`aspect-square rounded-md flex items-center justify-center text-sm
                ${isStudied 
                  ? isToday 
                    ? 'bg-[#00ff94] text-[#18092a] font-bold' 
                    : 'bg-[#00ff94]/30 text-white' 
                  : 'bg-gray-800/30 text-white/30'}`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between">
        <div>
          <p className="text-white/50 text-xs">Current Streak</p>
          <p className="text-lg font-bold">18 days</p>
        </div>
        <div>
          <p className="text-white/50 text-xs">Longest Streak</p>
          <p className="text-lg font-bold">21 days</p>
        </div>
      </div>
    </div>
  )
}

function Progress() {
  const isMobile = useMediaQuery('(max-width:768px)');
  
  return (
    <Layout
      title="Progress Analytics"
      activePage="progress"
      searchEnabled={false}
      filterEnabled={false}
    >
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard 
          icon={<CheckCircleOutlineIcon className="text-[#00ff94]" />}
          title="Cards Mastered"
          value="476"
          trend="up"
          trendValue="12"
        />
        <StatCard 
          icon={<AccessTimeIcon className="text-[#00ff94]" />}
          title="Study Time"
          value="6h 06m"
          trend="up"
          trendValue="8"
        />
        <StatCard 
          icon={<CalendarTodayIcon className="text-[#00ff94]" />}
          title="Study Days"
          value="18/30"
          trend="down"
          trendValue="5"
        />
        <StatCard 
          icon={<TrendingUpIcon className="text-[#00ff94]" />}
          title="Avg. Score"
          value="87%"
          trend="up"
          trendValue="4"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <StudyChart />
        <StreakCalendar />
      </div>
      
      {/* Performance by subject */}
      <div>
        <h3 className="text-lg font-bold mb-4">Performance by Subject</h3>
        <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/90">Mathematics</span>
                <span className="text-white/90">94%</span>
              </div>
              <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-[#00ff94]" style={{ width: '94%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/90">Biology</span>
                <span className="text-white/90">88%</span>
              </div>
              <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-[#00ff94]" style={{ width: '88%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/90">Chemistry</span>
                <span className="text-white/90">76%</span>
              </div>
              <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-[#00ff94]" style={{ width: '76%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/90">Physics</span>
                <span className="text-white/90">92%</span>
              </div>
              <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-[#00ff94]" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/90">History</span>
                <span className="text-white/90">81%</span>
              </div>
              <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-[#00ff94]" style={{ width: '81%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Progress 