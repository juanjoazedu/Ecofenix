import { Link } from "react-router-dom";
import logo from "../../assets/images/logo-ecofenix.jpeg";
import styles from "../../styles/Navbar.module.css";

const Navbar = () => {
  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoContainer}>
          <img src={logo} alt="Ecofénix" className={styles.logoImg} />
          <span className={styles.logoText}>Ecofénix</span>
        </Link>
        <nav className={styles.navLinks}>
          <Link to="/catalogo" className={styles.navLink}>Catálogo</Link>
          <Link to="/publicar" className={styles.navLink}>Publicar</Link>
          <Link to="/nosotros" className={styles.navLink}>Nosotros</Link>
          <Link to="/carrito" className={styles.navLink}>🛒 Carrito</Link>
          <Link to="/ingresar" className={styles.btnOutline}>Ingresar</Link>
        </nav>
      </div>
    </header>
  );
};
export default Navbar;