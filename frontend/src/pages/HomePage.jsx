// src/pages/HomePage.jsx
import { useEffect, useRef, useState } from "react";
import { itemService } from "../services/itemService";
import { categoryService } from "../services/categoryService";
import { useAuth } from "../context/AuthContext"; // ← nuevo
import ItemCard from "../components/Items/ItemCard";
import styles from "../styles/HomePage.module.css";

const HomePage = () => {
  const { user } = useAuth();

  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const typeRef = useRef(null);
  const categoryRef = useRef(null);
  const subCategoryRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, catsData] = await Promise.all([
          itemService.getAllItems(),
          categoryService.getMainCategories(),
        ]);

        // 1. Solo artículos activos
        let activeItems = itemsData.filter(
          (item) => item.status === "ACTIVE"
        );

        // 2. Excluir los artículos del usuario actual
        if (user?.id) {
          activeItems = activeItems.filter(
            (item) => item.sellerId !== user.id
          );
        }

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
  }, [user?.id]); // ← se vuelve a ejecutar si cambia el usuario (al iniciar sesión)

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
          ? [Number(selectedCategory), ...subCategories.map((s) => Number(s.id))]
          : [];

      if (categoryIdsToFilter.length > 0) {
        try {
          result = await itemService.getItemsByCategories(categoryIdsToFilter);
          result = result.filter(item => item.status === "ACTIVE");
          // También excluir propios si es que el backend no lo hace
          if (user?.id) {
            result = result.filter(item => item.sellerId !== user.id);
          }
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
  }, [searchTerm, selectedType, selectedCategory, selectedSubCategory, subCategories, allItems, user?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeRef.current && !typeRef.current.contains(e.target))
        setIsTypeOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target))
        setIsCategoryOpen(false);
      if (subCategoryRef.current && !subCategoryRef.current.contains(e.target))
        setIsSubCategoryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSubCategories([]);
    setIsTypeOpen(false);
    setIsCategoryOpen(false);
    setIsSubCategoryOpen(false);
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
          <div className={`${styles.filtersGrid} ${subCategories.length > 0 ? styles.filtersGridFour : ""}`}>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className={styles.input}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Dropdown custom de Tipo */}
            <div className={styles.customSelect} ref={typeRef}>
              <button
                className={`${styles.customSelectTrigger} ${isTypeOpen ? styles.customSelectTriggerOpen : ""}`}
                onClick={() => setIsTypeOpen((o) => !o)}
                type="button"
              >
                <span className={styles.customSelectValue}>
                  {selectedType === "FOR_SALE" ? "Venta solidaria" : selectedType === "DONATION" ? "Donación gratuita" : "Todos los tipos"}
                </span>
                <span className={`${styles.chevron} ${isTypeOpen ? styles.chevronOpen : ""}`}>▾</span>
              </button>
              {isTypeOpen && (
                <div className={styles.customSelectDropdown}>
                  <button
                    className={`${styles.dropdownItem} ${selectedType === "" ? styles.dropdownItemSelected : ""}`}
                    onClick={() => { setSelectedType(""); setIsTypeOpen(false); }}
                    type="button"
                  >
                    Todos los tipos
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${selectedType === "FOR_SALE" ? styles.dropdownItemSelected : ""}`}
                    onClick={() => { setSelectedType("FOR_SALE"); setIsTypeOpen(false); }}
                    type="button"
                  >
                    Venta solidaria
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${selectedType === "DONATION" ? styles.dropdownItemSelected : ""}`}
                    onClick={() => { setSelectedType("DONATION"); setIsTypeOpen(false); }}
                    type="button"
                  >
                    Donación gratuita
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown custom de Categoría */}
            <div className={styles.customSelect} ref={categoryRef}>
              <button
                className={`${styles.customSelectTrigger} ${isCategoryOpen ? styles.customSelectTriggerOpen : ""}`}
                onClick={() => setIsCategoryOpen((o) => !o)}
                type="button"
              >
                <span className={styles.customSelectValue}>
                  {selectedCategory
                    ? categories.find((c) => String(c.id) === selectedCategory)?.name
                    : "Todas las categorías"}
                </span>
                <span className={`${styles.chevron} ${isCategoryOpen ? styles.chevronOpen : ""}`}>▾</span>
              </button>
              {isCategoryOpen && (
                <div className={styles.customSelectDropdown}>
                  <button
                    className={`${styles.dropdownItem} ${selectedCategory === "" ? styles.dropdownItemSelected : ""}`}
                    onClick={() => { setSelectedCategory(""); setIsCategoryOpen(false); }}
                    type="button"
                  >
                    Todas las categorías
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`${styles.dropdownItem} ${selectedCategory === String(cat.id) ? styles.dropdownItemSelected : ""}`}
                      onClick={() => { setSelectedCategory(String(cat.id)); setIsCategoryOpen(false); }}
                      type="button"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown custom de Subcategoría */}
            {subCategories.length > 0 && (
              <div className={styles.customSelect} ref={subCategoryRef}>
                <button
                  className={`${styles.customSelectTrigger} ${isSubCategoryOpen ? styles.customSelectTriggerOpen : ""}`}
                  onClick={() => setIsSubCategoryOpen((o) => !o)}
                  type="button"
                >
                  <span className={styles.customSelectValue}>
                    {selectedSubCategory
                      ? subCategories.find((s) => String(s.id) === selectedSubCategory)?.name
                      : "Todas las subcategorías"}
                  </span>
                  <span className={`${styles.chevron} ${isSubCategoryOpen ? styles.chevronOpen : ""}`}>▾</span>
                </button>
                {isSubCategoryOpen && (
                  <div className={styles.customSelectDropdown}>
                    <button
                      className={`${styles.dropdownItem} ${selectedSubCategory === "" ? styles.dropdownItemSelected : ""}`}
                      onClick={() => { setSelectedSubCategory(""); setIsSubCategoryOpen(false); }}
                      type="button"
                    >
                      Todas las subcategorías
                    </button>
                    {subCategories.map((sub) => (
                      <button
                        key={sub.id}
                        className={`${styles.dropdownItem} ${selectedSubCategory === String(sub.id) ? styles.dropdownItemSelected : ""}`}
                        onClick={() => { setSelectedSubCategory(String(sub.id)); setIsSubCategoryOpen(false); }}
                        type="button"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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