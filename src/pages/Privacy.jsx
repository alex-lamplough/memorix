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
            
            <h3 className="text-lg font-medium mt-4 mb-2">Subscription and Payment Information</h3>
            <p>If you subscribe to our premium services, we collect and process:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Subscription plan details (Free, Pro, Creator, Enterprise)</li>
              <li>Transaction history and billing information</li>
              <li>Payment method details (processed and stored by our payment processor, Stripe)</li>
              <li>Coupon codes and promotional offers you use</li>
              <li>Subscription renewal dates and payment status</li>
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
              <li>Process and manage subscription payments, renewals, and cancellations</li>
              <li>Verify coupon code validity and apply discounts to your subscription</li>
              <li>Protect against unauthorized access and ensure the security of our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Sharing Your Information</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <span className="font-medium">Service Providers:</span> Third-party vendors who help us provide and improve our services, including:
                <ul className="list-disc pl-6 mt-1">
                  <li><span className="italic">Stripe</span> - For processing subscription payments. When you subscribe to our premium services, your payment information is processed directly by Stripe according to their privacy policy.</li>
                  <li>Analytics providers to help us understand how our services are used</li>
                  <li>Customer service and communication platforms</li>
                </ul>
              </li>
              <li><span className="font-medium">Business Partners:</span> Companies we work with to offer integrated or joint products and services</li>
              <li><span className="font-medium">Legal Requirements:</span> When required by law, legal process, or to protect our rights</li>
              <li><span className="font-medium">With Your Consent:</span> When you've given us permission to share your information</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide you with our services, comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
            <p className="mt-3">
              <span className="font-medium">Account Information:</span> We retain your account and profile information as long as your account is active. If you request deletion of your account, we will delete or anonymize your personal information within 30 days, except where we need to retain information for legitimate business or legal purposes.
            </p>
            <p className="mt-3">
              <span className="font-medium">Subscription Data:</span> We retain subscription and billing information for tax and accounting purposes for up to 7 years after your subscription ends.
            </p>
            <p className="mt-3">
              <span className="font-medium">Study Data:</span> If you cancel your subscription, your study data will remain accessible through your account but will be subject to the limitations of the Free plan. If you delete your account, your study data will be anonymized or deleted within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, accidental loss, alteration, or destruction. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p className="mt-3">
              For subscription and payment processing, we partner with Stripe, a PCI-DSS compliant payment processor, to ensure your payment information is handled securely. We do not store your full credit card details on our servers.
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
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than the one in which you reside. These countries may have different data protection laws than your country of residence. When we transfer your information internationally, we take steps to ensure that it receives an adequate level of protection, including through the use of Standard Contractual Clauses approved by the relevant authorities.
            </p>
            <p className="mt-3">
              By using our services, you consent to your information being transferred to and processed in these countries, including the United States where many of our service providers (including Stripe) are located.
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