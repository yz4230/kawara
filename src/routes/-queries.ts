import { queryOptions } from "@tanstack/react-query";
import { getUser } from "./-root-fns";

export function userQuery() {
  return queryOptions({
    queryKey: ["user"],
    queryFn: ({ signal }) => getUser({ signal }),
  });
}
