// src/components/UI/Button.jsx
const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const base = "btn";
  const variants = { primary: "btn-primary", outline: "btn-outline", ghost: "btn-ghost" };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
export default Button;