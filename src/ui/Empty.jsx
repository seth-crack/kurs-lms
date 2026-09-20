import Icon from './Icon';

export default function Empty({ icon = 'inbox', title, desc, action }) {
  return (
    <div className="empty">
      <div className="e-ic">
        <Icon name={icon} size={22} />
      </div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
}