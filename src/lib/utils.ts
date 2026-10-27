export function inviteCode(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const path = url.pathname.split("/").filter(Boolean);
    const code =
      url.hostname === "discord.gg" && path.length === 1
        ? path[0]
        : ["discord.com", "www.discord.com"].includes(url.hostname) &&
            path[0] === "invite" &&
            path.length === 2
          ? path[1]
          : null;
    return code && /^[\w-]{2,100}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

export function filterMembers<
  T extends { name: string; role: string; handle: string; division?: string },
>(members: T[], query: string, role: string, sorted: boolean) {
  const q = query.trim().toLocaleLowerCase();
  const result = members.filter(
    (m) =>
      `${m.name} ${m.role} ${m.handle} ${m.division || ""}`.toLocaleLowerCase().includes(q) &&
      (!role || role === m.role),
  );
  return sorted ? result.sort((a, b) => a.name.localeCompare(b.name)) : result;
}
