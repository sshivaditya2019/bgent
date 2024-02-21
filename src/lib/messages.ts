import { type UUID } from "crypto";
import { BgentRuntime } from "./runtime";
import { type Actor, type Content, type Memory } from "./types";

export async function getMessageActors({
  runtime,
  userIds,
}: {
  runtime: BgentRuntime;
  userIds: UUID[];
}) {
  const response = await runtime.supabase
    .from("accounts")
    .select("*")
    .in("id", userIds);
  if (response.error) {
    console.error(response.error);
    return [];
  }

  const { data } = response;

  const actors = data.map((actor: Actor) => {
    const { name, details, id } = actor;
    return {
      name,
      details,
      id,
    };
  });

  return actors as Actor[];
}

export function formatMessageActors({ actors }: { actors: Actor[] }) {
  const actorStrings = actors.map((actor: Actor) => {
    const header = `${actor.name}${actor.details.tagline ? ": " + actor.details.tagline : ""}\n${actor.details.summary || "No information available"}`;
    return header;
  });
  const finalActorStrings = actorStrings.join("\n");
  return finalActorStrings;
}

export const formatMessages = ({
  messages,
  actors,
}: {
  messages: Memory[];
  actors: Actor[];
}) => {
  const messageStrings = messages
    .reverse()
    .filter((message: Memory) => message.user_id)
    .map((message: Memory) => {
      let messageContent =
        (message.content as Content).content || (message.content as string);
      const messageAction = (message.content as Content).action;
      const sender = actors.find(
        (actor: Actor) => actor.id === message.user_id,
      )!;
      if (messageAction === "IGNORE") {
        messageContent = "*Ignored*";
      }
      return `${sender.name}: ${messageContent} ${messageAction && messageAction !== "null" ? `(${messageAction})` : ""}`;
    })
    .join("\n");
  return messageStrings;
};
