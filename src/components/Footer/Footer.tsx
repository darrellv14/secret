import styles from "./Footer.module.css";

import { SocialLinks } from "@/components/SocialLinks/SocialLinks";
import { getAppName, getImprintUrl, getLabel, getLogoUrl } from "@/lib/data";

export function Footer() {
  const logoUrl = getLogoUrl();
  return (
    <footer className={styles.footerBar}>
      <div className={styles.footerSeparator} />
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <span className={styles.copyright}>
            © 2025 BCA. All rights reserved.
          </span>
        </div>
        <div className={styles.footerRight}>
          <div className={styles.footerCol}>
            <img src={logoUrl} className={styles.logoSmall} alt="Tera Logo" />
          </div>
          <div className={styles.footerCol}>
            <a href="#" className={styles.footerLink}>
              License Guidance
            </a>
          </div>
          <div className={styles.footerCol}>
            <a href="#" className={styles.footerLink}>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
