export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 gradient-mesh opacity-70" aria-hidden />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
