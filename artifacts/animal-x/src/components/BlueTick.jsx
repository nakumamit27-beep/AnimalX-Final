export default function BlueTick({ size = 18, className = "" }) {
  return (
    <svg
      className={`blue-tick-svg ${className}`}
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-label="Verified"
      role="img"
    >
      <path
        fill="#0095F6"
        d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h6.234L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.31v-6.235L40 25.359 36.905 20 40 14.641l-5.4-3.12v-6.27h-6.31L25.358 0l-5.36 3.094z"
      />
      <polyline
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="11.5 20.5 17 26 28.5 14.5"
      />
    </svg>
  );
}
