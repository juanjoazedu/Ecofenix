import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { itemService } from "../services/itemService";
import styles from "../styles/ItemDetailPage.module.css";

const ItemDetailPage = () => {
  const { id } = useParams();
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

  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (item && newQty > item.stock) return item.stock;
      return newQty;
    });
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      console.log("Agregar al carrito:", { itemId: item.id, quantity });
      setTimeout(() => {
        setIsAddingToCart(false);
        alert(`¡${quantity} artículo(s) agregado(s) al carrito!`);
      }, 500);
    } catch (error) {
      console.error(error);
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      console.log("Compra directa:", { itemId: item.id, quantity });
      setTimeout(() => {
        setIsBuyingNow(false);
        alert(`Iniciando proceso de compra para ${quantity} artículo(s)...`);
      }, 500);
    } catch (error) {
      console.error(error);
      setIsBuyingNow(false);
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

  const images = item.images?.length > 0 
    ? item.images.map(img => img.url) 
    : ["https://picsum.photos/600/400"];
  
  const mainImage = images[selectedImage] || images[0];
  const isForSale = item.type === "FOR_SALE";
  const isAvailable = item.status === "ACTIVE" && item.stock > 0;

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <a href="/" className={styles.breadcrumbLink}>Inicio</a>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span className={styles.breadcrumbCurrent}>{item.title}</span>
      </nav>

      <div className={styles.grid}>
        {/* Galería de imágenes */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            <img 
              src={mainImage} 
              alt={item.title} 
              className={styles.imageMain}
            />
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
                    className={`${styles.thumbnail} ${idx === selectedImage ? styles.thumbnailActive : ''}`}
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
            <span className={`${styles.statusBadge} ${!isAvailable ? styles.statusUnavailable : ''}`}>
              {isAvailable ? 'Disponible' : 'No disponible'}
            </span>
          </div>

          <h1 className={styles.title}>{item.title}</h1>

          {isForSale && (
            <div className={styles.priceSection}>
              <span className={styles.priceValue}>
                ${item.price?.toLocaleString()}
              </span>
              <span className={styles.priceLabel}>COP</span>
            </div>
          )}

          {/* Stock */}
          <div className={styles.stockInfo}>
            <span className={styles.stockText}>
              {item.stock} {item.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
            </span>
            {item.stock <= 3 && item.stock > 0 && (
              <span className={styles.lowStock}>¡Últimas!</span>
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
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={quantity >= item.stock}>+</button>
                </div>
              </div>
            )}

            {isForSale && isAvailable ? (
              <div className={styles.buttonGroup}>
                <button className={styles.btnCart} onClick={handleAddToCart} disabled={isAddingToCart}>
                  {isAddingToCart ? 'Agregando...' : 'Agregar al carrito'}
                </button>
                <button className={styles.btnBuy} onClick={handleBuyNow} disabled={isBuyingNow}>
                  {isBuyingNow ? 'Procesando...' : 'Comprar ahora'}
                </button>
              </div>
            ) : item.type === "DONATION" && isAvailable ? (
              <button className={styles.btnDonate} onClick={() => console.log("Solicitar donación", { itemId: item.id, quantity })}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Solicitar donación
              </button>
            ) : (
              <button className={styles.btnDisabled} disabled>No disponible</button>
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