import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InternalLinks({
  data,
}: {
  data: { link: string; count: number }[];
}) {
  const links = data.sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {links.map(({ link, count }) => (
            <div className="flex justify-between items-center" key={link}>
              <p className="text-muted-foreground">{link}</p>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
