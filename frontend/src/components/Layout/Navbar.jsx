// src/components/Layout/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo-ecofenix.jpeg";
import styles from "../../styles/Navbar.module.css";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
          
          {isAuthenticated ? (
            <>
              <span className={styles.userGreeting}>Hola, {user.username}</span>
              <Link to="/perfil" className={styles.navLink}>Mi perfil</Link>
              <button onClick={handleLogout} className={styles.btnOutline}>
                Salir
              </button>
            </>
          ) : (
            <Link to="/ingresar" className={styles.btnOutline}>Ingresar</Link>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Navbar;