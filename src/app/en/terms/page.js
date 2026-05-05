'use client';

import Link from 'next/link';
import styles from '../../terms/legal.module.css';

export default function TermsPageEn() {
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
        <h1>Terms of Service</h1>
        <p className={styles.updated}>Last updated: April 29, 2026</p>

        <section>
          <h2>1. General Provisions</h2>
          <p>
            This document constitutes a public offer (hereinafter — "Offer") of the self-employed
            individual Denis Eduardovich Orlov, TIN 665903565502 (hereinafter — "Provider") and defines
            the terms of access to the Adgena service (hereinafter — "Service"), located at{' '}
            <a href="https://adgena.pro">https://adgena.pro</a>.
          </p>
          <p>
            By registering with the Service and/or paying for a subscription plan, you accept this Offer.
          </p>
        </section>

        <section>
          <h2>2. Subject of the Offer</h2>
          <p>
            The Provider grants the User access to an online service for generating visual content
            using artificial intelligence, including:
          </p>
          <ul>
            <li>Product photo generation in various concepts (on a model, in an interior, flat lay, etc.).</li>
            <li>Infographic product card creation for marketplaces (Wildberries, Ozon, etc.).</li>
            <li>Advertising banners and creatives (Yandex.Direct, VK, Stories).</li>
            <li>AI text generation (titles, descriptions, key features).</li>
          </ul>
        </section>

        <section>
          <h2>3. Plans and Pricing</h2>
          <table className={styles.priceTable}>
            <thead>
              <tr><th>Plan</th><th>Price</th><th>Generations</th><th>Includes</th></tr>
            </thead>
            <tbody>
              <tr><td>Free</td><td>Free</td><td>1</td><td>Basic concepts, JPG export</td></tr>
              <tr><td>Lite</td><td>$4.5</td><td>10</td><td>All concepts, all formats</td></tr>
              <tr><td>Standard</td><td>$11.5</td><td>30</td><td>All features, ad formats, improvements</td></tr>
              <tr><td>Pro</td><td>$29</td><td>80</td><td>Everything included, version history, priority</td></tr>
              <tr><td>Business</td><td>$58</td><td>200</td><td>API access, multi-users, Brand Kit</td></tr>
            </tbody>
          </table>
          <p>
            Payments are processed monthly via Robokassa payment system.
            All prices include applicable taxes.
          </p>
        </section>

        <section>
          <h2>4. Subscription and Recurring Payments</h2>

          <h3>4.1. Subscription Terms</h3>
          <p>
            When purchasing any subscription plan (Lite, Standard, Pro, Business), the User subscribes
            to a <strong>monthly subscription</strong> with automatic renewal.
            The subscription period is <strong>30 (thirty) calendar days</strong> from the payment date.
          </p>
          <table className={styles.priceTable}>
            <thead>
              <tr><th>Plan</th><th>Price/mo</th><th>Generations/mo</th></tr>
            </thead>
            <tbody>
              <tr><td>Lite</td><td>$4.5</td><td>10</td></tr>
              <tr><td>Standard</td><td>$11.5</td><td>30</td></tr>
              <tr><td>Pro</td><td>$29</td><td>80</td></tr>
              <tr><td>Business</td><td>$58</td><td>200</td></tr>
            </tbody>
          </table>

          <h3>4.2. Payment Processing</h3>
          <ul>
            <li>The first payment is charged <strong>at the time of subscription</strong>.</li>
            <li>Subsequent payments are charged <strong>automatically every 30 days</strong> from the
              bank card used for the initial payment.</li>
            <li>You will be notified <strong>3 (three) days</strong> before the next charge
              via the email provided during registration.</li>
            <li>Payments are processed through Robokassa. The Provider does not store bank card data.</li>
          </ul>

          <h3>4.3. How to Cancel</h3>
          <p>You can cancel your subscription at any time using one of these methods:</p>
          <ol>
            <li><strong>In your account:</strong> Profile → "Cancel subscription".</li>
            <li><strong>By email:</strong> send a request to <a href="mailto:info@adgena.pro">info@adgena.pro</a> with
              subject "Cancel subscription" and your account email.</li>
          </ol>
          <p>
            After cancellation, your plan <strong>remains active until the end of the paid period</strong>.
            After that, your account will be downgraded to the Free plan.
            Automatic charges will stop.
          </p>

          <h3>4.4. Refund Policy</h3>
          <ul>
            <li><strong>Full refund</strong> for the current billing period if no generations were used.
              Request within 7 days of the charge.</li>
            <li>In case of technical failure (Service unavailable for more than 48 hours) — proportional refund.</li>
            <li>Refund requests are processed within <strong>10 business days</strong>. The refund is issued
              to the same bank card used for payment.</li>
            <li>Contact for refunds: <a href="mailto:info@adgena.pro">info@adgena.pro</a>.</li>
          </ul>

          <h3>4.5. Price Changes</h3>
          <p>The Provider reserves the right to change plan prices. In this case:</p>
          <ul>
            <li>Users will be notified via email <strong>at least 14 (fourteen) days</strong> before
              new prices take effect.</li>
            <li>The current billing period is completed at the <strong>previous price</strong>.</li>
            <li>If the User does not cancel before the new period — this constitutes acceptance
              of the new price.</li>
          </ul>
        </section>

        <section>
          <h2>5. Service Delivery</h2>
          <ul>
            <li>Access to paid features is granted <strong>immediately</strong> after payment confirmation.</li>
            <li>The service is considered rendered upon granting access to the paid plan.</li>
            <li>Unused generations do not carry over to the next billing period.</li>
            <li>The Service is available 24/7, except during scheduled maintenance.</li>
          </ul>
        </section>

        <section>
          <h2>6. Consent to Data Processing</h2>
          <p>
            By registering with the Service and/or subscribing, you consent to
            the processing of your personal data in accordance with our{' '}
            <Link href="/en/privacy">Privacy Policy</Link>.
          </p>
          <p>
            Processing includes: collection, storage, and use of your email address and name
            for the purpose of providing access to the Service, payment notifications,
            and technical support.
          </p>
        </section>

        <section>
          <h2>7. Rights and Obligations</h2>
          <h3>The User agrees to:</h3>
          <ul>
            <li>Not upload content that violates applicable laws or third-party rights.</li>
            <li>Not use the Service to create prohibited or misleading content.</li>
            <li>Provide accurate data during registration.</li>
          </ul>
          <h3>The Provider agrees to:</h3>
          <ul>
            <li>Provide access to the Service according to the paid plan.</li>
            <li>Ensure the security of personal data per the <Link href="/en/privacy">Privacy Policy</Link>.</li>
            <li>Inform about significant changes to the Service.</li>
            <li>Notify the User about automatic charges at least 3 days in advance.</li>
          </ul>
        </section>

        <section>
          <h2>8. Intellectual Property</h2>
          <p>
            Generated images may be used by the User for commercial purposes without restrictions
            (for marketplaces, advertising, etc.). The Provider does not claim rights to
            User-generated content.
          </p>
          <p>
            All elements of the Service (design, code, logo, texts) are the intellectual property
            of the Provider.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <ul>
            <li>The Service is provided "as is".</li>
            <li>The Provider does not guarantee that generation results will meet
              the User&apos;s expectations in every case.</li>
            <li>The Provider is not responsible for the actions of third parties
              (payment systems, AI providers, hosting).</li>
          </ul>
        </section>

        <section>
          <h2>10. Contact Information</h2>
          <ul className={styles.contactList}>
            <li><strong>Provider:</strong> Self-employed Denis Eduardovich Orlov, TIN 665903565502</li>
            <li><strong>Email:</strong> <a href="mailto:info@adgena.pro">info@adgena.pro</a></li>
            <li><strong>Website:</strong> <a href="https://adgena.pro">https://adgena.pro</a></li>
          </ul>
        </section>

        <section>
          <h2>11. Final Provisions</h2>
          <p>
            This Offer takes effect from the moment of acceptance and remains valid
            until termination (account deletion or discontinuation of the Service).
          </p>
          <p>
            The Provider reserves the right to modify these terms.
            The current version is always available at{' '}
            <a href="https://adgena.pro/en/terms">adgena.pro/en/terms</a>.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Adgena</p>
      </footer>
    </div>
  );
}
