import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Image from "next/image";

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
                <Image
                  src={`https://www.${referrer}/favicon.ico`}
                  alt="Page icon"
                  width={24}
                  height={24}
                  className="rounded-full size-6"
                />
                <p className="text-muted-foreground">{referrer}</p>
              </div>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
