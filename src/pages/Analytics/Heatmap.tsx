import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import type { PathItem } from "../../types/flow";

interface SessionRun {
  path: PathItem[];
}

interface StepInfo {
  id: string;
  title: string;
}

interface Props {
  recentRuns: SessionRun[];
  steps: StepInfo[];
  maxDuration: number;
}

export default function Heatmap({ recentRuns, steps, maxDuration }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Heatmap de Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="border bg-gray-50 p-2 text-left font-medium sm:p-3">Sessão</th>
                  {steps.map((s) => (
                    <th
                      key={s.id}
                      className="border bg-gray-50 p-2 text-center font-medium sm:p-3"
                      style={{ minWidth: "80px" }}
                    >
                      <div className="truncate" title={s.title}>{s.title}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run, i) => {
                  const map = Object.fromEntries(
                    run.path.map((p) => [p.id, p.timeSpent / 1000])
                  );
                  return (
                    <tr key={i}>
                      <td className="border p-2 font-medium sm:p-3">#{i + 1}</td>
                      {steps.map((s, j) => {
                        const v = map[s.id] ?? 0;
                        const alpha = v ? 0.3 + 0.7 * (v / maxDuration) : 0;
                        const bg = v ? `rgba(59,130,246,${alpha})` : "#f3f4f6";
                        return (
                          <td key={j} className="border p-2 text-center sm:p-3" style={{ backgroundColor: bg }}>
                            {v ? Math.round(v) : "–"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
