// src/pages/ManagerDashboard/PcroomForm.tsx
import { useState } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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
    const cellSize = 60;

    for (let y = 1; y <= form.height; y++) {
      for (let x = 1; x <= form.width; x++) {
        if (seatNum > form.seatCount) break;
        seatArr.push({
          nameOfPcroom: form.nameOfPcroom,
          seatNum,
          seatIp: "",
          x,
          y,
          posX: (x - 1) * cellSize,
          posY: (y - 1) * cellSize,
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

  const handleDrag = (seatNum: number, data: { x: number; y: number }) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.seatNum === seatNum
          ? {
              ...s,
              posX: data.x,
              posY: data.y,
              x: Math.round(data.x / 60) + 1,
              y: Math.round(data.y / 60) + 1,
            }
          : s
      )
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <Navigation />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="max-w-5xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground">
              관리 중인 PC방의 실시간 가동률을 확인할 수 있습니다
            </p>
        
          </div>
        
        <Card className="shadow-subtle hover:shadow-elegant transition-all duration-300">
          <CardHeader>
            <CardTitle>피시방 등록</CardTitle>
            <CardDescription>좌석 격자 및 IP를 설정 후 저장할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 mb-4">
  <input
    type="text"
    name="nameOfPcroom"
    placeholder="피시방 이름"
    value={form.nameOfPcroom}
    onChange={handleInputChange}
    className="border p-2 rounded placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
  />
  <input
  type="number"
  name="seatCount"
  placeholder="좌석 수"
  value={form.seatCount || ""}
  onChange={handleInputChange}
  className="border p-2 rounded placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
/>

<input
  type="number"
  name="width"
  placeholder="가로 배열 수"
  value={form.width || ""}
  onChange={handleInputChange}
  className="border p-2 rounded placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
/>

<input
  type="number"
  name="height"
  placeholder="세로 배열 수"
  value={form.height || ""}
  onChange={handleInputChange}
  className="border p-2 rounded placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
/>

<input
  type="number"
  name="port"
  placeholder="포트"
  value={form.port || ""}
  onChange={handleInputChange}
  className="border p-2 rounded placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
/>


  <Button
    size="lg"
    className="bg-gradient-primary shadow-elegant"
    onClick={generateSeats}
  >
    좌석 격자 생성
  </Button>
</div>


            {seats.length > 0 && (
              <div className="mb-4 relative w-full h-[500px] border border-border rounded">
                {seats.map((seat) => (
                  <Draggable
                    key={seat.seatNum}
                    position={{ x: seat.posX, y: seat.posY }}
                    grid={[60, 60]}
                    onStop={(e, data) => handleDrag(seat.seatNum, data)}
                  >
                    <div
                      onClick={() => handleSeatClick(seat.seatNum)}
                      className={`absolute w-14 h-14 flex items-center justify-center border rounded cursor-pointer text-sm
                        ${seat.seatIp ? "bg-green-400 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                      {seat.seatNum} ({seat.x},{seat.y})
                    </div>
                  </Draggable>
                ))}
              </div>
            )}

            <Button size="lg"
              className="bg-gradient-primary shadow-elegant" onClick={handleSubmit}>저장</Button>
          </CardContent>
        </Card>
      </div>
      </main>
    </div>
  );
};

export default PcroomForm;
