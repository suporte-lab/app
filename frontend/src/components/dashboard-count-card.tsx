import { Card } from "@/components/ui/card";

export function DashboardCountCard({
  count,
  title,
}: {
  count: number;
  title: string;
}) {
  return (
    <Card className="px-6 hover:bg-muted group transition-colors duration-400 cursor-pointer">
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <h2 className="text-xl font-semibold flex transition-colors duration-400  items-center gap-2">
            {title}
          </h2>
        </div>

        <div className="text-4xl font-bold text-foreground transition-colors">
          {count}
        </div>
      </div>
    </Card>
  );
}
