import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getCountryFlag } from "@/utils/countryUtils";

export default function Countries({
  data,
}: {
  data: { country: string; count: number }[];
}) {
  const countries = data.sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Countries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {countries.map(({ country, count }) => (
            <div className="flex items-center justify-between" key={country}>
              <p className="text-muted-foreground">{getCountryFlag(country)}</p>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
