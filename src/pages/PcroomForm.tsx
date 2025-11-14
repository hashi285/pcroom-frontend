// src/pages/ManagerDashboard/PcroomForm.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import Draggable from "react-draggable";
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
  ref: React.RefObject<HTMLDivElement>;
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
  const [seatSize, setSeatSize] = useState(90); // 좌석 크기 넉넉히
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: Number(value) || value,
    }));
  };

  /** 좌석 생성 */
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
          ref: React.createRef<HTMLDivElement>(),
        });
        seatNum++;
      }
    }
    setSeats(seatArr);
  };

  /** 좌석 클릭 -> IP 입력 */
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

  /** 드래그 중첩 방지 */
  const handleDragStop = (seatNum: number, data: { x: number; y: number }) => {
    const snappedX = Math.round(data.x / seatSize) * seatSize;
    const snappedY = Math.round(data.y / seatSize) * seatSize;

    // 중복 좌표 체크
    const overlap = seats.some(
      (s) => s.seatNum !== seatNum && s.posX === snappedX && s.posY === snappedY
    );
    if (overlap) return; // 중첩 방지

    setSeats((prev) =>
      prev.map((s) =>
        s.seatNum === seatNum
          ? {
            ...s,
            posX: snappedX,
            posY: snappedY,
            x: snappedX / seatSize + 1,
            y: snappedY / seatSize + 1,
          }
          : s
      )
    );
  };

  /** 등록 요청 */
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

  /** 화면 크기 따라 자동 크기 조정 */
  useEffect(() => {
    const updateLayout = () => {
      if (!form.width || !form.height) return;

      const availableWidth = window.innerWidth * 0.65;
      const availableHeight = window.innerHeight * 0.75;

      const seatWidth = availableWidth / form.width;
      const seatHeight = availableHeight / form.height;
      const size = Math.min(seatWidth, seatHeight, 120); // 최대 120px 제한

      setSeatSize(size);
      setContainerSize({
        width: form.width * size,
        height: form.height * size,
      });
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [form.width, form.height]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

          {/* 좌석판 */}
          <div
            className="flex-shrink-0 relative border border-border rounded bg-gray-100 overflow-auto shadow-inner"
            style={{
              width: containerSize.width,
              height: containerSize.height,
              backgroundImage:
                "linear-gradient(to right, #e0e0e0 1px, transparent 1px), linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)",
              backgroundSize: `${seatSize}px ${seatSize}px`,
            }}
          >
            {seats.map((seat) => (
              <Draggable
                key={seat.seatNum}
                position={{ x: seat.posX, y: seat.posY }}
                onStop={(e, data) => handleDragStop(seat.seatNum, data)}
                nodeRef={seat.ref}
                bounds="parent"
                grid={[seatSize, seatSize]} // 격자 스냅
              >
                <div
                  ref={seat.ref}
                  onClick={() => handleSeatClick(seat.seatNum)}
                  className={`absolute flex items-center justify-center border-2 rounded-lg cursor-pointer font-semibold text-base transition-all duration-150 select-none
                    ${seat.seatIp
                      ? "bg-green-500 text-white border-green-700 shadow-md"
                      : "bg-white text-gray-800 border-gray-400 hover:bg-gray-200"
                    }`}
                  style={{
                    width: seatSize - 6,
                    height: seatSize - 6,
                    left: seat.posX + 3,
                    top: seat.posY + 3,
                  }}
                >
                  {seat.seatNum}
                </div>
              </Draggable>
            ))}
          </div>

          {/* 피시방 등록 카드 */}
          <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300 flex-1">
            <CardHeader>
              <CardTitle>피시방 등록</CardTitle>
              <CardDescription>
                입력한 가로·세로에 따라 좌석판 자동 조정
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-4">
                <input
                  type="text"
                  name="nameOfPcroom"
                  placeholder="피시방 이름"
                  value={form.nameOfPcroom}
                  onChange={handleInputChange}
                  className="border p-2 rounded focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="number"
                  name="seatCount"
                  placeholder="좌석 수"
                  value={form.seatCount || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="number"
                  name="width"
                  placeholder="가로 배열 수"
                  value={form.width || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="number"
                  name="height"
                  placeholder="세로 배열 수"
                  value={form.height || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="number"
                  name="port"
                  placeholder="포트 번호"
                  value={form.port || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded focus:ring-2 focus:ring-primary/50"
                />
                <Button size="lg" onClick={generateSeats}>
                  좌석 생성
                </Button>
                <Button size="lg" onClick={handleSubmit}>
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PcroomForm;
