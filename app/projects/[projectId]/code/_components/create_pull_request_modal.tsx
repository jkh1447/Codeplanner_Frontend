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

export default function CreatePullRequestModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { projectId } = useParams();
  const [repo, setRepo] = useState("");
  const [owner, setOwner] = useState("");
  const [head, setHead] = useState("");
  const [base, setBase] = useState("");
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchRepo = async () => {
      const response = await fetch(
        `${getApiUrl()}/github/project/${projectId}/repo`,
        {
          credentials: "include",
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch repo");
      }
      const data = await response.json();
      console.log("레포지토리 정보 : ", data.name);
      console.log("레포지토리 소유자 : ", data.owner.login);
      setRepo(data.name);
      setOwner(data.owner.login);
    };
    const fetchBranches = async () => {
      const response = await fetch(
        `${getApiUrl()}/github/project/${projectId}/branches`,
        {
          credentials: "include",
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch branches");
      }
      const data = await response.json();
      setBranches(data);
    };
    fetchBranches();
    fetchRepo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Pull Request 생성");
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const prBody = formData.get("prBody") as string;
    const head = formData.get("head") as string;
    const base = formData.get("base") as string;
    console.log("title : ", title);
    console.log("head : ", head);
    console.log("base : ", base);
    console.log("repo : ", repo);
    console.log("owner : ", owner);
    console.log("prBody : ", prBody);
    if (head == base) {
      alert("헤드 브랜치와 베이스 브랜치는 다른 브랜치를 선택해주세요.");
      return;
    }
    const response = await fetch(
      `${getApiUrl()}/github/project/${projectId}/create-pull-request`,
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          head,
          base,
          repo,
          owner,
          prBody,
        }),
      }
    );
    if (!response.ok) {
      if (response.status == 422) {
        alert("이미 해당 브랜치 조합으로 풀 리퀘스트가 존재합니다.");
        return;
      }
      throw new Error("Failed to create pull request");
    }
    alert("Pull Request 생성 완료");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pull Request 생성</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                제목 *
              </Label>
              <Input id="title" name="title" placeholder="Pull Request 제목" />
              <Label htmlFor="prBody" className="text-base font-medium">
                설명
              </Label>
              <Textarea
                id="prBody"
                name="prBody"
                placeholder="Pull Request 설명"
              />
              <div className="grid grid-cols-3 gap-6 items-center">
                <Label
                  htmlFor="head"
                  className="text-base font-medium text-center"
                >
                  헤드 브랜치
                </Label>
                <Label className="text-base font-medium text-center">→</Label>
                <Label
                  htmlFor="base"
                  className="text-base font-medium text-center"
                >
                  베이스 브랜치
                </Label>
                <select
                  id="head"
                  name="head"
                  className="border rounded px-2 py-1"
                  value={head}
                  onChange={(e) => setHead(e.target.value)}
                >
                  {branches.map((branch: any) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <Label className="text-base font-medium text-center">→</Label>
                <select
                  id="base"
                  name="base"
                  className="border rounded px-2 py-1"
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                >
                  {branches.map((branch: any) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <div className="col-span-3 flex justify-end">
                  <Button type="submit" className="">
                    Pull Request 생성
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
