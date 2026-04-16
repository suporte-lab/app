import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { z } from "zod";
import { setMunicipalitySchema } from "@/server/services/municipality/schemas";
import { zodToFieldErrors } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setMunicipalityFn } from "@/server/services/municipality/functions";
import { Label } from "../ui/label";
import { FieldError } from "../field-error";
import { useForm } from "@tanstack/react-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import {
  fetchMunicipalitiesOptions,
  fetchStatesOptions,
} from "@/server/services/municipality/options";

type Form = z.infer<ReturnType<typeof setMunicipalitySchema>>;

export function MunicipalitySetForm() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<string>("");
  const [municipality, setMunicipality] = useState<string>("");
  const [open, setOpen] = useState(false);

  const defaultValues: Form = {
    name: "",
    state: "",
    latitude: 0,
    longitude: 0,
  };

  const { mutate } = useMutation({
    mutationFn: setMunicipalityFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["municipalities"] });

      setOpen(false);

      setTimeout(() => {
        form.reset(defaultValues);
        setMunicipality("");
        setState("");
      }, 100);

      toast.success("Municipality set successfully");
    },
    onError: (error) => console.error(error.message),
  });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = setMunicipalitySchema().safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: ({ value }) => {
      mutate({ data: value });
    },
  });

  useEffect(() => {
    (async () => {
      if (!municipality || !state) return;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${municipality}&state=${state}&country=Brazil&format=json`
      );
      const data = await res.json();

      if (data.length > 0) {
        form.reset({
          state: state,
          name: municipality,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        });
      }
    })();
  }, [municipality]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);

        setTimeout(() => {
          form.reset(defaultValues);
          setMunicipality("");
          setState("");
        }, 100);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar município
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir município</DialogTitle>
          <DialogDescription className="sr-only">
            Selecione um município para definir a localização para o município.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-6">
            <div className="grid gap-6">
              <form.Field
                name="name"
                children={(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Município</Label>

                    <div className="space-y-2">
                      <StateSelect
                        value={state}
                        onChange={(value) => setState(value)}
                      />
                    </div>

                    <MunicipalitySelect
                      state={state}
                      value={municipality}
                      onChange={(value) => setMunicipality(value)}
                    />
                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MunicipalitySelect({
  state,
  value,
  onChange,
}: {
  state: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { data, isLoading } = useQuery(
    fetchMunicipalitiesOptions({ id: state })
  );

  if (isLoading) return <Skeleton className="h-10 w-full" />;

  if (!data?.length)
    return (
      <div className="text-sm border text-muted-foreground h-9 rounded-sm flex items-center justify-center">
        Sem resultados
      </div>
    );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Município" />
      </SelectTrigger>
      <SelectContent>
        {data?.map(({ nome, codigo_ibge }) => (
          <SelectItem key={codigo_ibge} value={nome}>
            {nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StateSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { data } = useQuery(fetchStatesOptions());

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Estado" />
      </SelectTrigger>
      <SelectContent>
        {data?.map(({ id, sigla, nome }) => (
          <SelectItem key={id} value={sigla}>
            {nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
