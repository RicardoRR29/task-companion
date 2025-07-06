import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

interface PauseRun {
  counts: Record<string, number>;
}

interface StepInfo {
  id: string;
  title: string;
}

interface Props {
  pauseRuns: PauseRun[];
  steps: StepInfo[];
  maxCount: number;
}

export default function PauseHeatmap({ pauseRuns, steps, maxCount }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Heatmap de Pausas</CardTitle>
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
                {pauseRuns.map((run, i) => (
                  <tr key={i}>
                    <td className="border p-2 font-medium sm:p-3">#{i + 1}</td>
                    {steps.map((s, j) => {
                      const v = run.counts[s.id] ?? 0;
                      const alpha = v ? 0.3 + 0.7 * (v / maxCount) : 0;
                      const bg = v ? `rgba(59,130,246,${alpha})` : "#f3f4f6";
                      return (
                        <td key={j} className="border p-2 text-center sm:p-3" style={{ backgroundColor: bg }}>
                          {v || "–"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
