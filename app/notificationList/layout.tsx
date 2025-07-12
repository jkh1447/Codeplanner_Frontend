
import React from "react";
import TopNavBar from "../projects/[projectId]/_components/TopNavBar";


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

            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}
