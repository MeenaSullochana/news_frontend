import { Helmet } from 'react-helmet-async';

const StaticPage = ({ title, children }) => (
  <>
    <Helmet>
      <title>{title} - The Great India News</title>
    </Helmet>
    <div className="container-news py-8 max-w-3xl">
      <h1 className="text-3xl font-bold font-headline mb-6">{title}</h1>
      <div className="text-gray-700 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  </>
);

export const Contact = () => (
  <StaticPage title="Contact Us">
    <p><strong>Email:</strong> contact@thegreatindianews.com</p>
    <p><strong>Phone:</strong> +91 9876543210</p>
    <p><strong>Address:</strong> Chennai, Tamil Nadu, India</p>
  </StaticPage>
);

export const PrivacyPolicy = () => (
  <StaticPage title="Privacy Policy">
    <p>
      This document clarifies how The Great India News (thegreatindianews.com) and its related mobile
      applications collect, process, and safeguard your personal details. We are strictly committed to
      keeping all reader metrics safe and securely protected.
    </p>

    <h2 className="text-xl font-bold mt-8 mb-3">1. Data Collected on Website &amp; Mobile App</h2>
    <p className="mb-3">
      We collect information to customize and personalize your news tracking experience:
    </p>
    <ul className="list-disc pl-6 space-y-2">
      <li>
        <strong>Profile Information:</strong> When you register an account, comment, or interact with our
        members area we collect your name, email address, password, and preferences.
      </li>
      <li>
        <strong>Offline Storage &amp; Read Milestones:</strong> We measure and record connection parameters
        and read engagements (such as our 20s, 45s, and 90s milestones) locally inside high-performance
        databases to serve you cached stories when offline.
      </li>
      <li>
        <strong>Device &amp; Network Data:</strong> Connection attributes including IP address, browser type,
        device fingerprints, operating system, and system locales are gathered automatically.
      </li>
    </ul>

    <h2 className="text-xl font-bold mt-8 mb-3">2. Usage, Sharing, and Protection of Your Data</h2>
    <p className="mb-3">
      Your details are exclusively used to optimize client operations and support independent content.
      We enforce these criteria:
    </p>
    <ul className="list-disc pl-6 space-y-2">
      <li>
        <strong>Personalization:</strong> Tuning display sizes, localized spot rates (e.g. silver and gold
        rates), and curated newsletter digests.
      </li>
      <li>
        <strong>Security Measures:</strong> We apply secure industry SSL/TLS encryption. All critical
        databases are protected behind tokenized cloud firewall controls.
      </li>
      <li>
        <strong>Third-Party Sharing (Restricted):</strong> We integrate with trusted services only. We share
        non-personally identifiable browser cookies with Google AdSense (for banner and vignette
        advertisement delivery) and Google Analytics (for traffic telemetry reporting). We do NOT sell or
        syndicate details to third parties.
      </li>
    </ul>

    <h2 className="text-xl font-bold mt-8 mb-3">3. Data and Mobile Account Deletion Request</h2>
    <p>
      In strict accordance with the Google Play Store App Developer Policies, users can request the deletion
      of their accounts and associated personal records at any time. To delete your data, simply use the
      Account &amp; Security panel inside the app dashboard, or send a request email to{' '}
      <a href="mailto:grievance@thegreatindianews.com" className="text-brand-600 hover:underline">
        grievance@thegreatindianews.com
      </a>{' '}
      with the subject line &ldquo;Data Deletion Request&rdquo;. All personal registration details, comments
      history, and read logs will be permanently scrubbed from our active cloud and offline databases within
      14 business days.
    </p>

    <h2 className="text-xl font-bold mt-8 mb-3">4. Cookie Control &amp; Opt-out Mechanisms</h2>
    <p>
      This site utilizes browser cookies to save localized preference variables (such as custom font
      selections, bento layout density, and theme preferences). You can easily specify cookie handling within
      your browser settings, or deny specific tracking by managing settings inside our monetization hubs.
    </p>

    <h2 className="text-xl font-bold mt-8 mb-3">5. Legal Redressal Under IT Rules 2021 (India)</h2>
    <p>
      As an Indian digital publisher, we correspond directly with local IT standards. Any reader grievance
      can be registered with our appointed Grievance Officer, Mr. R. Bala Murugan, at{' '}
      <a href="mailto:grievance@thegreatindianews.com" className="text-brand-600 hover:underline">
        grievance@thegreatindianews.com
      </a>
      . Resolution occurs within 15 days of formal acknowledgement.
    </p>
  </StaticPage>
);

export const Terms = () => (
  <StaticPage title="Terms of Use">
    <p>
      Please read these Terms of Service carefully before utilizing The Great India News services. By
      accessing our news updates, you fully agree to follow these legal requirements.
    </p>

    <h2 className="text-xl font-bold mt-8 mb-3">1. Acceptable Use of Our Services</h2>
    <p className="mb-3">
      You correspond strictly with standard community rules when posting comments:
    </p>
    <ul className="list-disc pl-6 space-y-2">
      <li>No hate speech, defaming language, or spamming is permitted.</li>
      <li>All intellectual content on the portal remains the sole property of our Bureau.</li>
    </ul>

    <h2 className="text-xl font-bold mt-8 mb-3">2. Subscription, Account Security &amp; Registration</h2>
    <p>
      Users can register accounts to preserve bookmark folders and track engagement. Keep passwords secure.
    </p>

    <h2 className="text-xl font-bold mt-8 mb-3">3. Indemnification and Liability Disclaimers</h2>
    <p>
      Our news archives are served for informational purposes only. The Bureau is not liable for structural
      updates.
    </p>
  </StaticPage>
);

export const EditorialPolicy = () => (
  <StaticPage title="Editorial Policy">
    <p>
      The Great India News is built upon double-layered validation and trusted, ground-zero journalism.
    </p>

    <h2 className="text-xl font-bold mt-8 mb-3">1. Double-Layered Story Verification</h2>
    <p className="mb-3">
      Our reporting stack is certified by rigorous secondary audits:
    </p>
    <ul className="list-disc pl-6 space-y-2">
      <li>All claims must have double-layered citation mappings.</li>
      <li>
        No sensationalism or anonymous reporting is accepted unless vetted by the Editor-in-Chief.
      </li>
    </ul>

    <h2 className="text-xl font-bold mt-8 mb-3">2. Retraction &amp; Error Correction Timelines</h2>
    <p>
      We believe in full transparency. When mistakes are verified, we commit to publishing clear
      corrections within 24 business hours.
    </p>
  </StaticPage>
);

export const CorrectionPolicy = () => (
  <StaticPage title="Correction Policy">
    <p>We are committed to accuracy. If you find an error in our reporting, please contact us at corrections@thegreatindianews.com. We will review and publish corrections promptly.</p>
  </StaticPage>
);

export const Copyright = () => (
  <StaticPage title="Copyright">
    <p>© 2026 The Great India News. All content, including text, images, and videos, is protected by copyright law. Unauthorized reproduction is prohibited.</p>
  </StaticPage>
);

export const Grievance = () => (
  <StaticPage title="Grievance Redressal">
    <p>If you have any grievances regarding our content or services, please write to grievance@thegreatindianews.com. We will address your concerns within 15 working days.</p>
  </StaticPage>
);
