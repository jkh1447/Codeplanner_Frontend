import "../../globals.css";
import TopNavBar from "@/src/components/dashboard/TopNavBar";
import SideBar from "@/src/components/dashboard/SideBar";

export default function ProjectLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen flex-col">
            <header className=" bg-white">
                <TopNavBar />
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-gray-800 text-white h-full">
                    <SideBar />
                </aside>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
