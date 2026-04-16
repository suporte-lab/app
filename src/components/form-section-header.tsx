export function FormSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs tracking-wider uppercase font-medium bg-muted/50 p-3 border-b my-3 flex items-center gap-2">
      {children}
    </div>
  );
}
