"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
}

export default function TimelineChart({ data, steps, colors }: Props) {
  const isMobile = useIsMobile();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg md:text-xl text-center sm:text-left">
          Timeline – Últimas 5 Execuções
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className={`w-full ${isMobile ? "h-64" : "h-72 sm:h-80 lg:h-96"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                left: isMobile ? 40 : 60,
                right: isMobile ? 10 : 20,
                top: isMobile ? 10 : 20,
                bottom: isMobile ? 60 : 80, // Mais espaço para as labels embaixo
              }}
            >
              <XAxis
                type="number"
                unit="s"
                fontSize={isMobile ? 9 : 11}
                tick={{ fontSize: isMobile ? 9 : 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={isMobile ? 35 : 55}
                fontSize={isMobile ? 8 : 10}
                tick={{ fontSize: isMobile ? 8 : 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`${v}s`, ""]}
                labelStyle={{ fontSize: isMobile ? 11 : 13 }}
                contentStyle={{
                  fontSize: isMobile ? 10 : 12,
                  padding: isMobile ? "6px" : "8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
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
                layout={isMobile ? "horizontal" : "horizontal"}
                payload={steps.map((step, idx) => ({
                  value: step.title,
                  type: "rect",
                  color: colors[idx % colors.length],
                  payload: { dataKey: step.id },
                }))}
              />
              {steps.map((step, idx) => (
                <Bar
                  key={step.id}
                  dataKey={step.id}
                  name={step.title}
                  stackId="a"
                  fill={colors[idx % colors.length]}
                  radius={isMobile ? [1, 1, 1, 1] : [2, 2, 2, 2]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
