import Icon from './Icon';

export default function Button({
  children,
  variant = 'default',
  size,
  icon,
  block,
  style,
  ...rest
}) {
  const className = ['btn', variant, size, block ? 'block' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button className={className} style={style} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}