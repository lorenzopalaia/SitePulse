import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Pages({
  data,
}: {
  data: { page: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {data.map(({ page, count }) => (
            <div className="flex justify-between items-center" key={page}>
              <p className="text-muted-foreground">{page}</p>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
