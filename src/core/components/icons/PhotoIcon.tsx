export function PhotoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <g fill="currentColor">
        <rect x="1" y="2" width="14" height="20" rx="2" />
        <rect x="17" y="8" width="2" height="14" rx="1" />
        <rect x="21" y="14" width="2" height="8" rx="1" />
      </g>
    </svg>
  );
}
