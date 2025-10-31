import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { useForm } from "@tanstack/react-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { MunicipalityResponseDTO, StateResponseDTO } from "@server/types";
import {
  zodToFieldErrors,
  putMunicipalitySchema,
  type PutMunicipalityParams,
} from "@server/schemas";
import { ulid } from "ulid";

export function MunicipalityForm() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<string>("");
  const [municipality, setMunicipality] = useState<string>("");
  const [open, setOpen] = useState(false);

  const defaultValues: PutMunicipalityParams = {
    name: "",
    state: "",
    latitude: 0,
    longitude: 0,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = putMunicipalitySchema.safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const res = await api.municipalities.$post({
        json: { ...value, id: ulid() },
      });

      if (!res.ok) {
        toast.error("Erro no servidor");
      }

      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["municipalities"] });
      toast.success("Município criado com sucesso");
    },
  });

  useEffect(() => {
    (async () => {
      if (!municipality || !state) return;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${municipality}&state=${state}&country=Brazil&format=json`
      );
      if (!res.ok) return;

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
  const { data, isLoading } = useQuery({
    queryKey: ["fetch", "municipalities", state],
    queryFn: async () => {
      const res = await fetch(
        `https://brasilapi.com.br/api/ibge/municipios/v1/${state}`,
        { signal: AbortSignal.timeout(2000) }
      );
      if (!res.ok) throw new Error("fetch error");

      return (await res.json()) as MunicipalityResponseDTO[];
    },
    enabled: !!state,
  });

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
  const { data } = useQuery({
    queryKey: ["fetch", "states"],
    queryFn: async () => {
      const res = await fetch("https://brasilapi.com.br/api/ibge/uf/v1", {
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) throw new Error("Failed to fetch states");

      return (await res.json()) as StateResponseDTO[];
    },
  });

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
