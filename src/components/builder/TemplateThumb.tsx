import type { TemplateId } from "@/lib/types";

/**
 * Schematic thumbnails for the template picker.
 *
 * Deliberately abstract wireframes rather than screenshots: a template's real
 * appearance depends on the chosen theme, so showing a fixed screenshot would
 * promise something the user will not get.
 */

const BAR = "rgba(90,75,240,0.85)";
const BLOCK = "rgba(86,91,104,0.30)";
const FAINT = "rgba(86,91,104,0.14)";

function Box({
  x,
  y,
  w,
  h,
  fill = BLOCK,
  r = 1.5,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  r?: number;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} />;
}

const SHAPES: Record<TemplateId, React.ReactNode> = {
  minimal: (
    <>
      <Box x={26} y={7} w={28} h={2.5} fill={BAR} />
      <Box x={20} y={16} w={40} h={5} />
      <Box x={24} y={24} w={32} h={2} fill={FAINT} />
      <Box x={20} y={32} w={40} h={8} fill={FAINT} />
      <Box x={20} y={43} w={40} h={8} fill={FAINT} />
    </>
  ),
  classic: (
    <>
      <Box x={0} y={0} w={80} h={7} fill={FAINT} r={0} />
      <Box x={4} y={2.5} w={10} h={2} fill={BAR} />
      <Box x={52} y={2.5} w={6} h={2} />
      <Box x={60} y={2.5} w={6} h={2} />
      <Box x={68} y={2.5} w={8} h={2} fill={BAR} />
      <Box x={6} y={13} w={34} h={6} />
      <Box x={6} y={22} w={26} h={2} fill={FAINT} />
      <Box x={6} y={31} w={33} h={10} fill={FAINT} />
      <Box x={41} y={31} w={33} h={10} fill={FAINT} />
      <Box x={6} y={44} w={33} h={10} fill={FAINT} />
      <Box x={41} y={44} w={33} h={10} fill={FAINT} />
    </>
  ),
  sidebar: (
    <>
      <Box x={0} y={0} w={24} h={60} fill={FAINT} r={0} />
      <circle cx={12} cy={12} r={6} fill={BAR} />
      <Box x={5} y={22} w={14} h={2} />
      <Box x={5} y={30} w={14} h={2} fill={FAINT} />
      <Box x={5} y={35} w={14} h={2} fill={FAINT} />
      <Box x={5} y={40} w={14} h={2} fill={FAINT} />
      <Box x={30} y={8} w={30} h={5} />
      <Box x={30} y={17} w={22} h={2} fill={FAINT} />
      <Box x={30} y={26} w={20} h={12} fill={FAINT} />
      <Box x={53} y={26} w={21} h={12} fill={FAINT} />
      <Box x={30} y={42} w={44} h={10} fill={FAINT} />
    </>
  ),
  tabbed: (
    <>
      <Box x={0} y={0} w={80} h={7} fill={FAINT} r={0} />
      <Box x={4} y={2.5} w={10} h={2} fill={BAR} />
      <Box x={6} y={12} w={68} h={8} fill={FAINT} r={3} />
      <Box x={9} y={14.5} w={14} h={3} fill={BAR} r={2} />
      <Box x={26} y={14.5} w={14} h={3} />
      <Box x={43} y={14.5} w={14} h={3} />
      <Box x={6} y={26} w={34} h={4} />
      <Box x={6} y={34} w={68} h={8} fill={FAINT} />
      <Box x={6} y={45} w={68} h={8} fill={FAINT} />
    </>
  ),
  magazine: (
    <>
      <Box x={0} y={0} w={80} h={6} fill={FAINT} r={0} />
      <Box x={6} y={12} w={60} h={8} />
      <Box x={6} y={23} w={40} h={2} fill={FAINT} />
      <rect x={6} y={29} width={68} height={0.6} fill={BAR} />
      <Box x={6} y={34} w={20} h={3} fill={BAR} />
      <Box x={30} y={34} w={44} h={20} fill={FAINT} />
      <Box x={6} y={40} w={20} h={14} fill={FAINT} />
    </>
  ),
  terminal: (
    <>
      <rect x={4} y={4} width={72} height={52} rx={3} fill="none" stroke={BLOCK} strokeWidth={1} />
      <Box x={4} y={4} w={72} h={7} fill={FAINT} r={3} />
      <circle cx={9} cy={7.5} r={1.6} fill="rgba(217,45,67,0.8)" />
      <circle cx={14} cy={7.5} r={1.6} fill="rgba(154,98,6,0.8)" />
      <circle cx={19} cy={7.5} r={1.6} fill="rgba(10,125,88,0.8)" />
      <Box x={9} y={17} w={3} h={2} fill={BAR} />
      <Box x={14} y={17} w={30} h={2} />
      <Box x={9} y={24} w={3} h={2} fill={BAR} />
      <Box x={14} y={24} w={44} h={2} fill={FAINT} />
      <Box x={9} y={31} w={58} h={8} fill={FAINT} />
      <Box x={9} y={42} w={58} h={8} fill={FAINT} />
    </>
  ),
  canvas: (
    <>
      <Box x={28} y={5} w={24} h={2} fill={BAR} />
      <Box x={3} y={12} w={36} h={22} fill={FAINT} />
      <Box x={41} y={12} w={36} h={14} fill={FAINT} />
      <Box x={41} y={28} w={17} h={16} fill={FAINT} />
      <Box x={60} y={28} w={17} h={16} fill={FAINT} />
      <Box x={3} y={36} w={36} h={18} fill={FAINT} />
      <Box x={41} y={46} w={36} h={8} fill={FAINT} />
    </>
  ),
  timeline: (
    <>
      <Box x={0} y={0} w={22} h={60} fill={FAINT} r={0} />
      <circle cx={11} cy={10} r={5} fill={BAR} />
      <Box x={4} y={20} w={14} h={2} fill={FAINT} />
      <Box x={4} y={25} w={14} h={2} fill={FAINT} />
      <rect x={30} y={8} width={0.8} height={46} fill={BLOCK} />
      <circle cx={30.4} cy={13} r={2.4} fill={BAR} />
      <circle cx={30.4} cy={30} r={2.4} fill={BAR} />
      <circle cx={30.4} cy={46} r={2.4} fill={BAR} />
      <Box x={36} y={10} w={38} h={7} fill={FAINT} />
      <Box x={36} y={27} w={38} h={7} fill={FAINT} />
      <Box x={36} y={43} w={38} h={7} fill={FAINT} />
    </>
  ),
  bento: (
    <>
      <Box x={0} y={0} w={80} h={7} fill={FAINT} r={0} />
      <Box x={4} y={2.5} w={10} h={2} fill={BAR} />
      <Box x={5} y={12} w={70} h={12} fill={FAINT} r={3} />
      <Box x={5} y={27} w={33} h={12} fill={FAINT} r={3} />
      <Box x={41} y={27} w={16} h={12} fill={FAINT} r={3} />
      <Box x={59} y={27} w={16} h={12} fill={FAINT} r={3} />
      <Box x={5} y={42} w={16} h={12} fill={FAINT} r={3} />
      <Box x={23} y={42} w={52} h={12} fill={FAINT} r={3} />
    </>
  ),
  onepage: (
    <>
      <rect x={0} y={0} width={80} height={60} fill="none" />
      <Box x={18} y={14} w={44} h={7} />
      <Box x={26} y={25} w={28} h={2} fill={FAINT} />
      <Box x={30} y={33} w={9} h={3} fill={BAR} r={2} />
      <Box x={41} y={33} w={9} h={3} r={2} />
      <circle cx={74} cy={24} r={1.8} fill={BAR} />
      <circle cx={74} cy={30} r={1.8} fill={BLOCK} />
      <circle cx={74} cy={36} r={1.8} fill={BLOCK} />
      <rect x={0} y={54} width={80} height={0.6} fill={BLOCK} />
    </>
  ),
};

export function TemplateThumb({ id }: { id: TemplateId }) {
  return (
    <svg
      viewBox="0 0 80 60"
      className="block h-auto w-full bg-[var(--color-ink)]"
      role="presentation"
      aria-hidden="true"
    >
      {SHAPES[id]}
    </svg>
  );
}
