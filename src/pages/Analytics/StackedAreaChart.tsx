import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import useIsMobile from "@/hooks/use-is-mobile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StepInfo {
  id: string;
  title: string;
}

interface ChartRow {
  name: string;
  [key: string]: number | string;
}

interface Props {
  data: ChartRow[];
  steps: StepInfo[];
  colors: string[];
  runsToShow: number | "all";
}

export default function StackedAreaChart({
  data,
  steps,
  colors,
  runsToShow,
}: Props) {
  const isMobile = useIsMobile();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg md:text-xl text-center sm:text-left">
          {`Área Empilhada – ${
            runsToShow === "all" ? "Todas" : `Últimas ${runsToShow}`
          }`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className={`w-full ${isMobile ? "h-64" : "h-72 sm:h-80 lg:h-96"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: isMobile ? 10 : 20,
                right: isMobile ? 10 : 20,
                left: isMobile ? 10 : 20,
                bottom: isMobile ? 60 : 80, // Mais espaço para as labels embaixo
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                strokeOpacity={isMobile ? 0.3 : 0.5}
              />
              <XAxis
                dataKey="name"
                fontSize={isMobile ? 9 : 11}
                tick={{ fontSize: isMobile ? 9 : 11 }}
                axisLine={false}
                tickLine={false}
                interval={isMobile ? "preserveStartEnd" : 0}
              />
              <YAxis
                unit="s"
                fontSize={isMobile ? 9 : 11}
                tick={{ fontSize: isMobile ? 9 : 11 }}
                axisLine={false}
                tickLine={false}
                width={isMobile ? 30 : 40}
              />
              <Tooltip
                formatter={(v: number) => [`${v}s`, ""]}
                labelStyle={{ fontSize: isMobile ? 11 : 13 }}
                contentStyle={{
                  fontSize: isMobile ? 10 : 12,
                  padding: isMobile ? "6px" : "8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  paddingTop: isMobile ? 12 : 16,
                  fontSize: isMobile ? "10px" : "12px",
                }}
                iconSize={isMobile ? 8 : 12}
                layout="horizontal"
              />
              {steps.map((step, idx) => (
                <Area
                  key={step.id}
                  type="monotone"
                  dataKey={step.id}
                  name={step.title}
                  stackId="1"
                  stroke={colors[idx % colors.length]}
                  fill={colors[idx % colors.length]}
                  fillOpacity={isMobile ? 0.7 : 0.6}
                  strokeWidth={isMobile ? 1.5 : 2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
