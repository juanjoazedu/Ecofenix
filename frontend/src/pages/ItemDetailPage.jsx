import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { itemService } from "../services/itemService";
import styles from "./ItemDetailPage.module.css";

const ItemDetailPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className={styles.container}>Cargando...</div>;
  if (!item) return <div className={styles.container}>Artículo no encontrado</div>;

  const mainImage = item.images?.[0]?.url || "https://picsum.photos/600/400";

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div>
          <img src={mainImage} alt={item.title} className={styles.imageMain} />
          <div className={styles.thumbnails}>
            {item.images?.slice(1, 4).map((img, idx) => (
              <img key={idx} src={img.url} className={styles.thumbnail} alt="" />
            ))}
          </div>
        </div>
        <div>
          <h1 className={styles.title}>{item.title}</h1>
          <div className={styles.badgeGroup}>
            {item.type === "FOR_SALE" ? (
              <span className={styles.priceBadge}>${item.price.toLocaleString()}</span>
            ) : (
              <span className={styles.donationBadge}>Donación</span>
            )}
            <span className={styles.statusBadge}>Disponible</span>
          </div>
          <p className={styles.description}>{item.description}</p>
          <button
            className={styles.btnPrimary}
            onClick={() => console.log("Solicitar", item)}
          >
            {item.type === "FOR_SALE" ? "Comprar ahora" : "Solicitar donación"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ItemDetailPage;