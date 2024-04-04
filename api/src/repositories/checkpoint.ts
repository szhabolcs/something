import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { user, checkpoint, thing } from "./schema";

export async function updateCheckpoint(
  user_uuid: string,
  thing_uuid: string,
  photoUuid: string
) {
  const updated = await db
    .update(checkpoint)
    .set({
      completed: true,
      photoUuid: photoUuid,
      utcTimestamp: new Date(),
    })
    .where(
      and(
        eq(checkpoint.userUuid, user_uuid),
        eq(checkpoint.thingUuid, thing_uuid)
      )
    )
    .returning();
}
