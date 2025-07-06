import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import useIsMobile from "../../hooks/use-is-mobile";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

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
}

export default function StackedAreaChart({ data, steps, colors }: Props) {
  const isMobile = useIsMobile();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Área Empilhada – Últimas 5</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full sm:h-72 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={isMobile ? 10 : 12} />
              <YAxis unit="s" fontSize={isMobile ? 10 : 12} />
              <Tooltip formatter={(v: number) => `${v}s`} />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 8 }}
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
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
