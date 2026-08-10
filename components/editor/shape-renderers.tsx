import { CSSProperties, ReactNode } from "react";

interface ShapeRendererProps {
  shape: string;
  width: number;
  height: number;
  color?: string;
  label?: string;
  selected?: boolean;
}

const SVGShape = ({
  children,
  color,
  selected,
}: {
  children: ReactNode;
  color: string;
  selected: boolean;
}) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full overflow-visible"
    >
      <g
        fill={color}
        stroke={selected ? "var(--color-primary)" : "var(--color-border-default)"}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        className={selected ? "" : "hover:stroke-border-hover transition-colors"}
      >
        {children}
      </g>
    </svg>
  );
};

export function ShapeRenderer({
  shape,
  width,
  height,
  color = "var(--color-bg-base)",
  label,
  selected = false,
}: ShapeRendererProps) {
  const containerStyle: CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
  };

  // Base classes for CSS shapes
  let cssClasses = `absolute inset-0 flex items-center justify-center border-2 transition-colors ${
    selected ? "border-primary" : "border-border-default hover:border-border-hover"
  }`;

  let content: ReactNode = null;

  switch (shape) {
    case "rectangle":
      content = (
        <div className={`${cssClasses} rounded-md`} style={{ backgroundColor: color }} />
      );
      break;
    case "pill":
      content = (
        <div className={`${cssClasses} rounded-full`} style={{ backgroundColor: color }} />
      );
      break;
    case "circle":
      content = (
        <div className={`${cssClasses} rounded-full`} style={{ backgroundColor: color }} />
      );
      break;
    case "diamond":
      content = (
        <SVGShape color={color} selected={selected}>
          <polygon points="50,0 100,50 50,100 0,50" />
        </SVGShape>
      );
      break;
    case "hexagon":
      content = (
        <SVGShape color={color} selected={selected}>
          <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" />
        </SVGShape>
      );
      break;
    case "cylinder":
      content = (
        <SVGShape color={color} selected={selected}>
          {/* Main body and bottom curve */}
          <path d="M 0 15 L 0 85 A 50 15 0 0 0 100 85 L 100 15 Z" />
          {/* Top lid */}
          <ellipse cx="50" cy="15" rx="50" ry="15" />
        </SVGShape>
      );
      break;
    default:
      content = (
        <div className={`${cssClasses} rounded-md`} style={{ backgroundColor: color }} />
      );
      break;
  }

  return (
    <div className="relative flex items-center justify-center shadow-sm" style={containerStyle}>
      {content}
      <span className="relative z-10 text-sm font-medium text-text-primary text-center pointer-events-none select-none max-w-[90%] break-words">
        {label || shape}
      </span>
    </div>
  );
}
