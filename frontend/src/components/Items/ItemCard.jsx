import { Link } from "react-router-dom";
import styles from "./ItemCard.module.css";

const ItemCard = ({ item }) => {
  const firstImage = item.images && item.images.length > 0 ? item.images[0].url : "https://picsum.photos/300/200";

  return (
    <Link to={`/item/${item.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={firstImage} alt={item.title} className={styles.image} />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{item.title}</h3>
          {item.type === "FOR_SALE" ? (
            <span className={styles.priceBadge}>${item.price.toLocaleString()}</span>
          ) : (
            <span className={styles.donationBadge}>Donación</span>
          )}
        </div>
        <p className={styles.description}>{item.description}</p>
        <div className={styles.footer}>
          <span className={styles.status}>
            <span className={styles.dot}></span> Disponible
          </span>
          <button
            className={styles.btnOutline}
            onClick={(e) => {
              e.preventDefault();
              console.log("Solicitar artículo:", item);
            }}
          >
            Solicitar
          </button>
        </div>
      </div>
    </Link>
  );
};
export default ItemCard;