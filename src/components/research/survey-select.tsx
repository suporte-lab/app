import { getSurveysListOptions } from "@/server/services/research/options";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function SurveySelect({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  const { data } = useQuery(getSurveysListOptions());

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Formulário" />
      </SelectTrigger>
      <SelectContent>
        {data?.map(({ id, name }) => (
          <SelectItem key={id} value={id}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
