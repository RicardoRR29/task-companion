import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

interface StepInfo {
  id: string;
  title: string;
}

interface Props {
  data: any[];
  steps: StepInfo[];
  colors: string[];
}

export default function TimelineChart({ data, steps, colors }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Timeline – Últimas 5 Execuções</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full sm:h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                left: window.innerWidth < 640 ? 60 : 80,
                right: 20,
                top: 20,
                bottom: 20,
              }}
            >
              <XAxis type="number" unit="s" fontSize={window.innerWidth < 640 ? 10 : 12} />
              <YAxis
                type="category"
                dataKey="name"
                width={window.innerWidth < 640 ? 60 : 100}
                fontSize={window.innerWidth < 640 ? 9 : 11}
              />
              <Tooltip formatter={(v: number) => `${v}s`} />
              <Legend />
              {steps.map((step, idx) => (
                <Bar
                  key={step.id}
                  dataKey={step.id}
                  name={step.title}
                  stackId="a"
                  fill={colors[idx % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
