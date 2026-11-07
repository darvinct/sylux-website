// A slash alone is insufficient: URL parsers also normalize backslashes.
export function authDestination(value: string | null): "/admin" | "/request" {
  return value === "/admin" ? "/admin" : "/request";
}
