export function FieldError({ error }: { error: string }) {
  return <span className="text-xs font-medium text-destructive">{error}</span>;
}
