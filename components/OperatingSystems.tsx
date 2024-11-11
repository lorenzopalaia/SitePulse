import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OperatingSystems({
  data,
}: {
  data: { os: string; count: number }[];
}) {
  const operatingSystems = data.sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>OS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {operatingSystems.map(({ os, count }) => (
            <div className="flex items-center justify-between" key={os}>
              <p className="text-muted-foreground">{os}</p>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
