import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Referrers({
  data,
}: {
  data: { referrer: string; count: number }[];
}) {
  const referrers = data.sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referrers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {referrers.map(({ referrer, count }) => (
            <div className="flex justify-between items-center" key={referrer}>
              <div className="flex gap-2 items-center">
                <Avatar className="size-6">
                  <AvatarFallback>{referrer[0]}</AvatarFallback>
                  <AvatarImage src={`https://www.${referrer}/favicon.ico`} />
                </Avatar>
                <p className="text-muted-foreground break-all">{referrer}</p>
              </div>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
