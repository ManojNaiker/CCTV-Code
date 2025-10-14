import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StateWiseChartProps {
  data: { state: string; online: number; offline: number }[];
}

export function StateWiseChart({ data }: StateWiseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>State-wise Device Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="state" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Bar dataKey="online" fill="hsl(var(--chart-2))" name="Online" />
            <Bar dataKey="offline" fill="hsl(var(--chart-3))" name="Offline" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
