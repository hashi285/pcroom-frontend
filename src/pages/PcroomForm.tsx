// src/pages/PcroomForm.tsx
import { useState } from "react";
import api from "@/api/axiosInstance";
import { Rnd } from "react-rnd";
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

interface CanvasElement {
  id: string;
  type: "SEAT" | "WALL" | "TOILET" | "COUNTER" | "SMOKING_ROOM";
  x: number;
  y: number;
  width: number;
  seatNum?: number;
  seatIp?: string;
  seatType?: "NORMAL" | "COUPLE" | "TEAM";
}

const PcroomForm = () => {
  const [form, setForm] = useState<PcroomFormData>({
    nameOfPcroom: "",
    seatCount: 0,
    port: 8080,
    width: 1200,
    height: 800,
  });

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [nextSeatNum, setNextSeatNum] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: Number(value) || value,
    }));
  };

  const addElement = (type: CanvasElement["type"], seatType?: CanvasElement["seatType"], customWidth?: number, customHeight?: number) => {
    const el: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      seatType,
      x: 100,
      y: 100,
      width: customWidth || (type === "SEAT" ? 50 : 100),
      height: customHeight || (type === "SEAT" ? 50 : 100),
    };
    if (type === "SEAT") {
      el.seatNum = nextSeatNum;
      setNextSeatNum((n) => n + 1);
      setForm((prev) => ({ ...prev, seatCount: prev.seatCount + 1 }));
    }
    setElements([...elements, el]);
  };

  const handleSeatClick = (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (el && el.type === "SEAT") {
      const ip = prompt("IP를 입력하세요:", el.seatIp || "");
      if (ip !== null) {
        setElements(
          elements.map((e) => (e.id === id ? { ...e, seatIp: ip } : e))
        );
      }
    }
  };

  const removeElement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const el = elements.find((el) => el.id === id);
    if (el?.type === "SEAT") {
      setForm((prev) => ({ ...prev, seatCount: prev.seatCount - 1 }));
    }
    setElements(elements.filter((el) => el.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      alert("AI가 도면을 분석 중입니다. 약간의 시간이 소요될 수 있습니다.");

      const res = await api.post("/pcrooms/auto-layout", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const aiElements = res.data.elements;
      if (aiElements && Array.isArray(aiElements) && aiElements.length > 0) {
        let currentSeatNum = nextSeatNum;
        const newElements = aiElements.map((el: Omit<CanvasElement, 'id'>) => {
          const newEl: CanvasElement = {
            ...el,
            id: Math.random().toString(36).substr(2, 9),
          };
          if (el.type === "SEAT") {
            newEl.seatNum = currentSeatNum++;
          }
          return newEl;
        });
        
        setElements((prev) => [...prev, ...newElements]);
        setNextSeatNum(currentSeatNum);
        setForm((prev) => ({ 
          ...prev, 
          seatCount: prev.seatCount + newElements.filter((e: CanvasElement) => e.type === "SEAT").length 
        }));
        alert(`AI 분석 완료! ${newElements.length}개의 요소가 자동 배치되었습니다.`);
      } else {
        alert("AI가 도면에서 좌석을 찾지 못했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("AI 분석 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!form.nameOfPcroom) {
        alert("피시방 이름을 입력해주세요.");
        return;
      }
      
      // 1. 피시방 정보 저장
      const res = await api.post("/manager/pcrooms", form);
      const pcroomId = res.data.pcroomId;

      // 2. 좌석 정보 저장
      const seats = elements
        .filter((e) => e.type === "SEAT")
        .map((e) => ({
          nameOfPcroom: form.nameOfPcroom,
          seatNum: e.seatNum,
          seatIp: e.seatIp || "0.0.0.0",
          seatType: e.seatType || "NORMAL",
          x: Math.round(e.x),
          y: Math.round(e.y),
        }));
      if (seats.length > 0) {
        await api.post("/manager/pcrooms/seats", seats);
      }

      // 3. 구조물 정보 저장
      const structures = elements
        .filter((e) => e.type !== "SEAT")
        .map((e) => ({
          nameOfPcroom: form.nameOfPcroom,
          type: e.type,
          x: Math.round(e.x),
          y: Math.round(e.y),
          width: Math.round(e.width),
          height: Math.round(e.height),
        }));
      if (structures.length > 0) {
        await api.post(`/manager/pcrooms/${pcroomId}/structures`, structures);
      }

      // 4. 소유권 등록
      await api.post(`/manager/pcrooms/${pcroomId}`);

      alert("피시방과 좌석/구조물 배치가 성공적으로 저장되었습니다!");
      setForm({
        nameOfPcroom: "",
        seatCount: 0,
        port: 8080,
        width: 1200,
        height: 800,
      });
      setElements([]);
      setNextSeatNum(1);
    } catch (err) {
      console.error(err);
      alert("저장 실패! 개발자 도구 콘솔을 확인해주세요.");
    }
  };

  const getElementColor = (type: CanvasElement["type"], seatType?: CanvasElement["seatType"]) => {
    switch (type) {
      case "SEAT":
        return "bg-blue-500 text-white border border-blue-600/50";
      case "WALL":
        return "bg-zinc-700 text-white border-2 border-zinc-900";
      case "TOILET":
        return "bg-cyan-500 text-white";
      case "COUNTER":
        return "bg-amber-500 text-white";
      case "SMOKING_ROOM":
        return "bg-red-400 text-white";
      default:
        return "bg-zinc-400 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-6">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* 사이드바 (설정 및 팔레트) */}
          <div className="flex flex-col gap-4 w-full lg:w-1/4">
            <Card className="shadow-sm bg-white/80 dark:bg-zinc-800/80 border border-border rounded-xl">
              <CardHeader>
                <CardTitle>피시방 기본 정보</CardTitle>
                <CardDescription>도면 크기와 기본 정보</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
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
                  name="width"
                  placeholder="도면 가로(픽셀)"
                  value={form.width}
                  onChange={handleInputChange}
                  className="border p-2 rounded focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="number"
                  name="height"
                  placeholder="도면 세로(픽셀)"
                  value={form.height}
                  onChange={handleInputChange}
                  className="border p-2 rounded focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-sm text-zinc-500">총 좌석 수: {form.seatCount}개</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm bg-white/80 dark:bg-zinc-800/80 border border-border rounded-xl">
              <CardHeader>
                <CardTitle>배치 도구</CardTitle>
                <CardDescription>아이템을 클릭해 도화지에 추가하세요.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => addElement("SEAT", "NORMAL")}>💻 일반석</Button>
                <Button variant="outline" onClick={() => addElement("SEAT", "COUPLE")}>👩‍❤️‍👨 커플석</Button>
                <Button variant="outline" onClick={() => addElement("SEAT", "TEAM")}>👥 팀좌석</Button>
                <Button variant="outline" onClick={() => addElement("WALL", undefined, 200, 20)}>🧱 가로 벽</Button>
                <Button variant="outline" onClick={() => addElement("WALL", undefined, 20, 200)}>🧱 세로 벽</Button>
                <Button variant="outline" onClick={() => addElement("TOILET")}>🚻 화장실</Button>
                <Button variant="outline" onClick={() => addElement("COUNTER")}>🏪 카운터</Button>
                <Button variant="outline" className="col-span-2" onClick={() => addElement("SMOKING_ROOM")}>🚬 흡연실</Button>
                
                <div className="col-span-2 relative mt-4">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="도면 이미지 업로드"
                  />
                  <Button variant="default" className="w-full bg-gradient-primary font-bold text-white pointer-events-none">
                    📸 도면 이미지 AI 자동 배치
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full font-bold" onClick={handleSubmit}>
              💾 최종 도면 저장
            </Button>
          </div>

          {/* 에디터 캔버스 */}
          <Card className="relative w-full lg:w-3/4 flex-1 p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-md h-[80vh] overflow-auto">
            <CardHeader className="pb-3 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white z-10 dark:bg-zinc-900">
              <CardTitle className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                자유 배치 에디터 (마우스로 요소를 드래그/리사이즈 하세요)
              </CardTitle>
            </CardHeader>
            <CardContent className="relative mt-4">
              <div
                className="relative bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 mx-auto rounded overflow-hidden"
                style={{ width: form.width, height: form.height }}
              >
                {elements.map((el) => (
                  <Rnd
                    key={el.id}
                    bounds="parent"
                    dragGrid={[10, 10]}
                    size={{ width: el.width, height: el.height }}
                    position={{ x: el.x, y: el.y }}
                    onDragStop={(e, d) => {
                      setElements(
                        elements.map((item) =>
                          item.id === el.id ? { ...item, x: d.x, y: d.y } : item
                        )
                      );
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      setElements(
                        elements.map((item) =>
                          item.id === el.id
                            ? {
                                ...item,
                                width: parseInt(ref.style.width, 10),
                                height: parseInt(ref.style.height, 10),
                                ...position,
                              }
                            : item
                        )
                      );
                    }}
                    enableResizing={el.type !== "SEAT"} // 좌석은 고정 크기, 구조물은 크기 조절 가능
                  >
                    <div
                      className={`relative w-full h-full flex items-center justify-center font-bold text-sm rounded-md cursor-move ${getElementColor(
                        el.type,
                        el.seatType
                      )}`}
                      onClick={() => handleSeatClick(el.id)}
                    >
                      {el.type === "SEAT" ? el.seatNum : el.type}
                      
                      {/* 삭제 X 버튼 */}
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-opacity"
                        onClick={(e) => removeElement(el.id, e)}
                        title="삭제"
                      >
                        X
                      </button>
                    </div>
                  </Rnd>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PcroomForm;
