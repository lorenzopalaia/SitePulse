import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Referrers({
  data,
}: {
  data: { referrer: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referrers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {data.map(({ referrer, count }) => (
            <div className="flex justify-between items-center" key={referrer}>
              <p className="text-muted-foreground">{referrer}</p>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
