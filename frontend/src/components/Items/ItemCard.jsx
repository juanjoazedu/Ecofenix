import { Link } from "react-router-dom";
import styles from "../../styles/ItemCard.module.css";

const ItemCard = ({ item, showRequestButton = true }) => {
  const firstImage =
    item.images && item.images.length > 0
      ? item.images[0].url
      : "https://picsum.photos/300/200";

  const cardContent = (
    <>
      <div className={styles.imageWrapper}>
        <img src={firstImage} alt={item.title} className={styles.image} />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{item.title}</h3>
          {item.type === "FOR_SALE" ? (
            <span className={styles.priceBadge}>
              ${item.price.toLocaleString()}
            </span>
          ) : (
            <span className={styles.donationBadge}>Donación</span>
          )}
        </div>
        <p className={styles.description}>{item.description}</p>
        <div className={styles.footer}>
          <span className={styles.status}>
            <span className={styles.dot}></span> Disponible
          </span>
          {showRequestButton && (
            // Solo un span con estilo, NO un Link, para evitar <a> anidado
            <span className={styles.btnOutline}>
              Solicitar
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (showRequestButton) {
    return (
      <Link to={`/items/${item.id}`} className={styles.card}>
        {cardContent}
      </Link>
    );
  }

  return <div className={styles.card}>{cardContent}</div>;
};

export default ItemCard;