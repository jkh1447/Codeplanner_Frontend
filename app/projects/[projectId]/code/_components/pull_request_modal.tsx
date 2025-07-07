"use client";

import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
  } from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { useEffect, useState } from "react";
  import { useParams } from "next/navigation";
  import { getApiUrl } from "@/lib/api";
  import { Button } from "@/components/ui/button";

export default function PullRequestModal({
    open,
    onOpenChange,
    number,
}:{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    number: number;
}) {

    const {projectId} = useParams();
    const [changeList, setChangeList] = useState([]);
    const [owner, setOwner] = useState("");
    const [repo, setRepo] = useState("");
    useEffect(() => {
        const getOwner = async () => {
            const projectRes = await fetch(`${getApiUrl()}/projects/${projectId}`, {
                credentials: "include",
              });
            if(!projectRes.ok) {
                throw new Error("Failed to fetch project");
            }
            const project = await projectRes.json();
            const repoUrl = project.repository_url;
            const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
            if(!match) {
                throw new Error("Invalid repository URL");
            }
            const owner = match[1];
            const repo = match[2];
            setOwner(owner);
            setRepo(repo);
            
            await fetchChangeList(owner, repo);
        }
        const fetchChangeList = async (owner: string, repo: string) => {
            console.log("number : ", number);
            console.log("owner : ", owner);
            console.log("repo : ", repo);
            const response = await fetch(`${getApiUrl()}/github/project/${projectId}/pull-request-file-changes/${number}/${owner}/${repo}`, {
                credentials: "include",
                method: "GET",
            });
            if(!response.ok) {
                throw new Error("Failed to fetch change list");
            }
            const data = await response.json();
            console.log(data);
            setChangeList(data);
        }
        getOwner();
    }, [])
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pull Request</DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}