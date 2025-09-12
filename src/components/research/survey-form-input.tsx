import { FieldError } from "../field-error";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DatePicker } from "../input/date-picker";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";

export function SurveyFormInput(params: {
  type: string;
  question: string;
  description?: string | null;
  error?: string;
  preview?: boolean;
  options?: { id: string; value: string }[];
  onChange?: (value: string) => void;
  value?: string;
}) {
  const { type } = params;

  return (
    <div>
      {type === "text" && <SurveyText {...params} />}
      {type === "number" && <SurveyNumber {...params} />}
      {type === "date" && <SurveyDate {...params} />}
      {type === "boolean" && <SurveyBoolean {...params} />}
      {type === "select" && <SurveySelect {...params} />}
    </div>
  );
}

function SurveyFormInputHeader({
  question,
  description,
  error,
}: {
  question: string;
  description?: string | null;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1 text-left">
      {error && <FieldError error={error} />}
      <div>{question.length > 0 ? question : "Pergunta vai aqui"}</div>
      {description && (
        <div className="text-sm text-muted-foreground font-normal text-left">
          {description}
        </div>
      )}
    </div>
  );
}

function SurveyText({
  question,
  error,
  description,
  onChange,
  value,
}: {
  question: string;
  error?: string;
  description?: string | null;
  onChange?: (value: string) => void;
  value?: string;
}) {
  const [inputValue, setInputValue] = useState(value ?? "");

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  return (
    <Label className="flex flex-col gap-2 items-start">
      <SurveyFormInputHeader
        question={question}
        description={description}
        error={error}
      />

      <Input
        className="font-normal"
        placeholder="Digite aqui..."
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange?.(e.target.value);
        }}
      />
    </Label>
  );
}

function SurveyNumber({
  question,
  error,
  description,
  onChange,
  value,
}: {
  question: string;
  error?: string;
  description?: string | null;
  onChange?: (value: string) => void;
  value?: string;
}) {
  const [inputValue, setInputValue] = useState(value ?? "");

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  return (
    <Label className="flex flex-col gap-2 items-start">
      <SurveyFormInputHeader
        question={question}
        description={description}
        error={error}
      />

      <Input
        className="font-normal"
        placeholder="Digite aqui..."
        type="number"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange?.(e.target.value);
        }}
      />
    </Label>
  );
}

function SurveyDate({
  question,
  error,
  description,
  onChange,
  value,
}: {
  question: string;
  error?: string;
  description?: string | null;
  onChange?: (value: string) => void;
  value?: string;
}) {
  const [inputValue, setInputValue] = useState(value ?? "");

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  return (
    <Label className="flex flex-col gap-2 items-start">
      <SurveyFormInputHeader
        question={question}
        description={description}
        error={error}
      />

      <DatePicker
        value={inputValue ? new Date(inputValue) : undefined}
        onChange={(value) => {
          setInputValue(value.toISOString());
          onChange?.(value.toISOString());
        }}
      />
    </Label>
  );
}

function SurveyBoolean({
  question,
  error,
  description,
  onChange,
  value,
}: {
  question: string;
  error?: string;
  description?: string | null;
  onChange?: (value: string) => void;
  value?: string;
}) {
  const [inputValue, setInputValue] = useState(value === "true");

  useEffect(() => {
    setInputValue(value === "true");
  }, [value]);

  return (
    <Label className="flex gap-2 justify-between items-start p-4 border rounded-md">
      <SurveyFormInputHeader
        question={question}
        description={description}
        error={error}
      />

      <Switch
        checked={inputValue}
        onCheckedChange={(checked) => {
          setInputValue(checked);
          onChange?.(checked ? "true" : "false");
        }}
      />
    </Label>
  );
}

function SurveySelect({
  question,
  error,
  description,
  options,
  onChange,
  value,
}: {
  question: string;
  error?: string;
  description?: string | null;
  options?: { id: string; value: string }[];
  onChange?: (value: string) => void;
  value?: string;
}) {
  const [inputValue, setInputValue] = useState(value ?? "");

  const opts = options?.filter((o) => o.value.length > 0);

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  return (
    <Label className="flex flex-col gap-2 items-start">
      <SurveyFormInputHeader
        question={question}
        description={description}
        error={error}
      />

      {!opts?.length ? (
        <div className="p-2 text-sm text-muted-foreground  font-normal border rounded-md border-dashed w-full text-center">
          Nenhuma opção
        </div>
      ) : (
        <Select
          value={inputValue}
          onValueChange={(value) => {
            setInputValue(value);
            onChange?.(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            {opts?.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Label>
  );
}
