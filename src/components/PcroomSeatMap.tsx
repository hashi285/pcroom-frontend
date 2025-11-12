import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Seat {
  id: number;
  top: string;
  left: string;
  status: "occupied" | "available";
}

const PcroomSeatMap = () => {
  // 더미 데이터 (테스트용)
  const seats: Seat[] = [
    { id: 1, top: "10px", left: "10px", status: "available" },
    { id: 2, top: "10px", left: "50px", status: "occupied" },
    { id: 3, top: "10px", left: "90px", status: "available" },
    { id: 4, top: "50px", left: "10px", status: "occupied" },
    { id: 5, top: "50px", left: "50px", status: "available" },
    { id: 6, top: "50px", left: "90px", status: "occupied" },
    { id: 7, top: "90px", left: "10px", status: "available" },
    { id: 8, top: "90px", left: "50px", status: "available" },
    { id: 9, top: "90px", left: "90px", status: "occupied" },
  ];

  return (
    <Card className="relative p-4 dark:bg-zinc-900/50 bg-white border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          좌석 배치도
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="relative h-[500px] overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="relative w-[150%] h-[150%] p-4">
            {seats.map((seat) => (
              <div
                key={seat.id}
                className={`seat absolute flex items-center justify-center text-[10px] font-bold rounded-sm ${
                  seat.status === "occupied" ? "bg-blue-500" : "bg-zinc-600"
                } text-white`}
                style={{
                  top: seat.top,
                  left: seat.left,
                  width: "32px",
                  height: "32px",
                }}
              >
                {seat.id}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PcroomSeatMap;
