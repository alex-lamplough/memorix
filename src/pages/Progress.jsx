import { useState } from 'react'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import StatCard from '../components/StatCard'

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

function StudyChart() {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h3 className="text-xl font-bold mb-6">Study Activity</h3>
      <div className="h-60 flex items-end gap-2 mt-4">
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="bg-[#00ff94]/30 w-full rounded-t-md h-24"></div>
          <span className="text-xs text-white/70">Mon</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="bg-[#00ff94]/30 w-full rounded-t-md h-10"></div>
          <span className="text-xs text-white/70">Tue</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="bg-[#00ff94]/30 w-full rounded-t-md h-36"></div>
          <span className="text-xs text-white/70">Wed</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="bg-[#00ff94]/30 w-full rounded-t-md h-16"></div>
          <span className="text-xs text-white/70">Thu</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="bg-[#00ff94]/30 w-full rounded-t-md h-42"></div>
          <span className="text-xs text-white/70">Fri</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="bg-[#00ff94] w-full rounded-t-md h-52"></div>
          <span className="text-xs text-white/70">Sat</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="bg-[#00ff94]/30 w-full rounded-t-md h-20"></div>
          <span className="text-xs text-white/70">Sun</span>
        </div>
      </div>
    </div>
  )
}

function StreakCalendar() {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h3 className="text-xl font-bold mb-6">Study Streak</h3>
      <div className="flex justify-center items-center h-60">
        <div className="text-center">
          <div className="text-6xl font-bold text-[#00ff94] mb-3">18</div>
          <p className="text-white/70">days in a row</p>
          <div className="flex gap-1 mt-4 justify-center">
            <div className="w-2 h-2 rounded-full bg-[#00ff94]"></div>
            <div className="w-2 h-2 rounded-full bg-[#00ff94]"></div>
            <div className="w-2 h-2 rounded-full bg-[#00ff94]"></div>
            <div className="w-2 h-2 rounded-full bg-white/20"></div>
            <div className="w-2 h-2 rounded-full bg-white/20"></div>
          </div>
          <p className="text-white/70 text-xs mt-2">Best streak: 21 days</p>
        </div>
      </div>
    </div>
  )
}

function PerformanceBySubject() {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <h3 className="text-xl font-bold mb-6">Performance by Subject</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Physics Fundamentals</span>
            <span className="text-sm font-medium">92%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full">
            <div className="h-2 bg-[#00ff94] rounded-full" style={{ width: "92%" }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Spanish Vocabulary</span>
            <span className="text-sm font-medium">78%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full">
            <div className="h-2 bg-[#00ff94] rounded-full" style={{ width: "78%" }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Web Development</span>
            <span className="text-sm font-medium">85%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full">
            <div className="h-2 bg-[#00ff94] rounded-full" style={{ width: "85%" }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">IELTS Preparation</span>
            <span className="text-sm font-medium">63%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full">
            <div className="h-2 bg-[#00ff94] rounded-full" style={{ width: "63%" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Progress() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex">
      <Sidebar activePage="progress" />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          title="Progress Analytics" 
          searchEnabled={false}
          filterEnabled={false}
        />
        
        <div className="flex-1 p-6">
          <div className="container mx-auto">
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <StudyChart />
              <StreakCalendar />
            </div>
            
            {/* Performance by subject */}
            <div className="mb-8">
              <PerformanceBySubject />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Progress 