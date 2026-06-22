export default function ActionIcon({
  icon: Icon,
  gradient,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
      w-10 h-10 rounded-xl
      bg-gradient-to-r ${gradient}
      text-white
      flex items-center justify-center
      `}
    >
      <Icon size={18} />
    </button>
  );
}