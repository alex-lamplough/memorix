import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'
import { setPageTitle } from '../utils/title-utils'

function Privacy() {
  useEffect(() => {
    setPageTitle('Privacy Policy')
  }, [])

  return (
    <PublicLayout title="Privacy Policy">
      <div className="max-w-4xl mx-auto bg-[#18092a]/60 rounded-xl p-8 border border-gray-800/30 shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="text-white/80 space-y-6">
          <p className="mb-4">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Introduction</h2>
            <p>
              Welcome to Memorix ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and while using our services.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our flashcard learning platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Information We Collect</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Personal Information</h3>
            <p>When you register for an account or use our services, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Name and email address</li>
              <li>Profile information (such as display name and profile picture)</li>
              <li>Authentication information from third-party providers if you choose to sign in with services like Google or Facebook</li>
              <li>Billing and payment information if you purchase a premium subscription</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Study and Usage Data</h3>
            <p>To provide and improve our services, we collect:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Content of flashcards and study decks you create</li>
              <li>Study session data, including timing, performance, and progress</li>
              <li>Feature usage and interaction patterns</li>
              <li>Preferences and settings you configure in the app</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Technical Information</h3>
            <p>We automatically collect certain information when you use our platform:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>IP address and device information</li>
              <li>Browser type and settings</li>
              <li>Operating system information</li>
              <li>Log data and usage statistics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and manage your account</li>
              <li>Personalize your learning experience</li>
              <li>Send you important notifications about your account or service changes</li>
              <li>Communicate with you about new features, offers, and educational content</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Protect against unauthorized access and ensure the security of our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Sharing Your Information</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><span className="font-medium">Service Providers:</span> Third-party vendors who help us provide and improve our services</li>
              <li><span className="font-medium">Business Partners:</span> Companies we work with to offer integrated or joint products and services</li>
              <li><span className="font-medium">Legal Requirements:</span> When required by law, legal process, or to protect our rights</li>
              <li><span className="font-medium">With Your Consent:</span> When you've given us permission to share your information</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, accidental loss, alteration, or destruction. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Your Rights and Choices</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Accessing, correcting, or deleting your personal information</li>
              <li>Restricting or objecting to certain processing activities</li>
              <li>Requesting a copy of your personal data</li>
              <li>Withdrawing consent for optional processing</li>
            </ul>
            <p className="mt-3">
              You can manage many aspects of your personal information directly through your account settings or by contacting us at <a href="mailto:privacy@getmemorix.app" className="text-[#00ff94] hover:underline">privacy@getmemorix.app</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings, although restricting cookies may impact the functionality of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can take appropriate action.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at <a href="mailto:privacy@getmemorix.app" className="text-[#00ff94] hover:underline">privacy@getmemorix.app</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800/30 text-center">
          <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-[#00ff94] hover:underline mr-6">Terms of Service</Link>
          <Link to="/" className="text-[#00ff94] hover:underline">Back to Home</Link>
        </div>
      </div>
    </PublicLayout>
  )
}

export default Privacy 