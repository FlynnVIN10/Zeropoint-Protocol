export default function Prose({ children }: { children: React.ReactNode }) {
  return <div className="prose max-w-none prose-headings:scroll-mt-24">{children}</div>;
}
