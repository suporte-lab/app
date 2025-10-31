import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChartBarIcon, MapIcon } from "lucide-react";

export const Route = createFileRoute("/__public/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="border-2 rounded-3xl overflow-hidden space-y-10">
      <img src="/hero_image.png" alt="CincoBasicos" className="w-full" />
      <div className="flex flex-col items-center justify-center pb-10 p-5">
        <img
          src="/logo.png"
          alt="CincoBasicos"
          className="w-2/3 max-w-sm mb-8"
        />
        <p className="text-lg max-w-prose text-center text-slate-500 font-medium">
          Acompanhe implementação do Cinco Básicos nos municípios parceiros
        </p>
        <div className="w-full max-w-sm h-0.5 rounded-full bg-slate-100 my-6"></div>
        <div className="grid grid-cols-2 gap-3 mb-6 grow">
          <Button variant="outline" asChild>
            <Link to="/monitoring">
              <ChartBarIcon />
              Monitoramento
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/map">
              <MapIcon />
              Mapa
            </Link>
          </Button>
        </div>
        <Button variant="underline" size="inline" asChild>
          <Link to="/login">Entrar</Link>
        </Button>
      </div>
    </div>
  );
}
