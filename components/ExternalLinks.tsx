import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ExternalLinks({
  data,
}: {
  data: { link: string; count: number }[];
}) {
  const links = data.sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>External Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {links.map(({ link, count }) => (
            <div className="flex justify-between items-center" key={link}>
              <div className="flex gap-2 items-center">
                <Avatar className="size-6">
                  <AvatarFallback>{new URL(link).hostname[0]}</AvatarFallback>
                  <AvatarImage src={`${new URL(link).origin}/favicon.ico`} />
                </Avatar>
                <p className="text-muted-foreground break-all">{link}</p>
              </div>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
