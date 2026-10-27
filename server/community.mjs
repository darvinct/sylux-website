// Keep the default invite aligned with src/data/site.ts. Vercel can override both.
export async function getCommunity(env = process.env) {
  const invite = new URL(env.VITE_DISCORD_INVITE || "https://discord.gg/sylux");
  const parts = invite.pathname.split("/").filter(Boolean);
  const code = invite.hostname === "discord.gg" && parts.length === 1
    ? parts[0]
    : ["discord.com", "www.discord.com"].includes(invite.hostname) && parts.length === 2 && parts[0] === "invite"
      ? parts[1]
      : null;
  if (invite.protocol !== "https:" || !code || !/^[\w-]{2,100}$/.test(code))
    throw new Error("Invalid community invite");
  const response = await fetch(
    `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`,
    { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) {
    console.warn("Discord community unavailable", { status: response.status });
    throw new Error("Discord community unavailable");
  }
  const data = await response.json();
  if (![data.approximate_member_count, data.approximate_presence_count].every(
    (value) => Number.isSafeInteger(value) && value >= 0,
  )) throw new Error("Invalid Discord counts");
  // Only public counts leave the server; invite metadata and credentials do not.
  return {
    total: data.approximate_member_count,
    online: data.approximate_presence_count,
  };
}
