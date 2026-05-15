import { useEffect, useState } from "react";
import { itemService } from "../services/itemService";
import { categoryService } from "../services/categoryService";
import ItemCard from "../components/Items/ItemCard";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, catsData] = await Promise.all([
          itemService.getAllItems(),
          categoryService.getMainCategories(),
        ]);

        const activeItems = itemsData.filter(
          (item) => item.status === "ACTIVE"
        );

        setAllItems(activeItems);
        setFilteredItems(activeItems);
        setCategories(catsData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cargar subcategorías cuando cambia la categoría principal
  useEffect(() => {
    if (selectedCategory) {
      categoryService
        .getSubCategories(Number(selectedCategory))
        .then((subs) => {
          setSubCategories(subs || []);
        })
        .catch(() => {
          setSubCategories([]);
        });
    } else {
      setSubCategories([]);
      setSelectedSubCategory("");
    }
  }, [selectedCategory]);

  // Resetear subcategoría cuando cambia la categoría principal
  useEffect(() => {
    setSelectedSubCategory("");
  }, [selectedCategory]);

  useEffect(() => {
    const applyFilters = async () => {
      let result = [];

      const categoryIdsToFilter = selectedSubCategory 
        ? [Number(selectedSubCategory)] 
        : selectedCategory 
          ? [Number(selectedCategory)] 
          : [];

      if (categoryIdsToFilter.length > 0) {
        try {
          result = await itemService.getItemsByCategories(categoryIdsToFilter);
          result = result.filter(item => item.status === "ACTIVE");
        } catch (error) {
          console.error("Error filtrando por categoría:", error);
          setFilteredItems([]);
          return;
        }
      } else {
        result = [...allItems];
      }

      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          (item) =>
            item.title.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)
        );
      }

      if (selectedType !== "") {
        result = result.filter((item) => item.type === selectedType);
      }

      setFilteredItems(result);
    };

    applyFilters();
  }, [searchTerm, selectedType, selectedCategory, selectedSubCategory, allItems]);

  // ✅ FUNCIÓN PARA LIMPIAR FILTROS - AGREGAR ESTO
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSubCategories([]);
  };

  if (loading) {
    return <div className={styles.container}>Cargando artículos...</div>;
  }

  return (
    <div className={styles.pageWrapper}>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>
            Dale una segunda vida a lo que ya no usas
          </h1>
          <p className={styles.heroSub}>
            Donaciones y ventas solidarias para cuidar el planeta y apoyar a tu comunidad.
          </p>
        </div>
      </section>

      {/* CONTENIDO */}
      <div className={styles.container}>

        {/* FILTROS */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersGrid}>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className={styles.input}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className={styles.select}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="FOR_SALE">Venta solidaria</option>
              <option value="DONATION">Donación gratuita</option>
            </select>

            <select
              className={styles.select}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {subCategories.length > 0 && (
              <select
                className={styles.select}
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
              >
                <option value="">Todas las subcategorías</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ✅ BOTÓN PARA LIMPIAR FILTROS - AGREGAR AQUÍ */}
          <div className={styles.filtersActions}>
            <p className={styles.resultsCount}>
              {filteredItems.length} artículo(s) encontrado(s)
            </p>
            <button 
              onClick={clearFilters} 
              className={styles.clearFiltersBtn}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredItems.length === 0 && (
          <div className={styles.emptyState}>
            <p>No hay artículos que coincidan con los filtros.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;