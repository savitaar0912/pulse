import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationAPI } from "../../../api/notifications";
import { toast } from "react-hot-toast";

export const useNotificaation = () => {
  return useQuery({
    queryKey: ["notification"],
    queryFn: notificationAPI.getNotifications,
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient;

  return useMutation({
    mutationFn: notificationAPI.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => {
        toast.error(err.response?.data?.message || 'Mark Read Failed')
    }
  });
};
