import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { itemService } from "../services/itemService";
import { useCart } from "../context/CartContext";
import styles from "../styles/ItemDetailPage.module.css";

const ItemDetailPage = () => {
  const { id } = useParams();
  const { addItem, cart } = useCart(); // carrito global
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await itemService.getItemById(id);
        setItem(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Cantidad que ya está en el carrito para este ítem
  const quantityInCart =
    cart?.cartItems?.find((ci) => ci.itemId === item?.id)?.quantity || 0;

  // Stock real disponible para este usuario
  const availableStock = item ? item.stock - quantityInCart : 0;

  // Ajustar la cantidad seleccionada si el stock disponible cambió (ej. al regresar del carrito)
  useEffect(() => {
    if (quantity > availableStock) {
      setQuantity(availableStock > 0 ? availableStock : 1);
    }
  }, [availableStock, quantity]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (newQty > availableStock) return availableStock;
      return newQty;
    });
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    const success = await addItem(item.id, quantity);
    setIsAddingToCart(false);
    if (success) {
      alert(`¡${quantity} artículo(s) agregado(s) al carrito!`);
    } else {
      alert("No se pudo agregar al carrito. Revisa el stock o intenta de nuevo.");
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    const success = await addItem(item.id, quantity);
    setIsBuyingNow(false);
    if (success) {
      navigate("/carrito");
    } else {
      alert("No se pudo agregar al carrito. Revisa el stock.");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>😕</span>
          <h2>Artículo no encontrado</h2>
          <p>El artículo que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  const images =
    item.images?.length > 0
      ? item.images.map((img) => img.url)
      : ["https://picsum.photos/600/400"];

  const mainImage = images[selectedImage] || images[0];
  const isForSale = item.type === "FOR_SALE";
  const isAvailable = item.status === "ACTIVE" && availableStock > 0;

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <a href="/" className={styles.breadcrumbLink}>
          Inicio
        </a>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span className={styles.breadcrumbCurrent}>{item.title}</span>
      </nav>

      <div className={styles.grid}>
        {/* Galería de imágenes */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            <img src={mainImage} alt={item.title} className={styles.imageMain} />
            {item.type === "DONATION" && (
              <span className={styles.donationOverlay}>Donación</span>
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbnailsScroll}>
              <div className={styles.thumbnails}>
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    className={`${styles.thumbnail} ${idx === selectedImage ? styles.thumbnailActive : ""}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={url} alt={`Vista ${idx + 1}`} />
                    {idx === selectedImage && <div className={styles.activeIndicator} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Información del artículo */}
        <div className={styles.info}>
          <div className={styles.badgeGroup}>
            {isForSale ? (
              <span className={styles.priceBadge}>Venta solidaria</span>
            ) : (
              <span className={styles.donationBadge}>Donación gratuita</span>
            )}
            <span
              className={`${styles.statusBadge} ${!isAvailable ? styles.statusUnavailable : ""}`}
            >
              {isAvailable ? "Disponible" : "No disponible"}
            </span>
          </div>

          <h1 className={styles.title}>{item.title}</h1>

          {isForSale && (
            <div className={styles.priceSection}>
              <span className={styles.priceValue}>${item.price?.toLocaleString()}</span>
              <span className={styles.priceLabel}>COP</span>
            </div>
          )}

          {/* Stock dinámico */}
          <div className={styles.stockInfo}>
            {availableStock === 0 ? (
              <span className={styles.stockText}>No hay disponibles</span>
            ) : (
              <>
                <span className={styles.stockText}>
                  {availableStock - quantity}{" "}
                  {availableStock - quantity === 1
                    ? "unidad disponible"
                    : "unidades disponibles"}{" "}
                  después de tu selección
                </span>
                {availableStock - quantity <= 3 && availableStock - quantity > 0 && (
                  <span className={styles.lowStock}>¡Últimas!</span>
                )}
                {availableStock - quantity === 0 && (
                  <span className={styles.lowStock}>Te llevas todo el stock disponible</span>
                )}
              </>
            )}
          </div>

          <div className={styles.divider} />

          <div className={styles.descriptionSection}>
            <h3 className={styles.descriptionTitle}>Descripción</h3>
            <p className={styles.description}>{item.description}</p>
          </div>

          <div className={styles.divider} />

          {/* Acciones */}
          <div className={styles.actions}>
            {isAvailable && (
              <div className={styles.quantityRow}>
                <span className={styles.quantityLabel}>Cantidad:</span>
                <div className={styles.quantityControl}>
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= availableStock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {isAvailable ? (
              <div className={styles.buttonGroup}>
                <button
                  className={styles.btnCart}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || availableStock === 0}
                >
                  {isAddingToCart ? "Agregando..." : "Agregar al carrito"}
                </button>

                <button
                  className={isForSale ? styles.btnBuy : styles.btnDonate}
                  onClick={handleBuyNow}
                  disabled={isBuyingNow || availableStock === 0}
                >
                  {isBuyingNow
                    ? "Procesando..."
                    : isForSale
                    ? "Comprar ahora"
                    : "Solicitar donación ahora"}
                </button>
              </div>
            ) : (
              <button className={styles.btnDisabled} disabled>
                No disponible
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sección adicional de detalles */}
      <div className={styles.detailsSection}>
        <div className={styles.detailCard}>
          <span className={styles.detailIcon}>📦</span>
          <div>
            <h4>Estado</h4>
            <p>Disponible para entrega inmediata</p>
          </div>
        </div>
        {item.type === "FOR_SALE" ? (
          <div className={styles.detailCard}>
            <span className={styles.detailIcon}>💚</span>
            <div>
              <h4>Venta solidaria</h4>
              <p>Apoyas a tu comunidad local</p>
            </div>
          </div>
        ) : (
          <div className={styles.detailCard}>
            <span className={styles.detailIcon}>🤝</span>
            <div>
              <h4>Donación gratuita</h4>
              <p>Gracias por tu solidaridad</p>
            </div>
          </div>
        )}
        <div className={styles.detailCard}>
          <span className={styles.detailIcon}>🌱</span>
          <div>
            <h4>Impacto ambiental</h4>
            <p>Ayudas a reducir residuos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;