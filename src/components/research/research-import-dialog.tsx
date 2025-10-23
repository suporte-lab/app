import { DialogDescription } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getResearchQuestionsOptions } from "@/server/services/research/options";
import { getProjectsListOptions } from "@/server/services/project/options";
import { useState } from "react";
import { toast } from "sonner";
import { setResearchImportFn } from "@/server/services/research/functions";

export function ResearchImportDialog({ researchId, children }: { researchId: string, children: React.ReactNode }) {
  const { data: questions } = useQuery(getResearchQuestionsOptions({ id: researchId }));
  const { data: projects } = useQuery(getProjectsListOptions({}));

  const { mutate } = useMutation({
    mutationFn: setResearchImportFn
  })

  const [importFile, setImportFile] = useState<File | null>(null)

  function generateImportCSV() {
    if (!questions || !projects) return
    const headers = "Unidade," + questions.questions.map(q => q.question).join(",") + "\n"
    const rows = projects.map(p => p.name).join(",\n")
    const csv = headers + rows

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a");
    a.href = url
    a.download = "import.csv"
    a.click()

    window.URL.revokeObjectURL(url);
  }

  function importData() {
    if (!importFile) return

    const formData = new FormData();
    formData.append("id", researchId)
    formData.append('file', importFile)

    mutate({ data: formData })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar dados</DialogTitle>
          <DialogDescription>Use o ficheiro para importar abaixo.</DialogDescription>
        </DialogHeader>
        <div>
          <form>
            <label htmlFor="file-input" className="sr-only">Choose file</label>
            <input type="file" name="file-input" id="file-input" className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none
    file:bg-gray-50 file:border-0
    file:me-4
    file:py-3 file:px-4
   "
              onChange={(e) => {
                if (!e.target.files) {
                  setImportFile(null)
                  return
                }

                const file = e.target.files[0]

                if (file.type != "text/csv") {
                  setImportFile(null)
                  toast.error("Ficheiro invalido")
                  return
                }

                setImportFile(e.target.files[0])
                console.log(e.target.files)
              }}
              accept=".csv,text/csv"
              multiple={false}
            />
          </form>
        </div>
        <div className="flex gap-2">
          <Button disabled={!importFile} onClick={() => importData()}>Importar</Button>
          <Button
            variant="outline"
            onClick={() => {
              generateImportCSV();
            }}
          >
            Gerar ficheiro tabela
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
