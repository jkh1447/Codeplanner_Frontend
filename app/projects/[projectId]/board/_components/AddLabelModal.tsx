import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddLabelModalProps {
    labelName: string;
    setLabelName: (name: string) => void;
    selectedColor: string;
    setSelectedColor: (color: string) => void;
    handleSave: () => void;
    handleCancel: () => void;
}

export default function AddLabelModal({
    labelName,
    setLabelName,
    selectedColor,
    setSelectedColor,
    handleSave,
    handleCancel,
}: AddLabelModalProps) {
    return (
        <DialogContent 
            className="sm:max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
        >
            <DialogHeader>
                <DialogTitle>새 레이블 추가</DialogTitle>
                <DialogDescription>
                    레이블 이름과 배경 색상을 선택해주세요.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                {/* 레이블 이름 입력 */}
                <div className="space-y-2">
                    <Label htmlFor="label-name">레이블 이름</Label>
                    <Input
                        id="label-name"
                        placeholder="레이블 이름을 입력하세요"
                        value={labelName}
                        onChange={(e) => setLabelName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSave();
                            }
                        }}
                    />
                </div>
                {/* 색상 선택 */}
                <div className="space-y-2">
                    <Label htmlFor="color-picker">배경 색상</Label>
                    <div className="flex items-center gap-3">
                        <input
                            id="color-picker"
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">
                                선택된 색상
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                                {selectedColor.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
                {/* 미리보기 */}
                {labelName && (
                    <div className="space-y-2">
                        <Label>미리보기 </Label>
                        <div
                            className="inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium"
                            style={{ backgroundColor: selectedColor }}
                        >
                            {labelName}
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                    취소
                </Button>
                <Button onClick={handleSave} disabled={!labelName.trim()}>
                    저장
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
