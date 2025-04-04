import "disposablestack/auto";
import pc from "picocolors";
import { db, driver } from "~/lib/server/db";
import { articles } from "~/lib/server/schema";

async function main() {
  await using cleanup = new AsyncDisposableStack();
  cleanup.defer(() => driver.end());
  const deleted = await db.delete(articles).returning({ id: articles.id });
  console.log(pc.green(`✅ Deleted ${deleted.length} feed articles`));
}

if (require.main === module) {
  await main();
}
