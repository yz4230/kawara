import "disposablestack/auto";
import pc from "picocolors";
import { db, driver } from "~/lib/server/db";
import { feedEntry } from "~/lib/server/schema";

async function main() {
  await using cleanup = new AsyncDisposableStack();
  cleanup.defer(() => driver.end());
  const deleted = await db.delete(feedEntry).returning({ id: feedEntry.id });
  console.log(pc.green(`✅ Deleted ${deleted.length} feed entries`));
}

if (require.main === module) {
  await main();
}
