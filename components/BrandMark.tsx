type Props = { size?: number };

export function BrandMark({ size = 18 }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <g transform="translate(32 32)" fill="#06070b">
        <path d="M 0 -26 L 5 -7 L 18 -18 L 7 -5 L 26 0 L 7 5 L 18 18 L 5 7 L 0 26 L -5 7 L -18 18 L -7 5 L -26 0 L -7 -5 L -18 -18 L -5 -7 Z" />
      </g>
    </svg>
  );
}
