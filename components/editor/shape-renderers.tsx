import { CSSProperties, ReactNode, useState, useEffect, useRef } from "react";

interface ShapeRendererProps {
  shape: string;
  width: number | string;
  height: number | string;
  color?: string;
  label?: string;
  selected?: boolean;
  onLabelChange?: (label: string) => void;
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
      className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
    >
      <g
        fill={color}
        stroke={selected ? "var(--color-accent-primary)" : "var(--color-border-subtle)"}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        className={selected ? "" : "hover:stroke-text-muted transition-colors"}
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
  color = "var(--color-bg-elevated)",
  label,
  selected = false,
  onLabelChange,
}: ShapeRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localLabel, setLocalLabel] = useState(label || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalLabel(label || "");
  }, [label]);

  const containerStyle: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  // Base classes for CSS shapes
  let cssClasses = `absolute inset-0 w-full h-full flex items-center justify-center border-2 transition-colors pointer-events-none ${
    selected ? "border-accent-primary shadow-[0_0_10px_rgba(0,200,212,0.2)]" : "border-border-subtle hover:border-text-muted"
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
    <div 
      className="relative flex items-center justify-center shadow-sm w-full h-full cursor-pointer" 
      style={containerStyle}
      onDoubleClick={() => {
        if (onLabelChange) {
          setIsEditing(true);
          setTimeout(() => {
            textareaRef.current?.focus();
            // Optional: place cursor at end
            const length = textareaRef.current?.value.length || 0;
            textareaRef.current?.setSelectionRange(length, length);
          }, 0);
        }
      }}
    >
      {content}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="relative z-10 w-[90%] text-sm font-medium text-text-primary text-center bg-transparent outline-none resize-none overflow-hidden nodrag nopan"
          value={localLabel}
          onChange={(e) => {
            setLocalLabel(e.target.value);
            onLabelChange?.(e.target.value);
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsEditing(false);
          }}
          placeholder={shape}
          style={{ height: 'auto', minHeight: '1.5em' }}
          rows={1}
        />
      ) : (
        <span className="relative z-10 text-sm font-medium text-text-primary text-center pointer-events-none select-none max-w-[90%] break-words">
          {label || shape}
        </span>
      )}
    </div>
  );
}
