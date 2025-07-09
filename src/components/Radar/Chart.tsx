import Link from "next/link";
import React, { FC, Fragment, memo } from "react";

import styles from "./Chart.module.css";

import { Blip } from "@/components/Radar/Blip";
import { formatRelease } from "@/lib/format";
import { Item, Quadrant, Ring } from "@/lib/types";

export interface ChartProps {
  size?: number;
  quadrants: Quadrant[];
  rings: Ring[];
  items: Item[];
  className?: string;
}

const _Chart: FC<ChartProps> = ({
  size = 800,
  quadrants = [],
  rings = [],
  items = [],
  className,
}) => {
  const viewBoxSize = size;
  const center = size / 2;
  const startAngles = [270, 0, 180, 90]; // Corresponding to positions 1, 2, 3, and 4 respectively

  // Helper function to convert polar coordinates to cartesian
  const polarToCartesian = (
    radius: number,
    angleInDegrees: number,
  ): { x: number; y: number } => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: Math.round(center + radius * Math.cos(angleInRadians)),
      y: Math.round(center + radius * Math.sin(angleInRadians)),
    };
  };

  // Function to generate the path for a ring segment
  const describeArc = (radiusPercentage: number, position: number): string => {
    // Define the start and end angles based on the quadrant position
    const startAngle = startAngles[position - 1];
    const endAngle = startAngle + 90;

    const radius = radiusPercentage * center; // Convert percentage to actual radius
    const start = polarToCartesian(radius, endAngle);
    const end = polarToCartesian(radius, startAngle);

    // prettier-ignore
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, 0, 0, end.x, end.y,
    ].join(" ");
  };

  const renderGlow = (position: number, color: string) => {
    const gradientId = `glow-${position}`;

    const cx = position === 1 || position === 3 ? 1 : 0;
    const cy = position === 1 || position === 2 ? 1 : 0;

    const x = position === 1 || position === 3 ? 0 : center;
    const y = position === 1 || position === 2 ? 0 : center;
    return (
      <>
        <defs>
          <radialGradient id={gradientId} x={0} y={0} r={1} cx={cx} cy={cy}>
            <stop offset="60%" stopColor={color} stopOpacity={0.5}></stop>
            <stop offset="100%" stopColor={color} stopOpacity={0}></stop>
          </radialGradient>
        </defs>
        <rect
          width={center}
          height={center}
          x={x}
          y={y}
          fill={`url(#${gradientId})`}
        />
      </>
    );
  };

  // Fungsi untuk menempatkan blip dengan jarak sama ke pusat DAN antar blip di satu ring (sudut dibagi rata 360 derajat)
  const renderItem = (item: Item) => {
    const ring = rings.find((r) => r.id === item.ring);
    const quadrant = quadrants.find((q) => q.id === item.quadrant);
    if (!ring || !quadrant) return null;

    // Cari semua item di ring yang sama (tanpa mempedulikan quadrant)
    const itemsInSameRing = items.filter((i) => i.ring === item.ring);
    const idx = itemsInSameRing.findIndex((i) => i.id === item.id);
    const count = itemsInSameRing.length;

    // Radius tetap: di tengah ring
    const prevRing = rings[rings.findIndex((r) => r.id === ring.id) - 1];
    const rInner = prevRing ? (prevRing.radius ?? 0) : 0;
    const rOuter = ring.radius ?? 1;
    const radius = ((rInner + rOuter) / 2) * center;

    // Sudut untuk blip ini (dibagi rata 360 derajat)
    const angleStep = 360 / count;
    // Mulai dari -90 derajat (atas lingkaran)
    const angle = -90 + idx * angleStep;

    // Hitung posisi x, y
    const angleRad = (angle * Math.PI) / 180.0;
    const x = Math.round(center + radius * Math.cos(angleRad));
    const y = Math.round(center + radius * Math.sin(angleRad));

    // Offset label ke kanan blip
    const labelOffset = 18;

    // Ambil deskripsi singkat (strip tag html, max 120 char)
    let desc = item.body ? item.body.replace(/<[^>]+>/g, "").trim() : "";
    if (!desc) {
      desc = `Belum ada deskripsi. Masuk ke label ${ring.title} pada ${formatRelease(item.release)}.`;
    } else if (desc.length > 120) {
      desc = desc.slice(0, 117) + "...";
    }
    const tooltipText = `${item.title}\n${desc}\nLabel: ${ring.title} (${formatRelease(item.release)})`;

    return (
      <g key={item.id}>
        <Link
          href={`/${item.quadrant}/${item.id}`}
          data-tooltip={tooltipText}
          data-tooltip-color={quadrant.color}
          tabIndex={-1}
          style={{ outline: "none", boxShadow: "none" }}
        >
          <Blip flag={item.flag} color={ring.color} x={x} y={y} />
        </Link>
        <text
          x={x + labelOffset}
          y={y + 4}
          fontSize="12"
          fill="#111"
          fontWeight="bold"
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {item.title}
        </text>
      </g>
    );
  };

  const renderRingLabels = () => {
    return rings.map((ring, index) => {
      const outerRadius = ring.radius || 1;
      const innerRadius = rings[index - 1]?.radius || 0;
      const position = ((outerRadius + innerRadius) / 2) * center;

      return (
        <Fragment key={ring.id}>
          <text
            x={center + position}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
          >
            {ring.title}
          </text>
          <text
            x={center - position}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
          >
            {ring.title}
          </text>
        </Fragment>
      );
    });
  };

  // Fungsi utilitas untuk mencerahkan/menggelapkan warna HEX
  function shadeColor(color: string, percent: number) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);
    R = Math.min(255, Math.max(0, R + Math.round(255 * percent)));
    G = Math.min(255, Math.max(0, G + Math.round(255 * percent)));
    B = Math.min(255, Math.max(0, B + Math.round(255 * percent)));
    return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(2, "0")}${B.toString(16).padStart(2, "0")}`;
  }

  // Generate radial gradients for each ring, warnanya modern tapi tetap sesuai warna ring
  const ringGradients = (
    <defs>
      {rings.map((ring) => {
        // fallback jika ring.color bukan hex, gunakan biru
        let base = ring.color.match(/^#([0-9a-f]{6})$/i)
          ? ring.color
          : "#1976d2";
        const light = shadeColor(base, 0.45); // lebih terang
        const dark = shadeColor(base, -0.1); // sedikit lebih gelap, tidak terlalu abu
        return (
          <radialGradient
            key={`ring-fill-${ring.id}`}
            id={`ring-fill-${ring.id}`}
            cx="50%"
            cy="50%"
            r="100%"
          >
            <stop offset="20%" stopColor={light} stopOpacity="0.85" />
            <stop offset="100%" stopColor={dark} stopOpacity="0.32" />
          </radialGradient>
        );
      })}
    </defs>
  );

  return (
    <svg
      className={className}
      width={viewBoxSize}
      height={viewBoxSize}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      style={{ background: "#fff" }}
    >
      {ringGradients}
      {/* Draw filled rings from outer to inner */}
      {rings
        .slice()
        .reverse()
        .map((ring, idx) => (
          <circle
            key={`ring-fill-${ring.id}`}
            cx={center}
            cy={center}
            r={(ring.radius ?? 1) * center}
            fill={`url(#ring-fill-${ring.id})`}
            stroke={ring.color}
            strokeWidth={ring.strokeWidth || 2}
          />
        ))}
      <g className={styles.items}>{items.map((item) => renderItem(item))}</g>
      <g className={styles.ringLabels}>{renderRingLabels()}</g>
    </svg>
  );
};

export const Chart = memo(_Chart);
