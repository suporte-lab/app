import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProjectsImportDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState<{ type: string; message: string }[]>([]);

  const [importFile, setImportFile] = useState<File | null>(null);

  function generateImportCSV() {
    const headers =
      "Estado(SP),Municipio,Categoria,Unidade,Responsavel(Nome),Responsavel(Cargo),Responsavel(Telefone),Responsavel(Email),Rua,Numero,CEP";
    const csv = headers;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  }

  async function importData() {
    if (!importFile) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", importFile);

    const res = await fetch("/api/projects/import", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      toast.error("Erro servidor");
      return;
    }
    const body = await res.json();

    console.log(body);
    setLog(body.log);

    setIsLoading(false);
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    toast.success("Operaçāo concluida com sucesso");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>Importar dados</DialogTitle>
            <DialogDescription>
              Use o ficheiro para importar abaixo.
            </DialogDescription>
          </DialogHeader>
          <div>
            <form>
              <label htmlFor="file-input" className="sr-only">
                Choose file
              </label>
              <input
                type="file"
                name="file-input"
                id="file-input"
                className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none
    file:bg-gray-50 file:border-0
    file:me-4
    file:py-3 file:px-4
   "
                onChange={(e) => {
                  if (!e.target.files) {
                    setImportFile(null);
                    return;
                  }

                  const file = e.target.files[0];

                  if (file.type != "text/csv") {
                    setImportFile(null);
                    toast.error("Ficheiro invalido");
                    return;
                  }

                  setImportFile(e.target.files[0]);
                  console.log(e.target.files);
                }}
                accept=".csv,text/csv"
                multiple={false}
              />
            </form>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={!importFile || isLoading}
              onClick={() => importData()}
            >
              Importar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                generateImportCSV();
              }}
            >
              Gerar ficheiro tabela
            </Button>
          </div>
          <div className="space-y-2">
            {log.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "px-3 font-medium py-2 rounded-md text-foreground bg-foreground/10 text-xs",
                  item.type == "error" && "text-destructive bg-destructive/10",
                  item.type == "warning" && "text-amber-700 bg-amber-500/15",
                  item.type == "success" && "text-green-700 bg-green-500/15"
                )}
              >
                {item.message}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
