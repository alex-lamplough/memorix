import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'
import { setPageTitle } from '../utils/title-utils'

function Terms() {
  useEffect(() => {
    setPageTitle('Terms of Service')
  }, [])

  return (
    <PublicLayout title="Terms of Service">
      <div className="max-w-4xl mx-auto bg-[#18092a]/60 rounded-xl p-8 border border-gray-800/30 shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="text-white/80 space-y-6">
          <p className="mb-4">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Introduction</h2>
            <p>
              Welcome to Memorix. These Terms of Service ("Terms") govern your access to and use of the Memorix website, mobile applications, and services (collectively, the "Services"). Please read these Terms carefully before using our Services.
            </p>
            <p className="mt-3">
              By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Eligibility</h2>
            <p>
              You must be at least 13 years old to use our Services. If you are under 18, you must have your parent or guardian's permission to use our Services. By using our Services, you represent and warrant that you meet all eligibility requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Account Registration</h2>
            <p>
              To access certain features of our Services, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process and to keep your account information updated.
            </p>
            <p className="mt-3">
              You are responsible for safeguarding your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">User Content</h2>
            <p>
              You retain ownership of any content you create, upload, or share through our Services ("User Content"). By submitting User Content, you grant Memorix a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content in connection with providing and improving our Services.
            </p>
            <p className="mt-3">
              You represent and warrant that you own or have the necessary rights to your User Content and that it does not violate any third party's intellectual property or other rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Prohibited Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Use our Services in any manner that could interfere with, disrupt, negatively affect, or inhibit other users from fully enjoying our Services</li>
              <li>Use our Services for any illegal or unauthorized purpose</li>
              <li>Attempt to circumvent any content-filtering techniques we employ</li>
              <li>Develop or use any third-party applications that interact with our Services without our written consent</li>
              <li>Use our Services to distribute unsolicited promotional or commercial content</li>
              <li>Attempt to gain unauthorized access to other user accounts or our computer systems or networks</li>
              <li>Upload or transmit any viruses, malware, or other types of malicious software</li>
              <li>Engage in any harassment, bullying, or other conduct that violates others' rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Intellectual Property</h2>
            <p>
              The Memorix Services, including its original content, features, and functionality, are owned by Memorix and are protected by copyright, trademark, and other intellectual property laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Subscription Plans and Payment</h2>
            <p>
              We offer several subscription tiers to access premium features of our Services:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <span className="font-medium">Free Plan:</span> Basic access with limited features including community cards, basic analytics, and standard support.
              </li>
              <li>
                <span className="font-medium">Pro Plan (£7.99/month):</span> Includes all Free plan features plus unlimited flashcard & quiz creation, advanced analytics, priority support, downloadable content, and export reports.
              </li>
              <li>
                <span className="font-medium">Creator Plan:</span> Currently under development, will include additional features for content creators.
              </li>
              <li>
                <span className="font-medium">Enterprise Plan:</span> Currently under development, will include features for organizations and teams.
              </li>
            </ul>
            <p className="mt-3">
              By subscribing to a premium plan, you agree to pay the applicable fees as they become due. All subscriptions automatically renew on a monthly basis until canceled.
            </p>
            <p className="mt-3">
              We use Stripe as our payment processor. By providing payment information, you represent that you are authorized to use the payment method and agree to have your payment method charged the applicable subscription fees.
            </p>
            <p className="mt-3">
              We reserve the right to change our subscription fees upon reasonable notice. Such notice may be provided at any time by posting the changes to the Memorix website or via email.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Promotional Offers and Coupons</h2>
            <p>
              We may occasionally offer promotional discounts or coupon codes that can be applied to subscription purchases. The following terms apply to all promotions and coupon usage:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Coupon codes are valid only for the specified time period or until revoked by Memorix</li>
              <li>Coupon codes cannot be combined with other offers unless explicitly stated</li>
              <li>We reserve the right to verify eligibility for coupon codes and to cancel any subscription obtained through unauthorized coupon use</li>
              <li>Promotional pricing applies only for the specified duration of the offer, after which standard pricing will apply</li>
              <li>Refunds will not be provided for the difference between promotional and standard pricing once a promotion ends</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Subscription Changes and Cancellation</h2>
            <p>
              You may cancel your subscription at any time through your account settings page or by contacting us. If you cancel, you will continue to have access to your subscription benefits until the end of your current billing period, after which your account will revert to the Free plan.
            </p>
            <p className="mt-3">
              <span className="font-medium">Plan Changes:</span> Currently, we do not support prorated billing when switching between subscription plans. To change your subscription plan:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><span className="font-medium">Upgrading:</span> To upgrade to a higher tier, cancel your current subscription, wait until the end of your billing period, then sign up for the new plan.</li>
              <li><span className="font-medium">Downgrading to Free:</span> Simply cancel your current subscription. You'll automatically be moved to the Free plan once your billing period ends.</li>
              <li><span className="font-medium">Downgrading to another paid plan:</span> Cancel your current subscription, wait until the end of your billing period, then sign up for the new plan.</li>
            </ul>
            <p className="mt-3">
              <span className="font-medium">Refunds:</span> We do not generally provide refunds for subscription fees, except in cases where required by law or at our sole discretion. If you believe you have been charged in error, please contact us at support@getmemorix.app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Termination</h2>
            <p>
              We may terminate or suspend your account and access to our Services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
            </p>
            <p className="mt-3">
              You may terminate your account at any time by following the instructions on our Services or by contacting us. Upon termination, your right to use the Services will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Disclaimer of Warranties</h2>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-3">
              WE DO NOT GUARANTEE THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT DEFECTS WILL BE CORRECTED.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEMORIX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Changes to Terms</h2>
            <p>
              We may modify these Terms at any time by posting the revised Terms on our website. Your continued use of the Services after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-[#00ff94]">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at <a href="mailto:terms@getmemorix.app" className="text-[#00ff94] hover:underline">terms@getmemorix.app</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800/30 text-center">
          <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#00ff94] hover:underline mr-6">Privacy Policy</Link>
          <Link to="/" className="text-[#00ff94] hover:underline">Back to Home</Link>
        </div>
      </div>
    </PublicLayout>
  )
}

export default Terms 