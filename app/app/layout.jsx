import AppShell from "@/components/AppShell";

export const metadata = { title: "Dashboard — CopyLaju.com" };

export default function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
