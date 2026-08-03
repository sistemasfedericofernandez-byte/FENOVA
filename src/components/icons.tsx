import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function BedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M2 9v9M2 13h20M2 9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4H2Z" />
      <path d="M14 9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4h-8Z" />
      <path d="M22 18v3M2 18v3" />
    </svg>
  );
}

export function BathIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-2.6 1L4 6" />
      <path d="M4 12V6a2 2 0 0 1 2-2c1 0 1.5.5 1.5 1.5" />
      <path d="M2 12h20v2a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6v-2Z" />
      <path d="M6 20v2M18 20v2" />
    </svg>
  );
}

export function RulerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="7" width="18" height="10" rx="1" />
      <path d="M7 7v3M11 7v3M15 7v3M19 7v3" />
    </svg>
  );
}

export function MapPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.5 15.4 6.5M8.6 13.5l6.8 4" />
    </svg>
  );
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="14" r="3.5" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M12 2.5l2.9 6.3 6.8.7-5.1 4.7 1.5 6.8L12 17.6l-6.1 3.4 1.5-6.8-5.1-4.7 6.8-.7Z" />
    </svg>
  );
}

export function WifiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M2 8.5a16 16 0 0 1 20 0" />
      <path d="M5.5 12.5a11 11 0 0 1 13 0" />
      <path d="M9 16.5a6 6 0 0 1 6 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PoolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M2 17c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
      <path d="M2 21c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
      <path d="M7 13V5a2 2 0 0 1 2-2h1" />
      <path d="M17 13V9" />
    </svg>
  );
}

export function CoffeeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M8 2c-.5.8-.5 1.2 0 2M12 2c-.5.8-.5 1.2 0 2" />
    </svg>
  );
}

export function ParkingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 16V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

export function AcIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2" />
    </svg>
  );
}

export function PawIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <circle cx="6" cy="9" r="2" />
      <circle cx="18" cy="9" r="2" />
      <circle cx="9.5" cy="5" r="2" />
      <circle cx="14.5" cy="5" r="2" />
      <path d="M12 12c-3.3 0-6 2-6 4.5S8 21 12 21s6-1.5 6-4.5-2.7-4.5-6-4.5Z" />
    </svg>
  );
}

export function DumbbellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 7v10M18 7v10" />
      <path d="M2 10v4M22 10v4" />
      <path d="M6 12h12" />
    </svg>
  );
}

export function UtensilsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 2v8M4 2v5a2 2 0 0 0 4 0V2M6 10v12" />
      <path d="M18 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" />
    </svg>
  );
}
