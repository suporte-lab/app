export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div></div>
      <div>{children}</div>
    </div>
  );
}
