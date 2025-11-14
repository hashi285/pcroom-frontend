// src/pages/ManagerDashboard/PcroomForm.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import React from "react";

interface PcroomFormData {
  nameOfPcroom: string;
  seatCount: number;
  port: number;
  width: number;
  height: number;
}

interface Seat {
  nameOfPcroom: string;
  seatNum: number;
  seatIp: string;
  x: number;
  y: number;
  posX: number;
  posY: number;
}

const PcroomForm = () => {
  const [form, setForm] = useState<PcroomFormData>({
    nameOfPcroom: "",
    seatCount: 0,
    port: 0,
    width: 0,
    height: 0,
  });

  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatSize, setSeatSize] = useState(90);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: Number(value) || value,
    }));
  };

  const generateSeats = () => {
    const seatArr: Seat[] = [];
    let seatNum = 1;

    for (let y = 1; y <= form.height; y++) {
      for (let x = 1; x <= form.width; x++) {
        if (seatNum > form.seatCount) break;
        seatArr.push({
          nameOfPcroom: form.nameOfPcroom,
          seatNum,
          seatIp: "",
          x,
          y,
          posX: (x - 1) * seatSize,
          posY: (y - 1) * seatSize,
        });
        seatNum++;
      }
    }
    setSeats(seatArr);
  };

  const handleSeatClick = (seatNum: number) => {
    const ip = prompt(
      "IP를 입력하세요:",
      seats.find((s) => s.seatNum === seatNum)?.seatIp || ""
    );
    if (ip !== null) {
      setSeats((prev) =>
        prev.map((s) => (s.seatNum === seatNum ? { ...s, seatIp: ip } : s))
      );
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:8080/pcrooms", form, {
        headers: { "Content-Type": "application/json" },
      });
      await axios.post("http://localhost:8080/pcrooms/seats", seats, {
        headers: { "Content-Type": "application/json" },
      });
      alert("피시방과 좌석 저장 완료!");
      setForm({ nameOfPcroom: "", seatCount: 0, port: 0, width: 0, height: 0 });
      setSeats([]);
    } catch (err) {
      console.error(err);
      alert("저장 실패");
    }
  };

  useEffect(() => {
    if (!form.width || !form.height) return;

    const availableWidth = window.innerWidth * 0.65;
    const availableHeight = window.innerHeight * 0.75;

    const seatWidth = availableWidth / form.width;
    const seatHeight = availableHeight / form.height;
    const size = Math.min(seatWidth, seatHeight, 120);

    setSeatSize(size);
    setContainerSize({
      width: form.width * size,
      height: form.height * size,
    });
  }, [form.width, form.height]);

  return (
    <div className="min-h-screen bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-6">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* 피시방 등록 카드 */}
          <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300 flex-1 p-4 bg-white/80 dark:bg-zinc-800/80 border border-border rounded-xl">
            <CardHeader>
              <CardTitle>피시방 등록</CardTitle>
              <CardDescription>
                입력한 가로·세로에 따라 좌석판 자동 조정
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-4">
                <input type="text" name="nameOfPcroom" placeholder="피시방 이름" value={form.nameOfPcroom} onChange={handleInputChange} className="border p-2 rounded focus:ring-2 focus:ring-primary/50" />
                <input type="number" name="seatCount" placeholder="좌석 수" value={form.seatCount || ""} onChange={handleInputChange} className="border p-2 rounded focus:ring-2 focus:ring-primary/50" />
                <input type="number" name="width" placeholder="가로 배열 수" value={form.width || ""} onChange={handleInputChange} className="border p-2 rounded focus:ring-2 focus:ring-primary/50" />
                <input type="number" name="height" placeholder="세로 배열 수" value={form.height || ""} onChange={handleInputChange} className="border p-2 rounded focus:ring-2 focus:ring-primary/50" />
                <input type="number" name="port" placeholder="포트 번호" value={form.port || ""} onChange={handleInputChange} className="border p-2 rounded focus:ring-2 focus:ring-primary/50" />
                <Button size="lg" onClick={generateSeats}>좌석 생성</Button>
                <Button size="lg" onClick={handleSubmit }>저장</Button>
              </div>
            </CardContent>
          </Card>

          {/* 좌석판 - PcroomSeatMap 스타일로 통일 */}
          <Card className="relative w-full h-[80vh] flex-1 p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-md">
            <CardHeader className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <CardTitle className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                좌석 배치도
              </CardTitle>
            </CardHeader>
            <CardContent className="relative w-full h-[calc(80vh-80px)] flex items-center justify-center">
              <div
                className="relative overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
                style={{ width: "100%", height: "100%" }}
              >
                <div
                  className="relative mx-auto my-auto origin-top-left transition-transform duration-150"
                  style={{
                    width: containerSize.width,
                    height: containerSize.height,
                    transform: `scale(1)`,
                  }}
                >
                  {seats.map((seat) => (
                    <div
                      key={seat.seatNum}
                      onClick={() => handleSeatClick(seat.seatNum)}
                      className={`absolute flex items-center justify-center text-xs font-bold rounded-md shadow-sm transition-colors duration-150 cursor-pointer
                        ${seat.seatIp ? "bg-blue-500 text-white" : "bg-zinc-400 text-white"}`}
                      style={{
                        top: seat.posY,
                        left: seat.posX,
                        width: seatSize - 4,
                        height: seatSize - 4,
                      }}
                    >
                      {seat.seatNum}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PcroomForm;
