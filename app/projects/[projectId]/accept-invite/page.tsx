// This is a Server Component
import AcceptInviteClient from "./AcceptInviteClient";

export default async function AcceptInvitePage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = await Promise.resolve(params);

  return <AcceptInviteClient projectId={projectId} />;
}
