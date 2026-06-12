import styles from './page.module.css';
import Image from 'next/image';

export default async function Login() {
  let verseText = "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves, not looking to your own interests but each of you to the interests of the others.";
  let verseRef = "- Philippians 2:3-4(NIV)";

  try {
    const res = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json&order=random', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      verseText = data.verse.details.text;
      verseRef = `- ${data.verse.details.reference}(${data.verse.details.version})`;
    }
  } catch (error) {
    console.error("Failed to fetch verse:", error);
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <Image
          src="/campus_bg.jpg"
          alt="MBC Campus Background"
          fill
          priority
          className={styles.bgImage}
        />
        <div className={styles.overlay}></div>
      </div>

      <div className={styles.loginCard}>
        <div className={styles.verseBanner}>
          <p>{verseText}</p>
          <span className={styles.verseReference}>{verseRef}</span>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.logoContainer}>
            <img
              src="https://mbcmumbai.com/wp-content/uploads/2021/08/WhatsApp_Image_2021-08-20_at_17.24.14-removebg-preview.png"
              alt="MBC Logo"
              width={120}
              height={120}
              className={styles.logoImage}
            />
            <h1 className={styles.title}>MBC ADMIN PORTAL</h1>
          </div>

          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <input type="email" placeholder="Email" className={styles.input} required />
            </div>
            <div className={styles.inputGroup}>
              <input type="password" placeholder="Password" className={styles.input} required />
            </div>

            <div className={styles.rememberMeGroup}>
              <label className={styles.toggleSwitch}>
                <input type="checkbox" className={styles.toggleInput} />
                <span className={styles.toggleSlider}></span>
              </label>
              <span className={styles.rememberMeText}>Remember me</span>
            </div>

            <button type="submit" className={styles.submitBtn}>
              SIGN IN
            </button>
          </form>
        </div>
      </div>

      <div className={styles.footer}>
        <p>© MBC MUMBAI 2026</p>
      </div>


    </div>
  );
}
