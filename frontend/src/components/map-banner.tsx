import { useState } from "react";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Map } from "./map";
import { Maximize, Minimize, Unlock, Lock } from "lucide-react";

export function MapBanner({
  center,
  children,
}: {
  center: [number, number];
  children?: React.ReactNode;
}) {
  const [expand, setExpand] = useState(false);
  const [locked, setLocked] = useState(false);

  return (
    <div className="relative">
      <div
        className={cn(
          "aspect-[16/4] transition-all rounded-lg overflow-hidden relative isolate",
          expand && "aspect-[16/9]"
        )}
      >
        <Map
          key={`${center[0]}-${center[1]}-${expand}-${locked}`}
          zoom={12}
          center={center}
          locked={locked}
          variant="colored"
        >
          {children}
        </Map>
      </div>

      <div className="z-10 absolute bottom-5 right-5 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setExpand(!expand)}
        >
          {expand ? <Minimize /> : <Maximize />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocked(!locked)}
        >
          {locked ? <Lock /> : <Unlock />}
        </Button>
      </div>
    </div>
  );
}
