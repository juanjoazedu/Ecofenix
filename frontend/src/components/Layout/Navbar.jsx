// src/components/Layout/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cartService } from "../../services/cartService";
import logo from "../../assets/images/logo-ecofenix.jpeg";
import styles from "../../styles/Navbar.module.css";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setCartCount(0);
      return;
    }

    const fetchCartCount = async () => {
      try {
        const cart = await cartService.getCart(user.id);
        const count = Array.isArray(cart.cartItems) ? cart.cartItems.length : 0;
        setCartCount(count);
      } catch (error) {
        console.error("Error al obtener carrito:", error);
        setCartCount(0);
      }
    };

    fetchCartCount();

    const onFocus = () => fetchCartCount();
    const onCartUpdate = () => fetchCartCount(); // nuevo callback

    window.addEventListener("focus", onFocus);
    window.addEventListener("cart-updated", onCartUpdate); // nuevo listener
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("cart-updated", onCartUpdate);
    };
  }, [isAuthenticated, user?.id]);

  const handleLogout = () => {
    const confirmar = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmar) {
      logout();
      navigate("/");
    }
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
          <Link to="/carrito" className={styles.navLink}>
            🛒
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>

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