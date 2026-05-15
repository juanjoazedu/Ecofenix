import styles from "../styles/AboutPage.module.css";

const AboutPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sobre Ecofénix</h1>
      <div className={styles.content}>
        <p>Ecofénix nace de la necesidad de reducir residuos y fomentar una economía circular donde los objetos tengan una segunda vida útil.</p>
        <p>Somos una plataforma colaborativa que conecta a personas que quieren donar o vender artículos en buen estado con quienes los necesitan, todo de forma segura, sencilla y amigable con el medio ambiente.</p>
        <p>Creemos que pequeñas acciones como regalar o comprar de segunda mano generan un gran impacto social y ambiental. Únete a la comunidad Ecofénix y ayuda a construir un planeta más sostenible.</p>
      </div>
    </div>
  );
};
export default AboutPage;