import styles from "../../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logo}>ecofénix</div>
        <p className={styles.description}>
          Plataforma de economía circular y colaborativa para reducir residuos y fortalecer comunidades.
        </p>
        <p className={styles.copyright}>
          Hecho con 💚 para el planeta<br />
          © 2026 ecofénix — Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
};
export default Footer;