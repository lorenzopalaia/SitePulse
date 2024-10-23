import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Pages({
  data,
}: {
  data: { page: string; count: number }[];
}) {
  const pages = data.sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {pages.map(({ page, count }) => (
            <div className="flex items-center justify-between" key={page}>
              <p className="text-muted-foreground">{page}</p>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
