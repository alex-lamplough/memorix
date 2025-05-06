import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'
import { setPageTitle } from '../utils/title-utils'
import PartnershipModal from '../components/PartnershipModal'

function ContentCreators() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  useEffect(() => {
    setPageTitle('Partnerships')
    
    // Scroll to top of the page when component mounts
    window.scrollTo(0, 0)
  }, [])
  
  const openPartnershipModal = () => {
    setIsModalOpen(true)
  }
  
  const closePartnershipModal = () => {
    setIsModalOpen(false)
  }

  return (
    <PublicLayout title="Partnerships">
      <div className="max-w-4xl mx-auto bg-[#18092a]/60 rounded-xl p-8 border border-gray-800/30 shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-6">For Creators & Community Builders</h1>
        <div className="text-white/80 space-y-8">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Create Exclusive Experiences for Your Community</h2>
            <p className="mb-4">
              Memorix is empowering creators, coaches, and community leaders to build exclusive member groups with interactive content. Whether you're a language tutor, trivia host, fitness instructor, or content creator - bring your community together with engaging materials they can't get anywhere else.
            </p>
            <p>
              Our platform gives you the tools to create, monetize, and share customized flashcards, quizzes, and activities designed specifically for your unique audience - turning casual followers into dedicated members of your community.
            </p>
          </section>

          <section className="bg-gradient-to-r from-[#2E0033] to-[#1b1b2f] p-6 rounded-lg border border-[#00ff94]/30 mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Coming Soon: Exclusive Community Hubs</h2>
            <p className="mb-4">
              We're building powerful tools that allow you to create members-only hubs with exclusive interactive content designed specifically for your audience and community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">Private Communities</h3>
                <p className="text-white/70 text-sm">Create invitation-only spaces where your followers or clients can access exclusive content that reinforces your brand and expertise.</p>
              </div>
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">Custom Subscriptions</h3>
                <p className="text-white/70 text-sm">Set your own pricing tiers and subscription models to monetize your unique content in a way that works for your business.</p>
              </div>
            </div>
            <p className="mt-4 text-white/90 text-center">
              <span className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1 rounded-md border border-[#00ff94]/30 text-sm">
                Apply now to be among the first creators to access these features!
              </span>
            </p>
          </section>

          <section className="mb-8 bg-gradient-to-r from-[#2E0033] to-[#1b1b2f] p-6 rounded-lg border border-[#00ff94]/30">
            <h2 className="text-xl font-semibold mb-4 text-[#00ff94]">Endless Possibilities</h2>
            <p className="text-white/80 mb-5">
              Create engaging, interactive content for virtually any purpose - from traditional education to entertainment, hobbies, and special interests:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🌐 Language Learning</h3>
                <p className="text-white/70 text-sm">Create vocabulary sets, grammar exercises, and conversation prompts for language students.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">📚 Academic Subjects</h3>
                <p className="text-white/70 text-sm">Develop specialized study materials for math, science, history, or any academic subject.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🧠 Test Preparation</h3>
                <p className="text-white/70 text-sm">Create comprehensive quiz sets for standardized tests like IELTS, TOEFL, SAT, MCAT, or professional certifications.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🎮 Trivia & Games</h3>
                <p className="text-white/70 text-sm">Host online trivia nights with custom question sets about movies, sports, music, or any topic.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">💼 Team Building</h3>
                <p className="text-white/70 text-sm">Create fun icebreakers and activities for remote or in-person workplace team building.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🎭 Fan Communities</h3>
                <p className="text-white/70 text-sm">Build quizzes for fandoms like Harry Potter, Marvel, Star Wars, or anime communities.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🍷 Tasting Notes</h3>
                <p className="text-white/70 text-sm">Create flashcards for wine, coffee, or food tasting clubs to learn flavor profiles.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🏋️ Fitness Challenges</h3>
                <p className="text-white/70 text-sm">Design workout cards and fitness challenges for personal training clients.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">👨‍👩‍👧‍👦 Family Fun</h3>
                <p className="text-white/70 text-sm">Create personalized memory games and quizzes about family history or inside jokes.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🎵 Music Theory</h3>
                <p className="text-white/70 text-sm">Develop chord recognition, ear training, and theory flashcards for music students.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">📱 Social Media</h3>
                <p className="text-white/70 text-sm">Create viral quiz content for your social media audience and grow your following.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-4 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🎨 Creative Prompts</h3>
                <p className="text-white/70 text-sm">Generate writing prompts, design challenges, or artistic inspiration for creative communities.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Why Create on Memorix?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-[#18092a]/80 p-6 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🌟 Strengthen Your Community</h3>
                <p className="text-white/70">Create a branded interactive space where your followers can engage with exclusive content that reinforces your unique value proposition.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-6 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">💰 New Revenue Streams</h3>
                <p className="text-white/70">Diversify your income by offering premium interactive experiences alongside your existing content, products, or services.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-6 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">🛠️ Content Creation Magic</h3>
                <p className="text-white/70">Our AI-powered tools help you rapidly transform your ideas into engaging flashcards, quizzes, and activities with minimal effort.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-6 rounded-lg border border-gray-800/50">
                <h3 className="font-bold text-white mb-2">📊 Audience Insights</h3>
                <p className="text-white/70">Gain valuable data on how your community engages with your content to refine your offerings and grow your audience.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">How It Works</h2>
            <div className="space-y-4">
              <div className="flex">
                <div className="mr-4 bg-[#00ff94]/10 w-8 h-8 flex items-center justify-center rounded-full text-[#00ff94] border border-[#00ff94]/30 flex-shrink-0">1</div>
                <div>
                  <h3 className="font-bold mb-1">Apply to our creator program</h3>
                  <p className="text-white/70">Tell us about your community, content style, and the interactive experiences you want to create.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 bg-[#00ff94]/10 w-8 h-8 flex items-center justify-center rounded-full text-[#00ff94] border border-[#00ff94]/30 flex-shrink-0">2</div>
                <div>
                  <h3 className="font-bold mb-1">Get early access</h3>
                  <p className="text-white/70">Approved creators will receive priority access to our platform and upcoming community features.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 bg-[#00ff94]/10 w-8 h-8 flex items-center justify-center rounded-full text-[#00ff94] border border-[#00ff94]/30 flex-shrink-0">3</div>
                <div>
                  <h3 className="font-bold mb-1">Build your content library</h3>
                  <p className="text-white/70">Develop flashcard sets, quizzes, and interactive activities that align with your brand and audience interests.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 bg-[#00ff94]/10 w-8 h-8 flex items-center justify-center rounded-full text-[#00ff94] border border-[#00ff94]/30 flex-shrink-0">4</div>
                <div>
                  <h3 className="font-bold mb-1">Launch your community hub</h3>
                  <p className="text-white/70">Invite your audience to join your exclusive space and enjoy your premium interactive content.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-[#2E0033] to-[#1b1b2f] p-8 rounded-lg border border-[#00ff94]/30 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Grow Your Community?</h2>
            <p className="text-white/80 mb-6">Join our network of creators, coaches, and community builders. Apply now to be first in line when our community features launch.</p>
            <button 
              onClick={openPartnershipModal}
              className="bg-[#00ff94]/10 text-[#00ff94] px-8 py-3 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-block font-medium"
            >
              Apply for Early Access
            </button>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-[#18092a]/80 p-6 rounded-lg border border-gray-800/50">
                <h3 className="font-bold mb-2">When will these features be available?</h3>
                <p className="text-white/70">We're actively developing our creator platform with plans to launch in phases. Early access will begin in the coming months, with priority given to approved applicants.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-6 rounded-lg border border-gray-800/50">
                <h3 className="font-bold mb-2">How will pricing work?</h3>
                <p className="text-white/70">As a creator, you'll set your own pricing tiers for member access. Memorix takes a small platform fee, giving you the majority of revenue generated through your community hub.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-6 rounded-lg border border-gray-800/50">
                <h3 className="font-bold mb-2">What content formats will be supported?</h3>
                <p className="text-white/70">Initially, you'll be able to create flashcard sets, interactive quizzes, and custom activities. We'll regularly add new formats based on creator feedback and community needs.</p>
              </div>
              
              <div className="bg-[#18092a]/80 p-6 rounded-lg border border-gray-800/50">
                <h3 className="font-bold mb-2">How does this complement my existing platforms?</h3>
                <p className="text-white/70">Memorix provides interactive engagement that most content platforms lack. It's designed to complement your existing social media, website, or course offerings with unique interactive experiences that keep your audience engaged.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800/30 text-center">
          <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#00ff94] hover:underline mr-6">Privacy Policy</Link>
          <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-[#00ff94] hover:underline mr-6">Terms of Service</Link>
          <Link to="/" className="text-[#00ff94] hover:underline">Back to Home</Link>
        </div>
      </div>
      
      {/* Partnership Application Modal */}
      <PartnershipModal isOpen={isModalOpen} onClose={closePartnershipModal} />
    </PublicLayout>
  )
}

export default ContentCreators 