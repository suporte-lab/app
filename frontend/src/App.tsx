import { useEffect, useState } from "react";
import "./App.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

async function getTotal() {
  const res = await api.expenses.total.$get();

  if (!res.ok) {
    throw new Error("server error");
  }

  return await res.json();
}

function App() {
  const { data, error, isPending } = useQuery({
    queryKey: ["total"],
    queryFn: getTotal,
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Spent</CardTitle>
        <CardDescription>The total amount you've spent</CardDescription>
      </CardHeader>
      <CardContent>{data.total}</CardContent>
    </Card>
  );
}

export default App;
