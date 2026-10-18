import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  light: 'btn-light',
  outlineLight: 'btn-outline-light',
}

// One button for the whole product. Renders a router <Link> when `to` is set,
// otherwise a <button>. Base styles live in the .btn* classes in index.css.
export default function Button({
  to,
  variant = 'primary',
  size,
  block,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'btn',
    VARIANTS[variant] ?? VARIANTS.primary,
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
