import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"

export default function TasksLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/"
          afterSelectOrganizationUrl="/"
          afterLeaveOrganizationUrl="/"
        />
        <UserButton />
      </header>
      {children}
    </div>
  )
}
