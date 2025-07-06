import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

interface Props {
  data: any[];
  stepTitles: string[];
  colors: string[];
}

export default function StackedAreaChart({ data, stepTitles, colors }: Props) {
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
              <XAxis dataKey="name" fontSize={window.innerWidth < 640 ? 10 : 12} />
              <YAxis unit="s" fontSize={window.innerWidth < 640 ? 10 : 12} />
              <Tooltip formatter={(v: number) => `${v}s`} />
              <Legend />
              {stepTitles.map((title, idx) => (
                <Area
                  key={title}
                  type="monotone"
                  dataKey={title}
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
