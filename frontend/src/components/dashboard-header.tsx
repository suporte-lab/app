import { Card } from "./ui/card";

export function DashboardHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <Card className="py-4 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </Card>
  );
}
