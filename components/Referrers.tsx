import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Referrers({
  data,
}: {
  data: { domain: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referrers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {data.map(({ domain, count }) => (
            <div className="flex justify-between items-center" key={domain}>
              <p className="text-muted-foreground">{domain}</p>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
