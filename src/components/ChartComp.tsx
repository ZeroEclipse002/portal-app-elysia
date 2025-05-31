"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface FamilyMember {
  gender: string;
  fullName: string;
  birthDate: string;
  relationship: string;
}

interface Family {
  id: number;
  userId: string;
  data: FamilyMember[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  family: Family | null;
}

export function Component({ users }: { users: User[] }) {
  // Define red shades to use for all charts
  const redShades = [
    "hsl(0, 70%, 50%)",   // Standard red
    "hsl(0, 70%, 60%)",   // Lighter red
    "hsl(0, 70%, 40%)",   // Darker red
    "hsl(0, 70%, 70%)",   // Light red
    "hsl(0, 70%, 30%)",   // Dark red
    "hsl(0, 70%, 80%)",   // Very light red
    "hsl(0, 70%, 20%)",   // Very dark red
    "hsl(0, 60%, 55%)",   // Muted red
  ];

  const relationshipData = React.useMemo(() => {
    const relationships: { [key: string]: number } = {};
    users.forEach((user) => {
      if (user.family?.data) {
        user.family.data.forEach((member) => {
          relationships[member.relationship] =
            (relationships[member.relationship] || 0) + 1;
        });
      }
    });
    return Object.entries(relationships).map(([relationship, count], index) => ({
      type: relationship,
      count,
      fill: redShades[index % redShades.length],
    }));
  }, [users]);

  const genderData = React.useMemo(() => {
    const genders: { [key: string]: number } = {};
    users.forEach((user) => {
      if (user.family?.data) {
        user.family.data.forEach((member) => {
          genders[member.gender] = (genders[member.gender] || 0) + 1;
        });
      }
    });
    return Object.entries(genders).map(([gender, count], index) => ({
      type: gender,
      count,
      fill: redShades[index % redShades.length],
    }));
  }, [users]);

  function getBracketColor(bracket: string): string {
    switch (bracket) {
      case "1-14":
        return "hsl(0, 70%, 50%)";  // Standard red
      case "14-24 Youth":
        return "hsl(0, 70%, 60%)";  // Lighter red
      case "25-59":
        return "hsl(0, 70%, 40%)";  // Darker red
      case "60+ Senior":
        return "hsl(0, 70%, 30%)";  // Dark red
      default:
        return "hsl(0, 70%, 50%)";  // Default red
    }
  }

  const ageBracketData = React.useMemo(() => {
    const ageBrackets: { [key: string]: number } = {
      "1-14": 0,
      "14-24 Youth": 0,
      "25-59": 0,
      "60+ Senior": 0,
    };

    users.forEach((user) => {
      if (user.family?.data) {
        user.family.data.forEach((member) => {
          const birthDate = new Date(member.birthDate);
          const age = new Date().getFullYear() - birthDate.getFullYear();

          if (age >= 1 && age < 14) ageBrackets["1-14"]++;
          else if (age >= 14 && age < 25) ageBrackets["14-24 Youth"]++;
          else if (age >= 25 && age < 60) ageBrackets["25-59"]++;
          else if (age >= 60) ageBrackets["60+ Senior"]++;
        });
      }
    });

    return Object.entries(ageBrackets).map(([bracket, count]) => ({
      type: bracket,
      count,
      fill: getBracketColor(bracket),
    }));
  }, [users]);

  const chartConfig: ChartConfig = {
    count: { label: "Count" },
    relationship: { label: "Relationship", color: "hsl(var(--chart-1))" },
    gender: { label: "Gender", color: "hsl(var(--chart-2))" },
    age: { label: "Age", color: "hsl(var(--chart-3))" },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Family Relationships</CardTitle>
          <CardDescription>Distribution by Relationship Type</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={relationshipData}
                dataKey="count"
                nameKey="type"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const total = relationshipData.reduce(
                        (sum, item) => sum + item.count,
                        0
                      );
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {total}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Gender Distribution</CardTitle>
          <CardDescription>Distribution by Gender</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={genderData}
                dataKey="count"
                nameKey="type"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const total = genderData.reduce(
                        (sum, item) => sum + item.count,
                        0
                      );
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {total}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Age Distribution</CardTitle>
          <CardDescription>Distribution by Age Brackets</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={ageBracketData}
                dataKey="count"
                nameKey="type"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const total = ageBracketData.reduce(
                        (sum, item) => sum + item.count,
                        0
                      );
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {total}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
