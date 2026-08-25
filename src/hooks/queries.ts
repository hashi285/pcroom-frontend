import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

export interface Pcroom {
  pcroomId: number;
  nameOfPcroom: string;
  utilization?: number;
}

export interface Favorite {
  pcroomId: number;
  nameOfPcroom: string;
  utilization?: number;
  seatCount?: number;
  usedSeatCount?: number;
}

export const usePcrooms = (searchName?: string) => {
  return useQuery({
    queryKey: ["pcrooms", searchName],
    queryFn: async () => {
      const params = searchName ? { name: searchName } : undefined;
      const res = await api.get("/pcrooms", { params });
      
      const data = res.data;
      if (Array.isArray(data)) return data as Pcroom[];
      if (data?.pcrooms && Array.isArray(data.pcrooms)) return data.pcrooms as Pcroom[];
      return [];
    },
  });
};

export const useFavorites = (partySize: number = 1) => {
  return useQuery({
    queryKey: ["favorites", partySize],
    queryFn: async () => {
      const res = await api.get("/favorites", { params: { partySize } });
      const data = res.data;
      
      if (Array.isArray(data)) {
        // 병렬로 가동률 상세 데이터를 조회합니다.
        const favoritesWithUtil = await Promise.all(
          data.map(async (fav: any) => {
            try {
              const utilRes = await api.get(`/pcrooms/${fav.pcroomId}/utilization`);
              return {
                pcroomId: fav.pcroomId,
                nameOfPcroom: fav.nameOfPcroom ?? fav.pcroomName ?? "이름 없음",
                utilization: utilRes.data?.utilization ?? 0,
                seatCount: utilRes.data?.seatCount ?? 0,
                usedSeatCount: utilRes.data?.usedSeatCount ?? 0,
              } as Favorite;
            } catch (error) {
              return {
                pcroomId: fav.pcroomId,
                nameOfPcroom: fav.nameOfPcroom ?? fav.pcroomName ?? "이름 없음",
                utilization: 0,
                seatCount: 0,
                usedSeatCount: 0,
              } as Favorite;
            }
          })
        );
        return favoritesWithUtil.sort((a, b) => b.pcroomId - a.pcroomId);
      }
      return [];
    },
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pcroomId: number) => {
      const res = await api.post(`/favorites/${pcroomId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["pcrooms"] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pcroomId: number) => {
      const res = await api.delete(`/favorites/${pcroomId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

export const usePcroomInfo = (pcroomId: number) => {
  return useQuery({
    queryKey: ["pcroom", pcroomId, "info"],
    queryFn: async () => {
      const res = await api.get(`/pcrooms/pcroomInfo/${pcroomId}`);
      return res.data;
    },
    enabled: !!pcroomId,
  });
};

export const usePcroomUtilization = (pcroomId: number) => {
  return useQuery({
    queryKey: ["pcroom", pcroomId, "utilization"],
    queryFn: async () => {
      const res = await api.get(`/pcrooms/${pcroomId}/utilization`);
      return res.data;
    },
    enabled: !!pcroomId,
    refetchInterval: 30000, // 30초마다 갱신
  });
};

export const usePcroomNotices = (pcroomId: number) => {
  return useQuery({
    queryKey: ["pcroom", pcroomId, "notices"],
    queryFn: async () => {
      const res = await api.get(`/notices/${pcroomId}`);
      if (Array.isArray(res.data)) return res.data;
      return [];
    },
    enabled: !!pcroomId,
  });
};

export const useManagerFavorites = () => {
  return useQuery({
    queryKey: ["manager-favorites"],
    queryFn: async () => {
      const res = await api.get("/manager-favorites/favorite");
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useManagerUtilization = (hours: number = 24) => {
  return useQuery({
    queryKey: ["manager-utilization", hours],
    queryFn: async () => {
      const res = await api.get("/manager-favorites", { params: { hours } });
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useAddManagerFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pcroomId: number) => {
      await api.post(`/manager-favorites/${pcroomId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["manager-utilization"] });
      queryClient.invalidateQueries({ queryKey: ["pcrooms"] });
    },
  });
};

export const useRemoveManagerFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pcroomId: number) => {
      await api.delete(`/manager-favorites/${pcroomId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["manager-utilization"] });
    },
  });
};
