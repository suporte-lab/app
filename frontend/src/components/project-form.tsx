import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, User } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectCategorySelect } from "@/components/category-select";
import { MunicipalitySelect } from "@/components/municipality-select";
import { MapMarker } from "@/components/map-marker";
import { Map } from "@/components/map";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  api,
  fetchMunicipalitiesOptions,
  fetchProjectOptions,
} from "@/lib/api";
import {
  putProjectSchema,
  zodToFieldErrors,
  type PutProjectParams,
} from "@server/schemas";

export function ProjectForm({
  id,
  open,
  onOpenChange,
  trigger = true,
}: {
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { data: project } = useQuery(fetchProjectOptions(id ?? ""));
  const [openInternal, setOpenInternal] = useState(false);

  const { data: municipalities } = useQuery(fetchMunicipalitiesOptions());

  const defaultValues: PutProjectParams = {
    name: project?.name ?? "",
    categoryId: project?.categoryId ?? "",
    municipalityId: project?.municipalityId ?? "",
    responsibleName: project?.responsibleName ?? "",
    responsibleRole: project?.responsibleRole ?? "",
    responsiblePhone: project?.responsiblePhone ?? "",
    responsibleEmail: project?.responsibleEmail ?? "",
    addressStreet: project?.addressStreet ?? "",
    addressNumber: project?.addressNumber ?? "",
    addressZipCode: project?.addressZipCode ?? "",
    latitude: project?.latitude ?? 0,
    longitude: project?.longitude ?? 0,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = putProjectSchema.safeParse(value);
        return !result.success ? zodToFieldErrors(result.error) : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      let res;
      if (id) {
        res = await api.projects[":id"].$put({ param: { id }, json: value });
      } else {
        res = await api.projects.$post({ json: { ...value } });
      }

      if (!res.ok) {
        toast.error("Erro servidor");
        return;
      }

      setOpenInternal(false);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Operaçāo concluida com sucesso");
    },
  });

  return (
    <Dialog
      open={open ?? openInternal}
      onOpenChange={(open) => {
        if (onOpenChange) onOpenChange(open);
        setOpenInternal(open);

        setTimeout(() => {
          form.reset(defaultValues);
        }, 100);
      }}
    >
      {trigger && (
        <DialogTrigger asChild>
          {trigger === true ? (
            <Button>
              <Plus />
              Adicionar unidade
            </Button>
          ) : (
            trigger
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir unidade</DialogTitle>
          <DialogDescription>
            Defina uma nova unidade em um dos seus municípios.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <ScrollArea className="h-[calc(60vh)]">
            <div className="grid gap-3">
              <form.Field
                name="name"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Nome</Label>

                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <form.Field
                  name="municipalityId"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Município</Label>

                      <MunicipalitySelect
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />

                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />

                <form.Field
                  name="categoryId"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Categoria</Label>

                      <ProjectCategorySelect
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />

                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />
              </div>

              <div className="text-xs tracking-wider uppercase font-medium bg-muted/50 p-3 border-b my-3 flex items-center gap-2">
                <User className="size-4" /> Responsável
              </div>

              <form.Field
                name="responsibleName"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Nome</Label>

                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <form.Field
                  name="responsibleRole"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Cargo</Label>

                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />

                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />

                <form.Field
                  name="responsiblePhone"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Telefone</Label>

                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />

                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />
              </div>

              <form.Field
                name="responsibleEmail"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Email</Label>

                    <Input
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <div className="text-xs tracking-wider uppercase font-medium bg-muted/50 p-3 border-b my-3 flex items-center gap-2">
                <MapPin className="size-4" /> Endereço
              </div>

              <form.Field
                name="addressStreet"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Rua</Label>

                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    <FieldError error={field.state.meta.errors?.join(", ")} />
                  </div>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <form.Field
                  name="addressNumber"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Número</Label>

                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />

                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />

                <form.Field
                  name="addressZipCode"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>CEP</Label>

                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />

                      <FieldError error={field.state.meta.errors?.join(", ")} />
                    </div>
                  )}
                />
              </div>

              <form.Subscribe
                selector={(state) => state.values}
                children={(values) => {
                  const city = municipalities?.find(
                    (m) => m.id === values.municipalityId
                  )?.name;

                  return (
                    <CoordinatesFinder
                      city={city}
                      street={values.addressStreet}
                      number={values.addressNumber}
                      zipCode={values.addressZipCode}
                      onChange={(coordinates) => {
                        form.setFieldValue("latitude", coordinates.lat);
                        form.setFieldValue("longitude", coordinates.lng);
                      }}
                    />
                  );
                }}
              />
            </div>
          </ScrollArea>

          <div className="pt-3">
            <Button type="submit" className="w-full">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CoordinatesFinder({
  city,
  street,
  number,
  zipCode,
  onChange,
}: {
  city?: string;
  street: string;
  number?: string;
  zipCode: string;
  onChange: (coordinates: { lat: number; lng: number }) => void;
}) {
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  async function handleSearchAddress() {
    try {
      if (!city) return;

      const search = `${street},${number},${zipCode},${city},Brasil`;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${search}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      const lat = data.results[0].geometry.location.lat;
      const lng = data.results[0].geometry.location.lng;

      setCoordinates({ lat, lng });
      onChange({ lat, lng });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleSearchAddress}
        disabled={!city || !street || !zipCode}
      >
        Buscar localização
      </Button>

      {(!city || !street || !zipCode) && (
        <div className="space-y-1 p-4 mt-2 border border-dashed rounded-lg flex flex-col items-center justify-center">
          <div className="text-sm font-medium">Por preencher</div>
          <div className="flex text-muted-foreground text-sm gap-2">
            {!city && <p>Município</p>}
            {!street && <p>Rua</p>}
            {!zipCode && <p>CEP</p>}
          </div>
        </div>
      )}

      {coordinates && (
        <div className="aspect-video rounded-lg overflow-hidden">
          <Map
            key={`${coordinates.lat}-${coordinates.lng}`}
            center={[coordinates.lat, coordinates.lng]}
            zoom={16}
          >
            <MapMarker position={[coordinates.lat, coordinates.lng]} />
          </Map>
        </div>
      )}
    </div>
  );
}
