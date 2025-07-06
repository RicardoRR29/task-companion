import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

interface DataItem {
  name: string;
  totalTime: number;
  color: string;
}

interface Props {
  data: DataItem[];
}

export default function TotalTimeChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Tempo total por passo (s)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full sm:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 20,
                bottom: window.innerWidth < 640 ? 80 : 60,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={window.innerWidth < 640 ? -45 : -30}
                textAnchor="end"
                height={window.innerWidth < 640 ? 80 : 60}
                fontSize={window.innerWidth < 640 ? 10 : 12}
                interval={0}
              />
              <YAxis unit="s" fontSize={window.innerWidth < 640 ? 10 : 12} />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)} s`} />
              <Legend />
              <Bar dataKey="totalTime">
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
