import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../../../api/users";

export const useSearch = (query) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => userAPI.searchUsers(query),
    enabled: !!query && query.length > 0,
  });
};
