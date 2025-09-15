import { HomeIcon, MapIcon, ChartBarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-5 pt-3 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-lg font-bold">CincoBasicos</h1>
        </Link>
        <div className="grid grid-cols-3 gap-3">
          <Button variant="ghost" asChild>
            <Link to="/">
              <HomeIcon />
              <span className="hidden xl:block">Início</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/monitoring">
              <ChartBarIcon />
              <span className="hidden xl:block">Monitoramento</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/map">
              <MapIcon />
              <span className="hidden xl:block">Mapa</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex-1 h-full grid m-5">{children}</div>
    </div>
  );
}
