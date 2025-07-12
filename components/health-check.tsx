"use client";

import { useState, useEffect } from "react";
import { checkBackendHealth } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const health = await checkBackendHealth();
      setIsHealthy(health);
      setLastChecked(new Date());
    } catch (error) {
      setIsHealthy(false);
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 헬스체크 실행
    checkHealth();
    
    // 30초마다 자동 헬스체크 (선택사항)
    // const interval = setInterval(checkHealth, 30000);
    
    // return () => clearInterval(interval);
  }, []);

  if (isHealthy === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <RefreshCw className="w-4 h-4 animate-spin" />
        서버 상태 확인 중...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isHealthy ? "default" : "destructive"} className="text-xs">
        {isHealthy ? (
          <>
            <Wifi className="w-3 h-3 mr-1" />
            서버 정상
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 mr-1" />
            서버 오류
          </>
        )}
      </Badge>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={checkHealth}
        disabled={isChecking}
        className="h-6 px-2 text-xs"
      >
        {isChecking ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <RefreshCw className="w-3 h-3" />
        )}
      </Button>
      
      {lastChecked && (
        <span className="text-xs text-gray-400">
          {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
} 