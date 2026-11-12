import Shell from "@/components/Shell";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="app relative min-h-screen md:pl-56"><Shell /><div className="mx-auto max-w-[1300px]">{children}</div></div>;
}
