import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Image from "next/image";

export default function ExternalLinks({
  data,
}: {
  data: { link: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>External Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {data.map(({ link, count }) => (
            <div className="flex justify-between items-center" key={link}>
              <div className="flex gap-2 items-center">
                <Image
                  src={`${new URL(link).origin}/favicon.ico`}
                  alt="Page icon"
                  width={24}
                  height={24}
                  className="rounded-full size-6"
                />
                <p className="text-muted-foreground">{link}</p>
              </div>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
