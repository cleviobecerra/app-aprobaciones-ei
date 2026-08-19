export async function register() {
  const dns = await import("node:dns");
  dns.setDefaultResultOrder("ipv4first");
}
