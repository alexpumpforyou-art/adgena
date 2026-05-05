'use client';

import Link from 'next/link';
import styles from '../../privacy/legal.module.css';

export default function PrivacyPageEn() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/en" className={styles.headerLogo}>
          <img src="/logo-icon.webp" alt="" width={28} height={28} />
          <span>Adgena</span>
        </Link>
        <Link href="/en" className={styles.headerBtn}>← Home</Link>
      </header>

      <main className={styles.main}>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: April 29, 2026</p>

        <section>
          <h2>1. General Provisions</h2>
          <p>
            This Privacy Policy (hereinafter — "Policy") defines the procedures for processing
            and protecting personal data of users of the Adgena service (hereinafter — "Service"),
            located at <a href="https://adgena.pro">https://adgena.pro</a>.
          </p>
          <p>
            Data controller: self-employed Denis Eduardovich Orlov, TIN 665903565502
            <br />Contact email: <a href="mailto:info@adgena.pro">info@adgena.pro</a>
          </p>
          <p>
            By using the Service, you unconditionally agree to this Policy
            and the data processing terms described herein.
          </p>
        </section>

        <section>
          <h2>2. Data We Collect</h2>
          <p>The following data may be processed when you use the Service:</p>
          <ul>
            <li><strong>Registration data:</strong> email address, name (including data obtained via Google OAuth).</li>
            <li><strong>Payment data:</strong> transaction information is processed by Robokassa. We do not store bank card data.</li>
            <li><strong>Uploaded images:</strong> product photos that you upload for content generation.</li>
            <li><strong>Generated content:</strong> images created by the Service at your request.</li>
            <li><strong>Technical data:</strong> IP address, browser type, cookies, Service usage data.</li>
            <li><strong>Support requests:</strong> subject and text of support tickets.</li>
          </ul>
        </section>

        <section>
          <h2>3. Purposes of Data Processing</h2>
          <ul>
            <li>Providing access to Service functionality.</li>
            <li>User identification and authentication.</li>
            <li>Payment processing and subscription management.</li>
            <li>Technical support and handling inquiries.</li>
            <li>Improving Service quality and user experience.</li>
            <li>Compliance with applicable legislation.</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Storage and Security</h2>
          <p>
            Personal data is stored on secure servers. Access to data is restricted and granted
            only to authorized personnel. We use encryption (HTTPS/TLS), password hashing,
            and other organizational and technical measures to protect data.
          </p>
          <p>
            Uploaded images are stored in cloud storage and used exclusively
            for processing content generation requests.
          </p>
        </section>

        <section>
          <h2>5. Third-Party Data Sharing</h2>
          <p>We may share data with the following categories of recipients:</p>
          <ul>
            <li><strong>Payment systems</strong> (Robokassa) — for payment processing.</li>
            <li><strong>AI service providers</strong> — for image generation (only uploaded photos are shared, without personal data).</li>
            <li><strong>Government authorities</strong> — upon lawful request.</li>
          </ul>
          <p>We do not sell or share personal data for advertising purposes.</p>
        </section>

        <section>
          <h2>6. Cookies</h2>
          <p>
            The Service uses cookies to maintain authorization sessions and ensure proper functionality.
            You can disable cookies in your browser settings, however this may limit
            Service functionality.
          </p>
        </section>

        <section>
          <h2>7. User Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request information about the processing of your data.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data and account.</li>
            <li>Withdraw consent to data processing.</li>
          </ul>
          <p>
            To exercise your rights, send a request to <a href="mailto:info@adgena.pro">info@adgena.pro</a>.
          </p>
        </section>

        <section>
          <h2>8. Policy Changes</h2>
          <p>
            We reserve the right to modify this Policy.
            The current version is always available at <a href="https://adgena.pro/en/privacy">adgena.pro/en/privacy</a>.
            Continued use of the Service after changes constitutes acceptance of the updated Policy.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Adgena</p>
      </footer>
    </div>
  );
}
