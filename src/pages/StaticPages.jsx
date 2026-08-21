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

export const About = () => (
  <StaticPage title="About Us">
    <p>The Great India News (தி கிரேட் இந்தியா நியூஸ்) is a professional Tamil news portal delivering accurate, timely, and comprehensive news coverage from Tamil Nadu, India, and around the world.</p>
    <p>Our mission is to provide reliable journalism that informs, educates, and empowers our readers.</p>
  </StaticPage>
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
    <p>We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you visit our website.</p>
    <h2 className="text-xl font-bold mt-6">Information We Collect</h2>
    <p>We may collect personal information such as email addresses when you subscribe to our newsletter or contact us.</p>
    <h2 className="text-xl font-bold mt-6">How We Use Your Information</h2>
    <p>We use collected information to improve our services, send newsletters, and respond to inquiries.</p>
  </StaticPage>
);

export const Terms = () => (
  <StaticPage title="Terms of Use">
    <p>By accessing The Great India News website, you agree to these terms of use. All content is protected by copyright and may not be reproduced without permission.</p>
  </StaticPage>
);

export const EditorialPolicy = () => (
  <StaticPage title="Editorial Policy">
    <p>We adhere to the highest standards of journalism. Our editorial team verifies facts before publication and maintains independence from political and commercial influences.</p>
  </StaticPage>
);

export const CorrectionPolicy = () => (
  <StaticPage title="Correction Policy">
    <p>We are committed to accuracy. If you find an error in our reporting, please contact us at corrections@thegreatindianews.com. We will review and publish corrections promptly.</p>
  </StaticPage>
);

export const Copyright = () => (
  <StaticPage title="Copyright">
    <p>© 2024 The Great India News. All content, including text, images, and videos, is protected by copyright law. Unauthorized reproduction is prohibited.</p>
  </StaticPage>
);

export const Grievance = () => (
  <StaticPage title="Grievance Redressal">
    <p>If you have any grievances regarding our content or services, please write to grievance@thegreatindianews.com. We will address your concerns within 15 working days.</p>
  </StaticPage>
);
