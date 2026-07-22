// The editor is a completely standalone full-screen experience.
// It has its own top bar (EditorTopbar) and does not use the
// MainNavbar from the (main) route group.
export default function EditorRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
