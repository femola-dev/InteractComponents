import { PieCanvas } from "./polar-canvas"
import { PolarRoot, type PolarRootProps } from "./polar-root"

type Row = object

export type PieChartProps<TData extends Row> = Omit<
  PolarRootProps<TData>,
  "chartType" | "Canvas"
>

/** Composable dither **pie** chart. Compose `<Pie>` inside, same as `<AreaChart>`/`<Area>`. */
export function PieChart<TData extends Row>(props: PieChartProps<TData>) {
  return <PolarRoot chartType="pie" Canvas={PieCanvas} {...props} />
}
