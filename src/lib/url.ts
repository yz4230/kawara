export function extractDomain(url: string) {
  const { hostname } = new URL(url);
  const domainParts = hostname.split(".");
  // if the domain starts with "www.", remove it
  if (domainParts.at(0) === "www") domainParts.shift();
  return domainParts.join(".");
}
